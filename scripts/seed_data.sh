#!/bin/bash

API_BASE="http://localhost:8080/api"

echo "🚀 Seeding HalleyX Workflow System..."

# 1. Create Expense Approval Workflow
echo "Creating Expense Approval Workflow..."
WF_JSON=$(cat <<EOF
{
  "name": "Expense Approval",
  "isActive": true,
  "maxIterations": 100,
  "inputSchema": "{\n  \"amount\": {\"type\": \"number\", \"required\": true},\n  \"country\": {\"type\": \"string\", \"required\": true},\n  \"department\": {\"type\": \"string\", \"required\": false},\n  \"priority\": {\"type\": \"string\", \"required\": true, \"allowed_values\": [\"High\", \"Medium\", \"Low\"]}\n}"
}
EOF
)

WF_RESPONSE=$(curl -s -X POST "$API_BASE/workflows" -H "Content-Type: application/json" -d "$WF_JSON")
WF_ID=$(echo $WF_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$WF_ID" ]; then
    echo "❌ Error creating workflow. Is the backend running at $API_BASE?"
    exit 1
fi

echo "Created Workflow ID: $WF_ID"

# Add Step: Manager Approval
echo "Adding Manager Approval step..."
STEP_JSON=$(cat <<EOF
{
  "name": "Manager Approval",
  "stepType": "APPROVAL",
  "order": 1,
  "metadata": "{\"assignee_email\": \"manager@halleyx.com\"}"
}
EOF
)
STEP_RESPONSE=$(curl -s -X POST "$API_BASE/workflows/$WF_ID/steps" -H "Content-Type: application/json" -d "$STEP_JSON")
STEP_ID=$(echo $STEP_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Add Rules for Manager Approval
echo "Adding rules for Manager Approval..."
curl -s -X POST "$API_BASE/steps/$STEP_ID/rules" -H "Content-Type: application/json" -d '{"condition": "amount > 100 && country == \"US\"", "priority": 1}'
curl -s -X POST "$API_BASE/steps/$STEP_ID/rules" -H "Content-Type: application/json" -d '{"condition": "DEFAULT", "priority": 2}'

echo "✅ Seeding completed!"
