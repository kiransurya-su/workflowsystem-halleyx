package com.hallyx.workflowsystem.exceptions;


/**
 * Base exception for all workflow-related errors.
 * Provides a human-readable message and optional error code.
 */
public class WorkflowException extends RuntimeException {
    
    private final String errorCode;

    public WorkflowException(String message) {
        super(message);
        this.errorCode = "INTERNAL_ERROR";
    }

    public WorkflowException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public WorkflowException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
