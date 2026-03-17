# HalleyX Workflow System

A high-performance, premium workflow execution engine designed for complex enterprise automation. This system allows for dynamic rule-based decision making, comprehensive audit logging, and a glassmorphic management console.

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Node.js 20+
- PostgreSQL
- Maven

### Database Setup
```bash
psql -U postgres -c "CREATE DATABASE workflow_db;"
```

### Backend Setup
```bash
cd backend-workflowsystem
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend-workflowsystem
npm install
npm run dev
```

### Seed Sample Data
```bash
bash scripts/seed_data.sh
```

## 🛠 Features

- **Dynamic Rule Engine**: Evaluate complex business logic using priority-based rules.
- **Traceability Registry**: Every step, decision, and payload is logged for compliance.
- **Glassmorphic Console**: A modern, tech-forward UI built with React and native CSS.
- **UUID Identifiers**: Secure, non-sequential identifiers for all entities.
- **Real-time Synchronization**: Telemetry polling for live execution monitoring.

## 📖 API Documentation

### Workflows
- `POST /api/workflows`: Create workflow
- `GET /api/workflows`: List workflows (paginated)
- `GET /api/workflows/{id}`: Get detail
- `PUT /api/workflows/{id}`: Update/Version
- `DELETE /api/workflows/{id}`: Delete

### Workflow Execution
- `POST /api/workflows/{id}/execute`: Start run
- `GET /api/executions/{id}`: Get status & logs
- `POST /api/executions/{id}/retry`: Retry failed step
- `POST /api/executions/{id}/cancel`: Cancel run

## 💡 System Capabilities

### 1. Advanced Decision Engine
The core of HalleyX is a recursive state-machine that leverages **Spring Expression Language (SpEL)**. This allows users to write rules that look like standard code (e.g., `amount > 500 && region == 'APAC'`) which are evaluated against the execution payload in real-time.

### 2. Full-Spectrum Observability
- **The Registry**: A tamper-proof audit log tracking every workflow mutation.
- **Telemetry Console**: A live-updating terminal view that streams execution logs, showing exactly which rules were evaluated and why a specific path was chosen.
- **Persistence**: Every execution maintains its own state, allowing for robust retries and step-specific error recovery.

### 3. Premium Operator Interface
Built for "Operators," the UI focuses on clarity and speed:
- **Glassmorphic Design**: Reduces visual fatigue during long monitoring sessions.
- **Micro-animations**: Provide immediate feedback for complex state transitions.
- **Schema Validation**: Ensures data integrity before any logic is executed.

## 🌟 Real-time Use Cases

### A. Intelligent Expense Guardrail
- **Scenario**: Corporate expenses need different levels of approval based on risk.
- **HalleyX Logic**: 
  - Rules evaluate `amount` and `category`. 
  - < $100: Auto-approve. 
  - > $1000: Route to Finance VP. 
  - Foreign Currency: Route to Compliance Team.

### B. Dynamic Support Ticket Routing
- **Scenario**: A flurry of support tickets needs sorting.
- **HalleyX Logic**: 
  - Rules parse `priority` and `keywords`. 
  - "Server Down": Route to DevOps (High Priority). 
  - "Password Reset": Route to Automated Bot. 
  - "Refund Request": Route to Customer Success Manager.

### C. Automated User Onboarding
- **Scenario**: Onboarding users across multiple internal systems (Slack, GitHub, HR Portal).
- **HalleyX Logic**: 
  - Step 1: Create LDAP account. 
  - Step 2 (Conditional): If Engineering department, trigger GitHub invite. 
  - Step 3 (Loop): Retry email verification up to 3 times before alerting HR.

### D. E-commerce Pricing Optimization
- **Scenario**: Adjusting product prices based on external data.
- **HalleyX Logic**: 
  - Input: Competitor price and current stock. 
  - Rule: If `stock > 500` AND `competitorPrice < myPrice`, lower price by 5%. 
  - Rule: If `stock < 10`, increase price by 10%.

---
Part of the HalleyX Challenge. Built for high-stakes automation.
