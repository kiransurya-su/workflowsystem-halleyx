package com.hallyx.workflowsystem.repositories;

import com.hallyx.workflowsystem.models.Execution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExecutionRepository extends JpaRepository<Execution, UUID> {
    long countByStatus(String status);
}
