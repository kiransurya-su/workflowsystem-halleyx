package com.hallyx.workflowsystem.repositories;

import com.hallyx.workflowsystem.models.Workflow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
    Page<Workflow> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
