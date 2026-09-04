import joblib
import pandas as pd
import random
from datetime import datetime
import os

# ============================================================
# RECLAIM AI AGENT EXECUTOR
# ============================================================

MODEL_FILE = "models/reclaim_model.pkl"
AUDIT_FILE = "data/audit_log.csv"

model = joblib.load(MODEL_FILE)

INTERVENTIONS = [
    "Retry",
    "Payment Link",
    "Reminder",
    "No Action"
]


# ============================================================
# 1. PREDICT RECOVERY FOR EACH ACTION
# ============================================================

def get_action_scores(payment):

    results = []

    for action in INTERVENTIONS:

        test_payment = payment.copy()
        test_payment["intervention"] = action

        input_data = pd.DataFrame([test_payment])

        probability = model.predict_proba(
            input_data
        )[0][1]

        # No Action represents the baseline scenario.
        if action == "No Action":
            expected_revenue = (
                payment["amount"] * probability
            )
        else:
            expected_revenue = (
                payment["amount"] * probability
            )

        results.append({
            "action": action,
            "probability": probability,
            "expected_revenue": expected_revenue
        })

    return results


# ============================================================
# 2. APPLY BUSINESS GUARDRAILS
# ============================================================

def apply_guardrails(payment, results):

    allowed_actions = results.copy()

    # Recovery fatigue:
    # Do not retry after two previous attempts.
    if payment["retry_count"] >= 2:

        allowed_actions = [
            r for r in allowed_actions
            if r["action"] != "Retry"
        ]

    # Insufficient funds:
    # Do not automatically retry.
    if payment["failure_reason"] == "Insufficient Funds":

        allowed_actions = [
            r for r in allowed_actions
            if r["action"] != "Retry"
        ]

    # Minimum recovery probability threshold.
    allowed_actions = [
        r for r in allowed_actions
        if r["probability"] >= 0.30
    ]

    if not allowed_actions:

        return {
            "action": "No Action",
            "probability": 0,
            "expected_revenue": 0,
            "approval_required": False,
            "status": "BLOCKED",
            "reason": "No safe recovery action available."
        }

    # Select action with highest expected revenue.
    best_action = max(
        allowed_actions,
        key=lambda x: x["expected_revenue"]
    )

    # High-value payment requires human approval.
    approval_required = payment["amount"] >= 25000

    if approval_required:
        status = "PENDING_APPROVAL"
    else:
        status = "APPROVED"

    return {
        "action": best_action["action"],
        "probability": best_action["probability"],
        "expected_revenue": best_action["expected_revenue"],
        "approval_required": approval_required,
        "status": status,
        "reason": "Highest expected recovery within policy constraints."
    }


# ============================================================
# 3. SIMULATE ACTION EXECUTION
# ============================================================

def execute_action(payment, decision):

    # No Action
    if decision["action"] == "No Action":

        return {
            "execution_status": "NOT_EXECUTED",
            "outcome": "No Action",
            "actual_revenue": 0
        }

    # Human approval required
    if decision["approval_required"]:

        return {
            "execution_status": "WAITING_FOR_APPROVAL",
            "outcome": "Awaiting Human Approval",
            "actual_revenue": 0
        }

    # Simulated execution.
    probability = decision["probability"]

    recovered = random.random() < probability

    if recovered:

        return {
            "execution_status": "EXECUTED",
            "outcome": "Recovered",
            "actual_revenue": payment["amount"]
        }

    return {
        "execution_status": "EXECUTED",
        "outcome": "Not Recovered",
        "actual_revenue": 0
    }


# ============================================================
# 4. CREATE AUDIT RECORD
# ============================================================

def create_audit_record(payment, decision, execution):

    return {

        "timestamp":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

        "customer_id":
            payment["customer_id"],

        "amount":
            payment["amount"],

        "failure_reason":
            payment["failure_reason"],

        "recommended_action":
            decision["action"],

        "recovery_probability":
            decision["probability"],

        "expected_revenue":
            decision["expected_revenue"],

        "approval_required":
            decision["approval_required"],

        "decision_status":
            decision["status"],

        "execution_status":
            execution["execution_status"],

        "outcome":
            execution["outcome"],

        "actual_revenue":
            execution["actual_revenue"],

        "decision_reason":
            decision["reason"]
    }


# ============================================================
# 5. SAVE AUDIT RECORD
# ============================================================

def save_audit_record(audit):

    audit_df = pd.DataFrame([audit])

    file_exists = os.path.exists(AUDIT_FILE)

    audit_df.to_csv(
        AUDIT_FILE,
        mode="a",
        header=not file_exists,
        index=False
    )

    print("\n✓ Audit record saved")


# ============================================================
# 6. GENERATE LEARNING SIGNAL
# ============================================================

def get_learning_signal(execution):

    if execution["outcome"] == "Recovered":
        return "POSITIVE"

    elif execution["outcome"] == "Not Recovered":
        return "NEGATIVE"

    return "NO_SIGNAL"


# ============================================================
# 7. ANALYZE HISTORICAL PERFORMANCE
# ============================================================

def analyze_learning():

    if not os.path.exists(AUDIT_FILE):
        print("\nNo audit history available.")
        return

    df = pd.read_csv(AUDIT_FILE)

    executed = df[
        df["execution_status"] == "EXECUTED"
    ]

    print("\n==========================================")
    print("          RECLAIM LEARNING LOOP")
    print("==========================================")

    print(
        f"\nTotal decisions: {len(df)}"
    )

    print(
        f"Executed actions: {len(executed)}"
    )

    if executed.empty:

        print(
            "No completed actions available yet."
        )

        return

    recovered = len(
        executed[
            executed["outcome"] == "Recovered"
        ]
    )

    not_recovered = len(
        executed[
            executed["outcome"] == "Not Recovered"
        ]
    )

    recovery_rate = (
        recovered / len(executed)
    ) * 100

    print(
        f"Recovered: {recovered}"
    )

    print(
        f"Not recovered: {not_recovered}"
    )

    print(
        f"Overall recovery rate: "
        f"{recovery_rate:.2f}%"
    )

    print("\nACTION PERFORMANCE")
    print("------------------------------------------")

    for action in INTERVENTIONS:

        action_df = executed[
            executed["recommended_action"] == action
        ]

        if action_df.empty:
            continue

        action_recovered = len(
            action_df[
                action_df["outcome"] == "Recovered"
            ]
        )

        action_rate = (
            action_recovered / len(action_df)
        ) * 100

        print(
            f"{action}: "
            f"{action_recovered}/{len(action_df)} "
            f"recovered → {action_rate:.2f}%"
        )


# ============================================================
# 8. LEARN BEST OBSERVED ACTION
# ============================================================

def get_best_learned_action():

    if not os.path.exists(AUDIT_FILE):
        return None

    df = pd.read_csv(AUDIT_FILE)

    executed = df[
        df["execution_status"] == "EXECUTED"
    ]

    if executed.empty:
        return None

    performance = (
        executed
        .groupby("recommended_action")["outcome"]
        .apply(
            lambda x:
            (x == "Recovered").mean()
        )
    )

    best_action = performance.idxmax()

    return {
        "action": best_action,
        "recovery_rate": performance[best_action]
    }


# ============================================================
# 9. DEMO PAYMENT
# ============================================================

payment = {

    "customer_id": "C13982",

    "amount": 5000,

    "payment_method": "UPI",

    "failure_reason": "Temporary Failure",

    "previous_payments": 10,

    "previous_successes": 8,

    "previous_failures": 2,

    "previous_recovery": "Yes",

    "customer_tenure_months": 18,

    "average_payment_amount": 4500,

    "retry_count": 0
}


# ============================================================
# 10. RUN RECLAIM AGENT
# ============================================================

scores = get_action_scores(payment)

decision = apply_guardrails(
    payment,
    scores
)

execution = execute_action(
    payment,
    decision
)

audit = create_audit_record(
    payment,
    decision,
    execution
)

learning_signal = get_learning_signal(
    execution
)

audit["learning_signal"] = learning_signal

save_audit_record(audit)


# ============================================================
# 11. DISPLAY AGENT DECISION
# ============================================================

print("\n==========================================")
print("          RECLAIM AI AGENT")
print("==========================================")

print(
    f"\nCustomer: "
    f"{payment['customer_id']}"
)

print(
    f"Payment Amount: "
    f"₹{payment['amount']:,.2f}"
)

print(
    f"Failure Reason: "
    f"{payment['failure_reason']}"
)


print("\nAI DECISION")
print("------------------------------------------")

print(
    f"Recommended Action: "
    f"{decision['action']}"
)

print(
    f"Recovery Probability: "
    f"{decision['probability'] * 100:.2f}%"
)

print(
    f"Expected Recovery: "
    f"₹{decision['expected_revenue']:,.2f}"
)


print("\nPOLICY CHECK")
print("------------------------------------------")

print(
    f"Approval Required: "
    f"{decision['approval_required']}"
)

print(
    f"Decision Status: "
    f"{decision['status']}"
)


print("\nACTION EXECUTION")
print("------------------------------------------")

print(
    f"Execution Status: "
    f"{execution['execution_status']}"
)

print(
    f"Outcome: "
    f"{execution['outcome']}"
)

print(
    f"Actual Revenue Recovered: "
    f"₹{execution['actual_revenue']:,.2f}"
)


print(
    f"\nLearning Signal: "
    f"{learning_signal}"
)


print("\nAUDIT RECORD")
print("------------------------------------------")

for key, value in audit.items():

    print(
        f"{key}: {value}"
    )


print("\n==========================================")
print("       RECLAIM AGENT COMPLETE")
print("==========================================")


# ============================================================
# 12. RUN LEARNING ANALYSIS
# ============================================================

analyze_learning()


# ============================================================
# 13. DISPLAY WHAT AGENT LEARNED
# ============================================================

learned_action = get_best_learned_action()

if learned_action:

    print("\n==========================================")
    print("          WHAT RECLAIM LEARNED")
    print("==========================================")

    print(
        f"\nBest observed action: "
        f"{learned_action['action']}"
    )

    print(
        f"Observed recovery rate: "
        f"{learned_action['recovery_rate'] * 100:.2f}%"
    )
