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
        // Ensure startStepId is set to the first step if missing
        if (workflow.getStartStepId() == null && workflow.getSteps() != null && !workflow.getSteps().isEmpty()) {
            // If the step has an ID (e.g. from frontend or generated), use it.
            // But since it's a new save, IDs are generated at persistence.
            // We'll rely on a post-save update if needed, but usually, 
            // if the frontend doesn't provide it, the first step is a good default.
            workflow.setStartStepId(null); // Will be set after save or manually in UI
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
                    Workflow newVersion = new Workflow();
                    newVersion.setName(workflow.getName() != null ? workflow.getName() : existing.getName());
                    newVersion.setInputSchema(workflow.getInputSchema() != null ? workflow.getInputSchema() : existing.getInputSchema());
                    newVersion.setIsActive(workflow.getIsActive() != null ? workflow.getIsActive() : existing.getIsActive());
                    newVersion.setMaxIterations(workflow.getMaxIterations() != null ? workflow.getMaxIterations() : existing.getMaxIterations());
                    newVersion.setVersion(existing.getVersion() + 1);
                    
                    if (workflow.getSteps() != null && !workflow.getSteps().isEmpty()) {
                        newVersion.setSteps(workflow.getSteps());
                        setRelationships(newVersion);
                    }
                    
                    if (workflow.getStartStepId() != null) {
                        newVersion.setStartStepId(workflow.getStartStepId());
                    } else if (newVersion.getSteps() != null && !newVersion.getSteps().isEmpty()) {
                        // Keep start step from existing if possible, or leave null for manual set
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
