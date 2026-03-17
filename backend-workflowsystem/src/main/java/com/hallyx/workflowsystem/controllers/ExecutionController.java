package com.hallyx.workflowsystem.controllers;

import com.hallyx.workflowsystem.models.Execution;
import com.hallyx.workflowsystem.models.ExecutionLog;
import com.hallyx.workflowsystem.services.ExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExecutionController {

    private final ExecutionService executionService;

    @PostMapping("/workflows/{workflowId}/execute")
    public ResponseEntity<Execution> startExecution(
            @PathVariable("workflowId") UUID workflowId, 
            @RequestBody Map<String, Object> initialData,
            @RequestParam(value = "triggeredBy", required = false) UUID triggeredBy) {
        return ResponseEntity.ok(executionService.startExecution(workflowId, initialData, triggeredBy));
    }

    @GetMapping("/executions")
    public ResponseEntity<Page<Execution>> getExecutions(Pageable pageable) {
        return ResponseEntity.ok(executionService.getExecutions(pageable));
    }

    @GetMapping("/executions/{id}")
    public ResponseEntity<Execution> getExecution(@PathVariable("id") UUID id) {
        return executionService.getExecutionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/executions/{id}/logs")
    public ResponseEntity<List<ExecutionLog>> getExecutionLogs(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(executionService.getExecutionLogs(id));
    }

    @PostMapping("/executions/{id}/process")
    public ResponseEntity<Execution> processStep(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(executionService.processStep(id));
    }

    @PostMapping("/executions/{id}/cancel")
    public ResponseEntity<Void> cancelExecution(@PathVariable("id") UUID id) {
        executionService.cancelExecution(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/executions/{id}/action")
    public ResponseEntity<Execution> submitAction(
            @PathVariable("id") UUID id,
            @RequestParam("stepId") UUID stepId,
            @RequestParam("decision") String decision,
            @RequestParam(value = "approverId", required = false) String approverId) {
        return ResponseEntity.ok(executionService.submitAction(id, stepId, decision, approverId));
    }

    @PostMapping("/executions/{id}/retry")
    public ResponseEntity<Execution> retryExecution(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(executionService.retryExecution(id));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(executionService.getMetrics());
    }
}
