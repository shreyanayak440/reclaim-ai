import joblib
import pandas as pd


# Load trained Reclaim model
model = joblib.load("models/reclaim_model.pkl")


# Available recovery actions
INTERVENTIONS = [
    "Retry",
    "Payment Link",
    "Reminder",
    "No Action"
]


def evaluate_payment(payment):
    """
    Evaluate all possible recovery actions for one failed payment.
    """

    results = []

    for action in INTERVENTIONS:

        test_payment = payment.copy()
        test_payment["intervention"] = action

        input_data = pd.DataFrame([test_payment])

        probability = model.predict_proba(input_data)[0][1]

        expected_revenue = payment["amount"] * probability

        results.append({
            "intervention": action,
            "recovery_probability": probability,
            "expected_revenue": expected_revenue
        })

    return results


def choose_best_action(payment, results):
    """
    Select the action with the highest expected recovered revenue.
    """

    best_action = max(
        results,
        key=lambda x: x["expected_revenue"]
    )

    final_action = best_action["intervention"]

    # Safety guardrail
    if payment["retry_count"] >= 2:
        final_action = "No Action"

    return final_action, best_action


def display_results(payment, results, final_action, best_action):

    print("\n======================================")
    print("          RECLAIM AI AGENT")
    print("======================================")

    print(f"\nPayment Amount: ₹{payment['amount']}")

    print("\nRECOVERY STRATEGY SIMULATION")
    print("--------------------------------------")

    for result in results:

        print(
            f"{result['intervention']:15}"
            f" | Probability: {result['recovery_probability'] * 100:6.2f}%"
            f" | Expected Revenue: ₹{result['expected_revenue']:,.2f}"
        )

    print("\n======================================")
    print("REVENUE-OPTIMIZED DECISION")
    print("======================================")

    print(f"Best predicted action: {best_action['intervention']}")
    print(
        f"Expected recovered revenue: "
        f"₹{best_action['expected_revenue']:,.2f}"
    )

    if payment["retry_count"] >= 2:
        print("\n⚠ GUARDRAIL TRIGGERED")
        print("Maximum retry limit reached.")

    print("\nFINAL RECLAIM ACTION")
    print("--------------------------------------")
    print(f"Action: {final_action}")

    print("\n======================================\n")


# --------------------------------------
# DEMO PAYMENT
# --------------------------------------

payment = {

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


# Evaluate possible actions
results = evaluate_payment(payment)


# Choose best action
final_action, best_action = choose_best_action(
    payment,
    results
)


# Display decision
display_results(
    payment,
    results,
    final_action,
    best_action
)