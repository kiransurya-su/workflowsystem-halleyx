package com.hallyx.workflowsystem.services;

import com.hallyx.workflowsystem.models.Rule;
import com.hallyx.workflowsystem.repositories.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RuleService {
    private final RuleRepository ruleRepository;

    public Rule saveRule(Rule rule) {
        return ruleRepository.save(rule);
    }

    public Optional<Rule> getRuleById(UUID id) {
        return ruleRepository.findById(id);
    }

    public void deleteRule(UUID id) {
        ruleRepository.deleteById(id);
    }
}
