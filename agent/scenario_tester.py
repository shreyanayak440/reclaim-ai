import sys
import os

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

from agent.agent_executor import (
    get_action_scores,
    apply_guardrails
)


# ============================================================
# RECLAIM MULTI-SCENARIO TESTER
# ============================================================

scenarios = [

    {
        "name": "Strong customer + temporary failure",
        "customer_id": "C10001",
        "amount": 5000,
        "payment_method": "UPI",
        "failure_reason": "Temporary Failure",
        "previous_payments": 12,
        "previous_successes": 10,
        "previous_failures": 2,
        "previous_recovery": "Yes",
        "customer_tenure_months": 24,
        "average_payment_amount": 4500,
        "retry_count": 0
    },

    {
        "name": "Insufficient funds",
        "customer_id": "C10002",
        "amount": 7500,
        "payment_method": "UPI",
        "failure_reason": "Insufficient Funds",
        "previous_payments": 10,
        "previous_successes": 6,
        "previous_failures": 4,
        "previous_recovery": "No",
        "customer_tenure_months": 18,
        "average_payment_amount": 7000,
        "retry_count": 0
    },

    {
        "name": "Repeated retry attempts",
        "customer_id": "C10003",
        "amount": 3000,
        "payment_method": "Card",
        "failure_reason": "Technical Error",
        "previous_payments": 8,
        "previous_successes": 5,
        "previous_failures": 3,
        "previous_recovery": "Yes",
        "customer_tenure_months": 12,
        "average_payment_amount": 3200,
        "retry_count": 2
    },

    {
        "name": "High-value payment",
        "customer_id": "C10004",
        "amount": 45000,
        "payment_method": "Card",
        "failure_reason": "Temporary Failure",
        "previous_payments": 15,
        "previous_successes": 13,
        "previous_failures": 2,
        "previous_recovery": "Yes",
        "customer_tenure_months": 30,
        "average_payment_amount": 40000,
        "retry_count": 0
    },

    {
        "name": "Bank declined",
        "customer_id": "C10005",
        "amount": 12000,
        "payment_method": "Net Banking",
        "failure_reason": "Bank Declined",
        "previous_payments": 6,
        "previous_successes": 3,
        "previous_failures": 3,
        "previous_recovery": "No",
        "customer_tenure_months": 8,
        "average_payment_amount": 11000,
        "retry_count": 1
    }
]


# ============================================================
# RUN SCENARIOS
# ============================================================

print("\n==============================================")
print("        RECLAIM SCENARIO TESTER")
print("==============================================")

for i, payment in enumerate(scenarios, start=1):

    scores = get_action_scores(payment)

    decision = apply_guardrails(
        payment,
        scores
    )

    print("\n----------------------------------------------")
    print(f"SCENARIO {i}: {payment['name']}")
    print("----------------------------------------------")

    print(
        f"Customer: {payment['customer_id']}"
    )

    print(
        f"Amount: ₹{payment['amount']:,.2f}"
    )

    print(
        f"Failure: {payment['failure_reason']}"
    )

    print(
        f"Previous retries: "
        f"{payment['retry_count']}"
    )

    print(
        f"\nAI Recommendation: "
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

    print(
        f"Approval Required: "
        f"{decision['approval_required']}"
    )

    print(
        f"Decision Status: "
        f"{decision['status']}"
    )


print("\n==============================================")
print("       SCENARIO TESTING COMPLETE")
print("==============================================")