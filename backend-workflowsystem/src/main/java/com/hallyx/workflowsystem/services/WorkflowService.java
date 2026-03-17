package com.hallyx.workflowsystem.services;
import com.hallyx.workflowsystem.models.Step;
import com.hallyx.workflowsystem.models.Workflow;
import com.hallyx.workflowsystem.repositories.StepRepository;
import com.hallyx.workflowsystem.repositories.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;

    @Transactional
    public Workflow createWorkflow(Workflow workflow) {
        Workflow saved = workflowRepository.save(workflow);
        if (saved.getStartStepId() == null && saved.getSteps() != null && !saved.getSteps().isEmpty()) {
            saved.setStartStepId(saved.getSteps().get(0).getId());
            return workflowRepository.save(saved);
        }
        return saved;
    }
Line 22:

    public List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }

    public Optional<Workflow> getWorkflowById(UUID id) {
        return workflowRepository.findById(id);
    }

    public Page<Workflow> getWorkflows(Pageable pageable, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return workflowRepository.findByNameContainingIgnoreCase(search, pageable);
        }
        return workflowRepository.findAll(pageable);
    }

    public Optional<Step> getStepById(UUID id) {
        if (id == null) return Optional.empty();
        return stepRepository.findById(id);
    }

    @Transactional
    public void deleteWorkflow(UUID id) {
        workflowRepository.deleteById(id);
    }
}
