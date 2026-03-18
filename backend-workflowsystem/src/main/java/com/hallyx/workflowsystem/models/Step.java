package com.hallyx.workflowsystem.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a single logical unit of work within a Workflow.
 * Steps can be of various types (e.g., TASK, APPROVAL, CONDITION) and are 
 * connected via Rules to form a functional pipeline.
 */
@Entity
@Table(name = "steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "handler"}, ignoreUnknown = true)
public class Step {

    /**
     * Unique identifier for the step.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "step_type")
    @JsonProperty("stepType")
    private StepType type;

    @Column(name = "step_order")
    private Integer order;

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    @JsonBackReference
    private Workflow workflow;

    @OneToMany(mappedBy = "sourceStep", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Rule> rules = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
