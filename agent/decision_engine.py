import joblib
import pandas as pd

model = joblib.load("models/reclaim_model.pkl")

print("Reclaim model loaded successfully!")

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

interventions = [
    "Retry",
    "Payment Link",
    "Reminder",
    "No Action"
]

results = []

for action in interventions:

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

print("\nRECOVERY PREDICTIONS:")

for result in results:
    print(
        f"{result['intervention']}: "
        f"{result['recovery_probability'] * 100:.2f}%"
    )

print("\nEXPECTED RECOVERED REVENUE")
print("--------------------------")

for result in results:
    print(
        f"{result['intervention']}: "
        f"?{result['expected_revenue']:.2f}"
    )

best_action = max(
    results,
    key=lambda x: x["expected_revenue"]
)

print("\nREVENUE-OPTIMIZED RECOMMENDATION")
print("--------------------------------")
print("Recommended action:", best_action["intervention"])
print(
    f"Expected recovered revenue: "
    f"?{best_action['expected_revenue']:.2f}"
)
