package com.hallyx.workflowsystem.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Execution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    private Workflow workflow;

    @Column(name = "workflow_version")
    private Integer workflowVersion;

    @Column(name = "current_step_id")
    private UUID currentStepId;

    @Column(columnDefinition = "TEXT")
    private String data; // JSON representation of input data

    private String status; // pending, in_progress, completed, failed, canceled

    @Column(name = "iteration_count")
    private Integer iterationCount = 0;

    private Integer retries = 0;

    @Column(name = "triggered_by")
    private UUID triggeredBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("startedAt ASC")
    @JsonManagedReference
    private List<ExecutionLog> logs = new ArrayList<>();
}
