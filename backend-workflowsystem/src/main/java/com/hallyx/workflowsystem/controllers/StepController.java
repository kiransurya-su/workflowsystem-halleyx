package com.hallyx.workflowsystem.controllers;

import com.hallyx.workflowsystem.models.Step;
import com.hallyx.workflowsystem.models.Workflow;
import com.hallyx.workflowsystem.services.StepService;
import com.hallyx.workflowsystem.services.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StepController {

    private final StepService stepService;
    private final WorkflowService workflowService;

    @GetMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<List<Step>> getSteps(@PathVariable("workflowId") UUID workflowId) {
        return workflowService.getWorkflowById(workflowId)
                .map(workflow -> ResponseEntity.ok(workflow.getSteps()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<Step> addStep(@PathVariable("workflowId") UUID workflowId, @RequestBody Step step) {
        Workflow workflow = workflowService.getWorkflowById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
        
        step.setWorkflow(workflow);
        Step savedStep = stepService.saveStep(step);

        if (workflow.getStartStepId() == null) {
            workflow.setStartStepId(savedStep.getId());
            workflowService.createWorkflow(workflow);
        }

        return ResponseEntity.ok(savedStep);
    }

    @PutMapping("/steps/{id}")
    public ResponseEntity<Step> updateStep(@PathVariable("id") UUID id, @RequestBody Step step) {
        return stepService.getStepById(id)
                .map(existing -> {
                    step.setId(id);
                    step.setWorkflow(existing.getWorkflow());
                    return ResponseEntity.ok(stepService.saveStep(step));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/steps/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable("id") UUID id) {
        stepService.deleteStep(id);
        return ResponseEntity.noContent().build();
    }
}
