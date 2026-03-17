package com.hallyx.workflowsystem.services;

import com.hallyx.workflowsystem.models.Step;
import com.hallyx.workflowsystem.repositories.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StepService {
    private final StepRepository stepRepository;

    public Step saveStep(Step step) {
        return stepRepository.save(step);
    }

    public Optional<Step> getStepById(UUID id) {
        return stepRepository.findById(id);
    }

    public void deleteStep(UUID id) {
        stepRepository.deleteById(id);
    }
}
