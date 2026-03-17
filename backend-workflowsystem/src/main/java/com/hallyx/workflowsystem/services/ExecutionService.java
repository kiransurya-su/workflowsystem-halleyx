package com.hallyx.workflowsystem.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hallyx.workflowsystem.models.*;
import com.hallyx.workflowsystem.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExecutionService {

    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository executionLogRepository;
    private final WorkflowRepository workflowRepository;
    private final RuleEngineService ruleEngineService;
    private final ObjectMapper objectMapper;

    @Transactional
    public Execution startExecution(UUID workflowId, Map<String, Object> initialData, UUID triggeredBy) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        Execution execution = new Execution();
        execution.setWorkflow(workflow);
        execution.setWorkflowVersion(workflow.getVersion());
        try {
            execution.setData(objectMapper.writeValueAsString(initialData));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize execution data", e);
        }
        execution.setStatus("IN_PROGRESS");
        execution.setTriggeredBy(triggeredBy);
        execution.setStartedAt(LocalDateTime.now());
        execution.setIterationCount(0);
        execution.setCurrentStepId(workflow.getStartStepId());

        Execution saved = executionRepository.save(execution);
        return processStep(saved.getId());
    }

    @Transactional
    public Execution processStep(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));

        if (!"IN_PROGRESS".equals(execution.getStatus()) && !"AWAITING_APPROVAL".equals(execution.getStatus())) {
            return execution;
        }

        if (execution.getIterationCount() >= execution.getWorkflow().getMaxIterations()) {
            execution.setStatus("FAILED");
            log.error("Execution {} exceeded max iterations", executionId);
            return executionRepository.save(execution);
        }

        UUID currentStepId = execution.getCurrentStepId();
        if (currentStepId == null) {
            execution.setStatus("COMPLETED");
            execution.setEndedAt(LocalDateTime.now());
            return executionRepository.save(execution);
        }

        Step currentStep = execution.getWorkflow().getSteps().stream()
                .filter(s -> s.getId().equals(currentStepId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Step not found: " + currentStepId));

        // Create log entry
        ExecutionLog logEntry = new ExecutionLog();
        logEntry.setExecution(execution);
        logEntry.setStepName(currentStep.getName());
        logEntry.setStepType(currentStep.getType().toString());
        logEntry.setStartedAt(LocalDateTime.now());

        Map<String, Object> dataMap;
        try {
            dataMap = objectMapper.readValue(execution.getData(), new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            dataMap = new HashMap<>(); // Fallback
        }

        // Handle Approval steps
        if (currentStep.getType() == StepType.APPROVAL) {
            String decisionKey = "_decision_" + currentStep.getId();
            if (!dataMap.containsKey(decisionKey)) {
                execution.setStatus("AWAITING_APPROVAL");
                logEntry.setStatus("awaiting_approval");
                executionLogRepository.save(logEntry);
                return executionRepository.save(execution);
            }
            logEntry.setApproverId((String) dataMap.get("_approver_" + currentStep.getId()));
        }

        // Evaluate rules
        final Map<String, Object> finalDataMap = dataMap;
        Optional<Rule> matchedRule = currentStep.getRules().stream()
                .sorted(Comparator.comparing(Rule::getPriority))
                .filter(rule -> ruleEngineService.evaluate(rule.getCondition(), finalDataMap))
                .findFirst();
        
        logEntry.setEvaluatedRules("true");
        if (matchedRule.isPresent()) {
            UUID nextStepId = matchedRule.get().getNextStepId();
            logEntry.setSelectedNextStep(nextStepId != null ? nextStepId.toString() : "END");
            execution.setCurrentStepId(nextStepId);
        } else {
            logEntry.setSelectedNextStep("END");
            execution.setCurrentStepId(null);
        }

        logEntry.setStatus("completed");
        logEntry.setEndedAt(LocalDateTime.now());
        executionLogRepository.save(logEntry);

        execution.setIterationCount(execution.getIterationCount() + 1);
        execution.setStatus("IN_PROGRESS");
        
        Execution saved = executionRepository.save(execution);
        
        if (saved.getCurrentStepId() != null) {
            return processStep(saved.getId());
        } else {
            saved.setStatus("COMPLETED");
            saved.setEndedAt(LocalDateTime.now());
            return executionRepository.save(saved);
        }
    }

    @Transactional
    public Execution submitAction(UUID id, UUID stepId, String decision, String approverId) {
        Execution execution = executionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        
        try {
            Map<String, Object> data = objectMapper.readValue(execution.getData(), new TypeReference<Map<String, Object>>() {});
            data.put("_decision_" + stepId, decision);
            if (approverId != null) {
                data.put("_approver_" + stepId, approverId);
            }
            execution.setData(objectMapper.writeValueAsString(data));
            execution.setStatus("IN_PROGRESS");
            
            return processStep(id);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to process execution data", e);
        }
    }

    public Page<Execution> getExecutions(Pageable pageable) {
        return executionRepository.findAll(pageable);
    }

    public Optional<Execution> getExecutionById(UUID id) {
        return executionRepository.findById(id);
    }

    public List<ExecutionLog> getExecutionLogs(UUID executionId) {
        return executionLogRepository.findByExecutionIdOrderByStartedAtAsc(executionId);
    }

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("total", executionRepository.count());
        metrics.put("activeWorkflows", workflowRepository.count());
        metrics.put("completed", executionRepository.countByStatus("COMPLETED"));
        metrics.put("failed", executionRepository.countByStatus("FAILED"));
        metrics.put("in_progress", executionRepository.countByStatus("IN_PROGRESS"));
        return metrics;
    }

    @Transactional
    public void cancelExecution(UUID id) {
        executionRepository.findById(id).ifPresent(e -> {
            e.setStatus("CANCELED");
            e.setEndedAt(LocalDateTime.now());
            executionRepository.save(e);
        });
    }

    @Transactional
    public Execution retryExecution(UUID id) {
        Execution execution = executionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        execution.setStatus("IN_PROGRESS");
        execution.setIterationCount(0);
        return processStep(id);
    }
}
