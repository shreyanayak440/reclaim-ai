import joblib
import pandas as pd


# Load trained Reclaim model
model = joblib.load("models/reclaim_model.pkl")

INTERVENTIONS = [
    "Retry",
    "Payment Link",
    "Reminder",
    "No Action"
]


def get_action_scores(payment):
    """
    Predict expected recovery revenue for every possible action.
    """

    results = []

    for action in INTERVENTIONS:

        test_payment = payment.copy()
        test_payment["intervention"] = action

        input_data = pd.DataFrame([test_payment])

        probability = model.predict_proba(input_data)[0][1]

        expected_revenue = payment["amount"] * probability

        results.append({
            "action": action,
            "probability": probability,
            "expected_revenue": expected_revenue
        })

    return results


def apply_guardrails(payment, results):
    def generate_recovery_reason(payment, decision):
    """
    Generate a human-readable explanation
    for Reclaim's recovery decision.
    """

    reasons = []

    # Customer payment history
    if payment["previous_payments"] >= 5:
        success_rate = (
            payment["previous_successes"]
            / payment["previous_payments"]
        )

        if success_rate >= 0.70:
            reasons.append(
                "Strong previous payment history"
            )
        elif success_rate >= 0.50:
            reasons.append(
                "Moderate previous payment history"
            )
        else:
            reasons.append(
                "Weak previous payment history"
            )

    # Failure reason
    if payment["failure_reason"] in [
        "Temporary Failure",
        "Technical Error"
    ]:
        reasons.append(
            "Failure appears potentially recoverable"
        )

    elif payment["failure_reason"] == "Insufficient Funds":
        reasons.append(
            "Insufficient funds detected"
        )

    elif payment["failure_reason"] == "Bank Declined":
        reasons.append(
            "Bank decline detected"
        )

    elif payment["failure_reason"] == "Authentication Failure":
        reasons.append(
            "Authentication failure detected"
        )

    # Recovery probability
    if decision["probability"] >= 0.80:
        reasons.append(
            "High predicted recovery probability"
        )

    elif decision["probability"] >= 0.60:
        reasons.append(
            "Moderate predicted recovery probability"
        )

    else:
        reasons.append(
            "Low predicted recovery probability"
        )

    # Retry history
    if payment["retry_count"] >= 2:
        reasons.append(
            "Retry limit reached"
        )

    # Human approval
    if decision["human_approval"]:
        reasons.append(
            "High-value payment requires human approval"
        )

    return reasons
    """
    Apply business rules before selecting the final action.
    """

    allowed_actions = results.copy()

    # -----------------------------------------
    # RULE 1: Maximum retry limit
    # -----------------------------------------

    if payment["retry_count"] >= 2:

        allowed_actions = [
            r for r in allowed_actions
            if r["action"] != "Retry"
        ]

    # -----------------------------------------
    # RULE 2: Insufficient funds
    # -----------------------------------------

    if payment["failure_reason"] == "Insufficient Funds":

        allowed_actions = [
            r for r in allowed_actions
            if r["action"] != "Retry"
        ]

    # -----------------------------------------
    # RULE 3: Very low recovery probability
    # -----------------------------------------

    allowed_actions = [
        r for r in allowed_actions
        if r["probability"] >= 0.30
    ]

    # If everything was filtered out
    if not allowed_actions:
        return {
            "action": "No Action",
            "probability": 0,
            "expected_revenue": 0,
            "human_approval": False,
            "reason": "No safe recovery action meets the minimum threshold."
        }

    # -----------------------------------------
    # Select highest expected revenue
    # -----------------------------------------

    best_action = max(
        allowed_actions,
        key=lambda x: x["expected_revenue"]
    )

    # -----------------------------------------
    # RULE 4: High-value payment
    # -----------------------------------------

    human_approval = False

    if payment["amount"] >= 25000:
        human_approval = True

    return {
        "action": best_action["action"],
        "probability": best_action["probability"],
        "expected_revenue": best_action["expected_revenue"],
        "human_approval": human_approval,
        "reason": "Highest expected recovery within policy constraints."
    }


def optimize_recovery(df):

    optimized_actions = []

    for _, payment in df.iterrows():

        payment_data = payment.drop(
            labels=["customer_id", "recovery_outcome"],
            errors="ignore"
        ).to_dict()

        scores = get_action_scores(payment_data)

        decision = apply_guardrails(
            payment_data,
            scores
        )
        reasons = generate_recovery_reason(
    payment_data,
    decision
)

        optimized_actions.append({
            "customer_id": payment["customer_id"],
            "amount": payment["amount"],
            "recommended_action": decision["action"],
            "recovery_probability": decision["probability"],
            "expected_revenue": decision["expected_revenue"],
            "human_approval": decision["human_approval"],
            "reason": decision["reason"],
            "recovery_reasons": reasons
        })

    return pd.DataFrame(optimized_actions)


# ==========================================
# LOAD DATA
# ==========================================

df = pd.read_csv("data/failed_payments.csv")


# ==========================================
# RUN OPTIMIZER
# ==========================================

optimized_df = optimize_recovery(df)


# ==========================================
# METRICS
# ==========================================

total_revenue_at_risk = optimized_df["amount"].sum()

expected_recovery = optimized_df[
    "expected_revenue"
].sum()

recovery_rate = (
    expected_recovery /
    total_revenue_at_risk
) * 100


print("\n==========================================")
print("       RECLAIM CONSTRAINED OPTIMIZER")
print("==========================================")

print(
    f"\nPayments analyzed: "
    f"{len(optimized_df)}"
)

print(
    f"Revenue at risk: "
    f"₹{total_revenue_at_risk:,.2f}"
)

print(
    f"Expected recovered revenue: "
    f"₹{expected_recovery:,.2f}"
)

print(
    f"Expected recovery rate: "
    f"{recovery_rate:.2f}%"
)


# ==========================================
# ACTION DISTRIBUTION
# ==========================================

print("\nOPTIMIZED ACTION ALLOCATION")
print("------------------------------------------")

action_counts = (
    optimized_df["recommended_action"]
    .value_counts()
)

for action, count in action_counts.items():

    action_revenue = optimized_df.loc[
        optimized_df["recommended_action"] == action,
        "expected_revenue"
    ].sum()

    print(
        f"{action:15} → "
        f"{count:4} payments | "
        f"₹{action_revenue:,.2f}"
    )


# ==========================================
# HUMAN APPROVAL
# ==========================================

approval_count = optimized_df[
    "human_approval"
].sum()

print("\nHUMAN APPROVAL QUEUE")
print("------------------------------------------")

print(
    f"Payments requiring approval: "
    f"{approval_count}"
)


# ==========================================
# TOP OPPORTUNITIES
# ==========================================

print("\nTOP 10 RECOVERY OPPORTUNITIES")
print("------------------------------------------")

top_payments = optimized_df.sort_values(
    "expected_revenue",
    ascending=False
).head(10)

print(
    top_payments[
        [
            "customer_id",
            "amount",
            "recommended_action",
            "recovery_probability",
            "expected_revenue",
            "human_approval"
        ]
    ].to_string(index=False)
)
print("\n==========================================")
print("          RECOVERY WHY")
print("==========================================")

for _, row in top_payments.head(5).iterrows():

    print(f"\nCustomer: {row['customer_id']}")
    print(f"Amount: ₹{row['amount']:,.2f}")
    print(f"Recommended Action: {row['recommended_action']}")
    print(
        f"Recovery Probability: "
        f"{row['recovery_probability'] * 100:.2f}%"
    )
    print(
        f"Expected Recovery: "
        f"₹{row['expected_revenue']:,.2f}"
    )

    print("Why this action?")

    for reason in row["recovery_reasons"]:
        print(f"  ✓ {reason}")

    if row["human_approval"]:
        print("  ⚠ Human approval required")

print("\n==========================================")
print("             RECOVERY WHY")
print("==========================================")

for _, row in top_payments.head(5).iterrows():

    print(f"\nCustomer: {row['customer_id']}")
    print(f"Amount: ₹{row['amount']:,.2f}")
    print(f"Recommended Action: {row['recommended_action']}")
    print(
        f"Recovery Probability: "
        f"{row['recovery_probability'] * 100:.2f}%"
    )
    print(
        f"Expected Recovery: "
        f"₹{row['expected_revenue']:,.2f}"
    )

    print("Why this action?")

    for reason in row["recovery_reasons"]:
        print(f"  ✓ {reason}")

    if row["human_approval"]:
        print("  ⚠ Human approval required")
print("\n==========================================")
print("       RECLAIM OPTIMIZATION COMPLETE")
print("==========================================")
