import joblib
import pandas as pd

# Load Reclaim model
model = joblib.load("models/reclaim_model.pkl")

# Recovery strategies
INTERVENTIONS = [
    "Retry",
    "Payment Link",
    "Reminder",
    "No Action"
]


def simulate_strategy(df, action):
    """
    Simulate one recovery strategy across all failed payments.
    """

    test_data = df.copy()

    # Apply the same action to every payment
    test_data["intervention"] = action

    # Remove columns not used by the model
    model_input = test_data.drop(
        columns=["customer_id", "recovery_outcome"],
        errors="ignore"
    )

    # Predict recovery probability
    probabilities = model.predict_proba(model_input)[:, 1]

    # Calculate expected recovered revenue
    expected_revenue = (
        test_data["amount"] * probabilities
    ).sum()

    return expected_revenue


# Load failed payments
df = pd.read_csv("data/failed_payments.csv")

print("\n==========================================")
print("        RECLAIM STRATEGY SIMULATOR")
print("==========================================")

print(f"\nPayments analyzed: {len(df)}")

total_revenue = df["amount"].sum()

print(f"Total revenue at risk: ₹{total_revenue:,.2f}")

print("\nSIMULATING RECOVERY STRATEGIES")
print("------------------------------------------")

results = []

for action in INTERVENTIONS:

    expected_revenue = simulate_strategy(
        df,
        action
    )

    results.append({
        "strategy": action,
        "expected_revenue": expected_revenue
    })

    print(
        f"{action:15} → "
        f"₹{expected_revenue:,.2f}"
    )


# Find best overall strategy
best_strategy = max(
    results,
    key=lambda x: x["expected_revenue"]
)

print("\n==========================================")
print("       BEST SINGLE STRATEGY")
print("==========================================")

print(
    f"Strategy: {best_strategy['strategy']}"
)

print(
    f"Expected recovered revenue: "
    f"₹{best_strategy['expected_revenue']:,.2f}"
)

print("\n==========================================")