package com.hallyx.workflowsystem.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a requested resource (Workflow, Step, Execution) is not found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends WorkflowException {
    public ResourceNotFoundException(String resource, String id) {
        super(String.format("%s with ID %s not found", resource, id), "RESOURCE_NOT_FOUND");
    }
}
