package com.hallyx.workflowsystem.controllers;

import com.hallyx.workflowsystem.models.Rule;
import com.hallyx.workflowsystem.models.Step;
import com.hallyx.workflowsystem.services.RuleService;
import com.hallyx.workflowsystem.services.StepService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RuleController {

    private final RuleService ruleService;
    private final StepService stepService;

    @GetMapping("/steps/{stepId}/rules")
    public ResponseEntity<List<Rule>> getRules(@PathVariable("stepId") UUID stepId) {
        return stepService.getStepById(stepId)
                .map(step -> ResponseEntity.ok(step.getRules()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/steps/{stepId}/rules")
    public ResponseEntity<Rule> addRule(@PathVariable("stepId") UUID stepId, @RequestBody Rule rule) {
        Step step = stepService.getStepById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));
        
        // Associate rule with step and save
        rule.setSourceStep(step);
        return ResponseEntity.ok(ruleService.saveRule(rule));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<Rule> updateRule(@PathVariable("id") UUID id, @RequestBody Rule rule) {
        return ruleService.getRuleById(id)
                .map(existing -> {
                    rule.setId(id);
                    rule.setSourceStep(existing.getSourceStep());
                    return ResponseEntity.ok(ruleService.saveRule(rule));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable("id") UUID id) {
        ruleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }
}
