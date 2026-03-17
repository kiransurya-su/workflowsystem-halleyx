package com.hallyx.workflowsystem.controllers;

import com.hallyx.workflowsystem.models.Workflow;
import com.hallyx.workflowsystem.services.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@RequestBody Workflow workflow) {
        setRelationships(workflow);
        if (workflow.getStartStepId() == null && workflow.getSteps() != null && !workflow.getSteps().isEmpty()) {
            workflow.setStartStepId(workflow.getSteps().get(0).getId());
        }
        return ResponseEntity.ok(workflowService.createWorkflow(workflow));
    }

    @GetMapping
    public ResponseEntity<Page<Workflow>> getAllWorkflows(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(workflowService.getWorkflows(pageable, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflowById(@PathVariable("id") UUID id) {
        return workflowService.getWorkflowById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(@PathVariable("id") UUID id, @RequestBody Workflow workflow) {
        return workflowService.getWorkflowById(id)
                .map(existing -> {
                    // Create new version
                    Workflow newVersion = new Workflow();
                    newVersion.setName(workflow.getName() != null ? workflow.getName() : existing.getName());
                    newVersion.setInputSchema(workflow.getInputSchema() != null ? workflow.getInputSchema() : existing.getInputSchema());
                    newVersion.setIsActive(workflow.getIsActive() != null ? workflow.getIsActive() : existing.getIsActive());
                    newVersion.setMaxIterations(workflow.getMaxIterations() != null ? workflow.getMaxIterations() : existing.getMaxIterations());
                    newVersion.setVersion(existing.getVersion() + 1);
                    
                    // Copy steps if they were provided
                    if (workflow.getSteps() != null && !workflow.getSteps().isEmpty()) {
                        newVersion.setSteps(workflow.getSteps());
                        setRelationships(newVersion);
                    }
                    
                    // Set start step
                    if (workflow.getStartStepId() != null) {
                        newVersion.setStartStepId(workflow.getStartStepId());
                    } else if (newVersion.getSteps() != null && !newVersion.getSteps().isEmpty()) {
                        newVersion.setStartStepId(newVersion.getSteps().get(0).getId());
                    } else {
                        newVersion.setStartStepId(existing.getStartStepId());
                    }
                    
                    return ResponseEntity.ok(workflowService.createWorkflow(newVersion));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void setRelationships(Workflow workflow) {
        if (workflow.getSteps() != null) {
            workflow.getSteps().forEach(step -> {
                step.setWorkflow(workflow);
                if (step.getRules() != null) {
                    step.getRules().forEach(rule -> rule.setSourceStep(step));
                }
            });
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable("id") UUID id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }
}
