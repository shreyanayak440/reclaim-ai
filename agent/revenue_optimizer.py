import joblib
import pandas as pd

# ============================================================
# RECLAIM NET REVENUE OPTIMIZER
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

# Estimated intervention costs.
# These are prototype assumptions and are merchant-configurable.
ACTION_COSTS = {
    "Retry": 8,
    "Payment Link": 15,
    "Reminder": 5,
    "No Action": 0
}

# Penalty for repeated recovery attempts.
FATIGUE_PENALTY = 0.08


# ============================================================
# 1. SCORE EACH POSSIBLE ACTION
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

        expected_revenue = (
            payment["amount"] * probability
        )

        intervention_cost = ACTION_COSTS[action]

        # Recovery fatigue penalty
        fatigue_penalty = (
            payment["retry_count"]
            * FATIGUE_PENALTY
            * payment["amount"]
            * probability
        )

        net_expected_revenue = (
            expected_revenue
            - intervention_cost
            - fatigue_penalty
        )

        results.append({
            "action": action,
            "probability": probability,
            "expected_revenue": expected_revenue,
            "intervention_cost": intervention_cost,
            "fatigue_penalty": fatigue_penalty,
            "net_expected_revenue": net_expected_revenue
        })

    return results


# ============================================================
# 2. APPLY BUSINESS GUARDRAILS
# ============================================================

def apply_guardrails(payment, results):

    allowed_actions = results.copy()

    # Recovery fatigue
    if payment["retry_count"] >= 2:

        allowed_actions = [
            r for r in allowed_actions
            if r["action"] != "Retry"
        ]

    # Insufficient funds
    if payment["failure_reason"] == "Insufficient Funds":

        allowed_actions = [
            r for r in allowed_actions
            if r["action"] != "Retry"
        ]

    # Minimum probability threshold
    allowed_actions = [
        r for r in allowed_actions
        if r["probability"] >= 0.30
    ]

    if not allowed_actions:

        return {
            "action": "No Action",
            "probability": 0,
            "expected_revenue": 0,
            "net_expected_revenue": 0,
            "human_approval": False,
            "reason": "No safe recovery action meets the minimum threshold."
        }

    # Optimize NET expected recovery
    best_action = max(
        allowed_actions,
        key=lambda x: x["net_expected_revenue"]
    )

    # High-value payment → human approval
    human_approval = payment["amount"] >= 25000

    return {
        "action": best_action["action"],
        "probability": best_action["probability"],
        "expected_revenue": best_action["expected_revenue"],
        "net_expected_revenue": best_action["net_expected_revenue"],
        "human_approval": human_approval,
        "reason": "Highest net expected recovery within policy constraints."
    }


# ============================================================
# 3. GENERATE RECOVERY WHY
# ============================================================

def generate_recovery_reason(payment, decision):

    reasons = []

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

    if payment["retry_count"] >= 2:

        reasons.append(
            "Recovery fatigue limit reached"
        )

    if decision["human_approval"]:

        reasons.append(
            "High-value payment requires human approval"
        )

    return reasons


# ============================================================
# 4. OPTIMIZE ENTIRE PORTFOLIO
# ============================================================

def optimize_recovery(df):

    optimized_actions = []

    for _, payment in df.iterrows():

        payment_data = payment.drop(
            labels=[
                "customer_id",
                "recovery_outcome"
            ],
            errors="ignore"
        ).to_dict()

        scores = get_action_scores(
            payment_data
        )

        decision = apply_guardrails(
            payment_data,
            scores
        )

        reasons = generate_recovery_reason(
            payment_data,
            decision
        )

        optimized_actions.append({

            "customer_id":
                payment["customer_id"],

            "amount":
                payment["amount"],

            "recommended_action":
                decision["action"],

            "recovery_probability":
                decision["probability"],

            "expected_revenue":
                decision["expected_revenue"],

            "net_expected_revenue":
                decision["net_expected_revenue"],

            "human_approval":
                decision["human_approval"],

            "reason":
                decision["reason"],

            "recovery_reasons":
                reasons
        })

    return pd.DataFrame(
        optimized_actions
    )


# ============================================================
# STANDALONE EXECUTION
# ============================================================

# IMPORTANT:
# The following section ONLY runs when this file is executed
# directly. Flask can safely import optimize_recovery()
# without running the entire 5000-payment optimization here.

if __name__ == "__main__":

    # ========================================================
    # LOAD DATA
    # ========================================================

    df = pd.read_csv(
        DATA_FILE
    )

    optimized_df = optimize_recovery(
        df
    )

    # ========================================================
    # PORTFOLIO METRICS
    # ========================================================

    total_revenue_at_risk = (
        optimized_df["amount"].sum()
    )

    expected_recovery = (
        optimized_df["expected_revenue"].sum()
    )

    net_expected_recovery = (
        optimized_df["net_expected_revenue"].sum()
    )

    recovery_rate = (
        expected_recovery
        / total_revenue_at_risk
    ) * 100

    net_recovery_rate = (
        net_expected_recovery
        / total_revenue_at_risk
    ) * 100

    # ========================================================
    # DISPLAY
    # ========================================================

    print("\n==========================================")
    print("       RECLAIM NET REVENUE OPTIMIZER")
    print("==========================================")

    print(
        f"\nPayments analyzed: "
        f"{len(optimized_df):,}"
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

    print(
        f"Net expected recovered revenue: "
        f"₹{net_expected_recovery:,.2f}"
    )

    print(
        f"Net recovery rate: "
        f"{net_recovery_rate:.2f}%"
    )

    # ========================================================
    # ACTION ALLOCATION
    # ========================================================

    print("\nOPTIMIZED ACTION ALLOCATION")
    print("------------------------------------------")

    action_counts = (
        optimized_df[
            "recommended_action"
        ].value_counts()
    )

    for action, count in action_counts.items():

        action_revenue = (
            optimized_df.loc[
                optimized_df[
                    "recommended_action"
                ] == action,
                "net_expected_revenue"
            ].sum()
        )

        print(
            f"{action:15} → "
            f"{count:4} payments | "
            f"₹{action_revenue:,.2f}"
        )

    # ========================================================
    # HUMAN APPROVAL
    # ========================================================

    approval_count = optimized_df[
        "human_approval"
    ].sum()

    print("\nHUMAN APPROVAL QUEUE")
    print("------------------------------------------")

    print(
        f"Payments requiring approval: "
        f"{approval_count}"
    )

    # ========================================================
    # TOP RECOVERY OPPORTUNITIES
    # ========================================================

    print("\nTOP 10 RECOVERY OPPORTUNITIES")
    print("------------------------------------------")

    top_payments = (
        optimized_df
        .sort_values(
            "net_expected_revenue",
            ascending=False
        )
        .head(10)
    )

    print(
        top_payments[
            [
                "customer_id",
                "amount",
                "recommended_action",
                "recovery_probability",
                "expected_revenue",
                "net_expected_revenue",
                "human_approval"
            ]
        ].to_string(index=False)
    )

    # ========================================================
    # RECOVERY WHY
    # ========================================================

    print("\n==========================================")
    print("             RECOVERY WHY")
    print("==========================================")

    for _, row in top_payments.head(5).iterrows():

        print(
            f"\nCustomer: "
            f"{row['customer_id']}"
        )

        print(
            f"Amount: "
            f"₹{row['amount']:,.2f}"
        )

        print(
            f"Recommended Action: "
            f"{row['recommended_action']}"
        )

        print(
            f"Recovery Probability: "
            f"{row['recovery_probability'] * 100:.2f}%"
        )

        print(
            f"Expected Recovery: "
            f"₹{row['expected_revenue']:,.2f}"
        )

        print(
            f"Net Expected Recovery: "
            f"₹{row['net_expected_revenue']:,.2f}"
        )

        print("Why this action?")

        for reason in row[
            "recovery_reasons"
        ]:

            print(
                f"  ✓ {reason}"
            )

        if row["human_approval"]:

            print(
                "  ⚠ Human approval required"
            )

    print("\n==========================================")
    print("       RECLAIM OPTIMIZATION COMPLETE")
    print("==========================================")