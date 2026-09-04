import pandas as pd
import numpy as np

np.random.seed(42)

N = 5000

# Customer information
customer_id = [f"C{10000 + i}" for i in range(N)]

amount = np.round(
    np.random.lognormal(mean=np.log(4000), sigma=0.8, size=N),
    2
)

amount = np.clip(amount, 300, 50000)

payment_method = np.random.choice(
    ["UPI", "Card", "NetBanking", "Wallet"],
    size=N,
    p=[0.45, 0.30, 0.15, 0.10]
)

failure_reason = np.random.choice(
    [
        "Temporary Failure",
        "Insufficient Funds",
        "Bank Declined",
        "Technical Error",
        "Authentication Failure"
    ],
    size=N,
    p=[0.30, 0.20, 0.20, 0.15, 0.15]
)

# Customer history
previous_payments = np.random.randint(1, 21, size=N)

previous_successes = np.array([
    np.random.randint(0, p + 1)
    for p in previous_payments
])

previous_failures = previous_payments - previous_successes

previous_recovery = np.where(
    (previous_successes >= 3) &
    (previous_successes / previous_payments > 0.60),
    np.random.choice(["Yes", "No"], size=N, p=[0.75, 0.25]),
    np.random.choice(["Yes", "No"], size=N, p=[0.25, 0.75])
)

customer_tenure_months = np.random.randint(1, 37, size=N)

average_payment_amount = np.round(
    amount * np.random.uniform(0.6, 1.4, size=N),
    2
)

retry_count = np.random.randint(0, 4, size=N)
# -----------------------------
# 3. Historical intervention
# -----------------------------

intervention = []

for i in range(N):

    success_rate = previous_successes[i] / previous_payments[i]

    if retry_count[i] >= 2:
        action = "No Action"

    elif failure_reason[i] in ["Temporary Failure", "Technical Error"] and success_rate >= 0.70:
        action = "Retry"

    elif failure_reason[i] == "Insufficient Funds":
        action = "Payment Link"

    elif success_rate >= 0.60:
        action = "Reminder"

    else:
        action = "No Action"

    intervention.append(action)
# Hidden recovery probability
success_rate = previous_successes / previous_payments

score = (
    0.45 * success_rate
    + 0.20 * (previous_recovery == "Yes")
    + 0.15 * (failure_reason == "Temporary Failure")
    + 0.10 * (failure_reason == "Technical Error")
    + 0.05 * (customer_tenure_months >= 12)
    - 0.10 * (failure_reason == "Insufficient Funds")
    - 0.10 * (failure_reason == "Bank Declined")
    - 0.08 * (retry_count >= 2)
)
# Add intervention effect
intervention_effect = np.zeros(N)

for i in range(N):

    if intervention[i] == "Retry":
        intervention_effect[i] = 0.20

    elif intervention[i] == "Payment Link":
        intervention_effect[i] = 0.15

    elif intervention[i] == "Reminder":
        intervention_effect[i] = 0.10

    else:
        intervention_effect[i] = -0.05


# Add randomness
score += intervention_effect
score += np.random.normal(0, 0.12, N)

# Convert score into probability
probability = 1 / (1 + np.exp(-5 * (score - 0.45)))

probability = np.clip(probability, 0.03, 0.97)

# Actual recovery outcome
recovery_outcome = np.random.binomial(
    1,
    probability,
    size=N
)

recovery_outcome = np.where(
    recovery_outcome == 1,
    "Recovered",
    "Not Recovered"
)

# Create dataset
df = pd.DataFrame({
    "customer_id": customer_id,
    "amount": amount,
    "payment_method": payment_method,
    "failure_reason": failure_reason,
    "previous_payments": previous_payments,
    "previous_successes": previous_successes,
    "previous_failures": previous_failures,
    "previous_recovery": previous_recovery,
    "customer_tenure_months": customer_tenure_months,
    "average_payment_amount": average_payment_amount,
    "retry_count": retry_count,
    "intervention": intervention,
    "recovery_outcome": recovery_outcome
})

# Save
df.to_csv(
    "data/failed_payments.csv",
    index=False
)

print("Dataset created successfully!")
print(f"Number of records: {len(df)}")
print()
print(df.head())
print()
print("Recovery outcome distribution:")
print(df["recovery_outcome"].value_counts())
print("\nRECOVERY RATE BY INTERVENTION")

print(
    pd.crosstab(
        df["intervention"],
        df["recovery_outcome"],
        normalize="index"
    ).round(3)
)

