# RECLAIM — AI-Powered Payment Failure Revenue Recovery

> **Turn failed payments into recoverable revenue through intelligent, policy-aware decisions.**

---

## Overview

**Reclaim** is an AI-driven revenue recovery decision system designed to determine the **best next action after a payment failure**.

Instead of applying the same retry rule to every failed payment, Reclaim evaluates each payment individually, estimates its recovery probability, evaluates possible interventions, and selects the action with the highest expected recovery value.

The system combines:

- **Recovery prediction**
- **Revenue optimization**
- **Action selection**
- **Policy guardrails**
- **Human approval**
- **Auditability**
- **Outcome-based learning**

The goal is simple:

> **Don't just predict whether a failed payment can recover. Decide what to do next to recover the most revenue.**

---

# The Problem

Failed payments create significant potential revenue leakage for merchants.

Traditional payment recovery systems often depend on:

- Fixed retry schedules
- Generic recovery rules
- One-size-fits-all interventions
- Limited decision intelligence
- Minimal human oversight

The result is that merchants may spend recovery effort on low-value or low-probability payments while missing higher-value opportunities.

### The key question

A failed payment does not simply require a prediction.

It requires a **decision**:

> **Should we retry, send a reminder, or take no action?**

And that decision should consider both:

**Probability of recovery + Economic value of recovery**

---

# Our Solution

**Reclaim** transforms payment recovery from a static retry workflow into an **AI-powered revenue decision system**.

For every failed payment, the system:

1. Ingests payment information
2. Evaluates the payment's recovery characteristics
3. Estimates recovery probability
4. Evaluates available recovery actions
5. Calculates expected recovery value
6. Applies policy constraints
7. Determines whether human approval is required
8. Produces a recommended action
9. Records the decision in an audit trail

---

# Core Decision Loop

```text
Failed Payment
      ↓
Recovery Prediction
      ↓
Action Evaluation
      ↓
Expected Revenue Calculation
      ↓
Revenue Optimization
      ↓
Policy / Human Approval
      ↓
Recommended Action
      ↓
Execution
      ↓
Outcome + Audit Trail
      ↓
Learning Signal