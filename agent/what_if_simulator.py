import joblib
import pandas as pd

# ============================================================
# RECLAIM WHAT-IF RECOVERY SIMULATOR
# ============================================================

MODEL_FILE = "models/reclaim_model.pkl"
DATA_FILE = "data/failed_payments.csv"

model = joblib.load(MODEL_FILE)

INTERVENTIONS = [
    "Retry",
    "Payment Link",
    "Reminder",
    "No Action"
]


# ============================================================
# 1. SIMULATE A SINGLE STRATEGY
# ============================================================

def simulate_strategy(df, strategy):

    simulation_df = df.copy()

    simulation_df["intervention"] = strategy

    probabilities = model.predict_proba(
        simulation_df
    )[:, 1]

    expected_revenue = (
        simulation_df["amount"] * probabilities
    )

    return {
        "strategy": strategy,
        "expected_revenue": expected_revenue.sum(),
        "average_probability": probabilities.mean()
    }


# ============================================================
# 2. RUN ALL STRATEGIES
# ============================================================

def run_simulation(df):

    results = []

    for strategy in INTERVENTIONS:

        result = simulate_strategy(
            df,
            strategy
        )

        results.append(result)

    return pd.DataFrame(results)


# ============================================================
# 3. DISPLAY RESULTS
# ============================================================

df = pd.read_csv(DATA_FILE)

results = run_simulation(df)

results = results.sort_values(
    "expected_revenue",
    ascending=False
).reset_index(drop=True)


# ============================================================
# 4. CALCULATE REVENUE AT RISK
# ============================================================

revenue_at_risk = df["amount"].sum()

best_strategy = results.iloc[0]

best_recovery = best_strategy[
    "expected_revenue"
]


# ============================================================
# 5. DISPLAY SIMULATOR
# ============================================================

print("\n==============================================")
print("          RECLAIM WHAT-IF SIMULATOR")
print("==============================================")

print(
    f"\nPayments analyzed: "
    f"{len(df):,}"
)

print(
    f"Revenue at risk: "
    f"₹{revenue_at_risk:,.2f}"
)

print("\nSTRATEGY COMPARISON")
print("----------------------------------------------")

for _, row in results.iterrows():

    print(
        f"{row['strategy']:<15}"
        f"→ ₹{row['expected_revenue']:,.2f}"
        f" | Avg probability: "
        f"{row['average_probability'] * 100:.2f}%"
    )


# ============================================================
# 6. BEST SINGLE STRATEGY
# ============================================================

print("\nBEST SINGLE STRATEGY")
print("----------------------------------------------")

print(
    f"Strategy: "
    f"{best_strategy['strategy']}"
)

print(
    f"Expected Recovery: "
    f"₹{best_recovery:,.2f}"
)

print(
    f"Expected Recovery Rate: "
    f"{(best_recovery / revenue_at_risk) * 100:.2f}%"
)


# ============================================================
# 7. WHAT-IF INSIGHT
# ============================================================

print("\nWHAT-IF INSIGHT")
print("----------------------------------------------")

for _, row in results.iterrows():

    difference = (
        row["expected_revenue"]
        - best_recovery
    )

    if row["strategy"] == best_strategy["strategy"]:
        continue

    print(
        f"If merchant used {row['strategy']}: "
        f"₹{row['expected_revenue']:,.2f}"
        f" ({difference:+,.2f} vs best)"
    )


print("\n==============================================")
print("       WHAT-IF SIMULATION COMPLETE")
print("==============================================")