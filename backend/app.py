from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import sys
from datetime import datetime

# ============================================================
# PROJECT ROOT
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.insert(0, BASE_DIR)

# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)
CORS(app)

# ============================================================
# FILES
# ============================================================

DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "failed_payments.csv"
)

OPTIMIZED_FILE = os.path.join(
    BASE_DIR,
    "data",
    "optimized_payments.csv"
)

AUDIT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "audit_log.csv"
)

# ============================================================
# LOAD PRECOMPUTED OPTIMIZATION
# ============================================================

def load_optimized():

    if not os.path.exists(OPTIMIZED_FILE):

        return None

    df = pd.read_csv(
        OPTIMIZED_FILE
    )

    return df


# ============================================================
# HEALTH
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({
        "service":
            "Reclaim AI Revenue Recovery",

        "status":
            "online"
    })


# ============================================================
# DASHBOARD
# ============================================================

@app.route(
    "/api/dashboard",
    methods=["GET"]
)
def dashboard():

    optimized = load_optimized()

    if optimized is None:

        return jsonify({
            "error":
                "Optimized data not found."
        }), 500

    revenue_at_risk = float(
        optimized[
            "amount"
        ].sum()
    )

    expected_recovery = float(
        optimized[
            "expected_revenue"
        ].sum()
    )

    net_recovery = float(
        optimized[
            "net_expected_revenue"
        ].sum()
    )

    approvals = int(
        optimized[
            "human_approval"
        ].sum()
    )

    action_counts = (
        optimized[
            "recommended_action"
        ]
        .value_counts()
        .to_dict()
    )

    recovery_rate = 0

    if revenue_at_risk > 0:

        recovery_rate = (
            expected_recovery
            / revenue_at_risk
        ) * 100

    return jsonify({

        "payments_analyzed":
            int(len(optimized)),

        "revenue_at_risk":
            round(
                revenue_at_risk,
                2
            ),

        "expected_recovery":
            round(
                expected_recovery,
                2
            ),

        "net_expected_recovery":
            round(
                net_recovery,
                2
            ),

        "recovery_rate":
            round(
                recovery_rate,
                2
            ),

        "human_approvals":
            approvals,

        "action_allocation":
            action_counts
    })


# ============================================================
# PAYMENT LIST
# ============================================================

@app.route(
    "/api/payments",
    methods=["GET"]
)
def payments():

    optimized = load_optimized()

    if optimized is None:

        return jsonify({
            "error":
                "Optimized data not found."
        }), 500

    optimized = optimized.sort_values(
        "net_expected_revenue",
        ascending=False
    )

    records = (
        optimized
        .head(100)
        .to_dict(
            orient="records"
        )
    )

    return jsonify(records)


# ============================================================
# SINGLE PAYMENT
# ============================================================

@app.route(
    "/api/payments/<customer_id>",
    methods=["GET"]
)
def payment_details(
    customer_id
):

    optimized = load_optimized()

    if optimized is None:

        return jsonify({
            "error":
                "Optimized data not found."
        }), 500

    result = optimized[
        optimized[
            "customer_id"
        ].astype(str)
        == str(customer_id)
    ]

    if result.empty:

        return jsonify({
            "error":
                "Payment not found"
        }), 404

    record = (
        result
        .iloc[0]
        .to_dict()
    )

    return jsonify(record)


# ============================================================
# RUN AGENT
# ============================================================

@app.route(
    "/api/run-agent",
    methods=["POST"]
)
def run_agent():

    optimized = load_optimized()

    if optimized is None:

        return jsonify({
            "success": False,
            "error":
                "Optimized payment data not found."
        }), 500

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # ========================================================
    # SELECT TOP OPPORTUNITY
    # ========================================================

    top = (
        optimized
        .sort_values(
            "net_expected_revenue",
            ascending=False
        )
        .head(1)
    )

    if top.empty:

        return jsonify({
            "success": False,
            "message":
                "No recovery opportunities found."
        })

    payment = top.iloc[0]

    customer_id = str(
        payment[
            "customer_id"
        ]
    )

    amount = float(
        payment[
            "amount"
        ]
    )

    action = str(
        payment[
            "recommended_action"
        ]
    )

    probability = float(
        payment[
            "recovery_probability"
        ]
    )

    expected_revenue = float(
        payment[
            "expected_revenue"
        ]
    )

    approval_required = bool(
        payment[
            "human_approval"
        ]
    )

    # ========================================================
    # DECISION
    # ========================================================

    if approval_required:

        decision_status = "PENDING_APPROVAL"
        execution_status = "NOT_EXECUTED"

    else:

        decision_status = "APPROVED"
        execution_status = "EXECUTED"

    # ========================================================
    # AUDIT RECORD
    # ========================================================

    audit_record = {

        "timestamp":
            timestamp,

        "customer_id":
            customer_id,

        "amount":
            amount,

        "recommended_action":
            action,

        "recovery_probability":
            probability,

        "expected_revenue":
            expected_revenue,

        "approval_required":
            approval_required,

        "decision_status":
            decision_status,

        "execution_status":
            execution_status,

        "outcome":
            "Pending"
            if approval_required
            else "Executed"
    }

    # ========================================================
    # SAVE AUDIT
    # ========================================================

    audit_df = pd.DataFrame([
        audit_record
    ])

    if os.path.exists(AUDIT_FILE):

        audit_df.to_csv(
            AUDIT_FILE,
            mode="a",
            header=False,
            index=False
        )

    else:

        audit_df.to_csv(
            AUDIT_FILE,
            index=False
        )

    return jsonify({

        "success":
            True,

        "message":
            "Recovery agent executed.",

        "customer_id":
            customer_id,

        "amount":
            amount,

        "recommended_action":
            action,

        "recovery_probability":
            round(
                probability,
                4
            ),

        "expected_revenue":
            round(
                expected_revenue,
                2
            ),

        "approval_required":
            approval_required,

        "decision_status":
            decision_status,

        "execution_status":
            execution_status
    })


# ============================================================
# ROOT
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def root():

    return jsonify({

        "service":
            "Reclaim AI Revenue Recovery",

        "status":
            "online",

        "endpoints": [

            "/api/health",

            "/api/dashboard",

            "/api/payments",

            "/api/run-agent"
        ]
    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("")
    print("==========================================")
    print("       RECLAIM BACKEND API")
    print("==========================================")
    print("")
    print(
        "Optimized data:"
    )
    print(
        OPTIMIZED_FILE
    )
    print("")
    print(
        "API running on:"
    )
    print(
        "http://127.0.0.1:5000"
    )
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )