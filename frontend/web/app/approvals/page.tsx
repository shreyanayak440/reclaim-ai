"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = {
  customer_id: string;
  amount: number;
  failure_reason?: string;
  payment_method?: string;
  customer_tenure_months?: number;
  previous_failures?: number;
  previous_payments?: number;
  previous_successes?: number;
  previous_recovery?: string;
  retry_count?: number;

  recommended_action?: string;
  intervention?: string;
  expected_revenue?: number;
  net_expected_revenue?: number;
  human_approval?: number | boolean;
  recovery_outcome?: string;
};

type ReviewStatus = "Pending" | "Approved" | "Rejected";

type ReviewedPayment = Payment & {
  reviewStatus: ReviewStatus;
};

export default function ApprovalsPage() {
  const [payments, setPayments] = useState<ReviewedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ReviewStatus | "All">("All");

  // ----------------------------------------------------------
  // LOAD PAYMENTS
  // ----------------------------------------------------------

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/payments", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load payments");
      }

      const result: Payment[] = await response.json();

      /*
       * Keep payments that require human approval.
       *
       * If human_approval is not present, we also check
       * the intervention field so the page remains useful
       * with the current backend response.
       */

      const approvalPayments = result.filter((payment) => {
        return (
          payment.human_approval === 1 ||
          payment.human_approval === true ||
          String(payment.human_approval).toLowerCase() ===
            "true"
        );
      });

      /*
       * If the backend currently returns the 100 highest-value
       * payments and fewer approval flags are present, show
       * those returned approval cases.
       */

      const reviewed = approvalPayments.map((payment) => ({
        ...payment,
        reviewStatus: "Pending" as ReviewStatus,
      }));

      setPayments(reviewed);
    } catch (err) {
      console.error(err);
      setError(
        "Could not load the human approval queue."
      );
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------
  // APPROVE / REJECT
  // ----------------------------------------------------------

  function updateReview(
    customerId: string,
    status: ReviewStatus
  ) {
    setPayments((current) =>
      current.map((payment) =>
        payment.customer_id === customerId
          ? {
              ...payment,
              reviewStatus: status,
            }
          : payment
      )
    );
  }

  // ----------------------------------------------------------
  // FILTER + SEARCH
  // ----------------------------------------------------------

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.customer_id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (payment.failure_reason || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (payment.payment_method || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        payment.reviewStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [payments, search, filter]);

  // ----------------------------------------------------------
  // COUNTS
  // ----------------------------------------------------------

  const pendingCount = payments.filter(
    (payment) => payment.reviewStatus === "Pending"
  ).length;

  const approvedCount = payments.filter(
    (payment) => payment.reviewStatus === "Approved"
  ).length;

  const rejectedCount = payments.filter(
    (payment) => payment.reviewStatus === "Rejected"
  ).length;

  const approvalValue = payments
    .filter(
      (payment) =>
        payment.reviewStatus === "Approved"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.net_expected_revenue || 0),
      0
    );

  // ----------------------------------------------------------
  // FORMAT MONEY
  // ----------------------------------------------------------

  function money(value?: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <main className="loading">
        <div>
          <div className="loading-logo">
            RECLAIM
          </div>

          <p>
            Loading human approval queue...
          </p>
        </div>

        <style jsx>{`

          .loading {
            min-height: 100vh;
            background: #07090b;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-family: Arial, Helvetica, sans-serif;
          }

          .loading-logo {
            font-size: 30px;
            font-weight: 800;
            letter-spacing: 2px;
          }

          .loading p {
            color: #70797d;
            font-size: 13px;
            margin-top: 10px;
          }

        `}</style>
      </main>
    );
  }

  // ----------------------------------------------------------
  // PAGE
  // ----------------------------------------------------------

  return (
    <main className="page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="header">

        <div>

          <a
            href="/"
            className="brand"
          >
            RECLAIM
          </a>

          <div className="subtitle">
            HUMAN APPROVAL CENTER
          </div>

        </div>

        <div className="system-status">

          <span className="status-dot" />

          SYSTEM ONLINE

        </div>

      </header>


      {/* ====================================================
          BACK
      ==================================================== */}

      <a
        href="/"
        className="back"
      >
        ← Back to Dashboard
      </a>


      {/* ====================================================
          HERO
      ==================================================== */}

      <section className="hero">

        <div>

          <div className="eyebrow">
            HUMAN-IN-THE-LOOP CONTROL
          </div>

          <h1>
            Approval Queue
          </h1>

          <p>
            Review AI-generated recovery recommendations
            before high-impact actions are executed.
          </p>

        </div>

      </section>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div className="error-box">
          {error}
        </div>

      )}


      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <section className="summary">

        <div className="summary-card">

          <div className="summary-label">
            PENDING REVIEW
          </div>

          <div className="summary-number">
            {pendingCount}
          </div>

          <div className="summary-description">
            Awaiting human decision
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-label">
            APPROVED
          </div>

          <div className="summary-number">
            {approvedCount}
          </div>

          <div className="summary-description">
            Recovery actions approved
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-label">
            REJECTED
          </div>

          <div className="summary-number">
            {rejectedCount}
          </div>

          <div className="summary-description">
            Recovery actions rejected
          </div>

        </div>


        <div className="summary-card highlight">

          <div className="summary-label">
            APPROVED RECOVERY VALUE
          </div>

          <div className="summary-money">
            {money(approvalValue)}
          </div>

          <div className="summary-description">
            Net expected recovery
          </div>

        </div>

      </section>


      {/* ====================================================
          CONTROLS
      ==================================================== */}

      <section className="controls">

        <div className="search-wrapper">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search customer, failure reason or payment method..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <div className="filters">

          {(
            [
              "All",
              "Pending",
              "Approved",
              "Rejected",
            ] as const
          ).map((option) => (

            <button
              key={option}
              className={
                filter === option
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setFilter(option)
              }
            >
              {option}
            </button>

          ))}

        </div>

      </section>


      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {filteredPayments.length === 0 && (

        <section className="empty">

          <div className="empty-icon">
            ✓
          </div>

          <h2>
            No payments require review
          </h2>

          <p>
            There are currently no approval items
            matching your filters.
          </p>

        </section>

      )}


      {/* ====================================================
          APPROVAL TABLE
      ==================================================== */}

      {filteredPayments.length > 0 && (

        <section className="table-card">

          <div className="table-header">

            <div>
              <span className="table-title">
                AI RECOVERY RECOMMENDATIONS
              </span>

              <span className="table-count">
                {filteredPayments.length} items
              </span>
            </div>

          </div>


          <div className="table-scroll">

            <table>

              <thead>

                <tr>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    FAILED AMOUNT
                  </th>

                  <th>
                    FAILURE
                  </th>

                  <th>
                    PAYMENT
                  </th>

                  <th>
                    AI ACTION
                  </th>

                  <th>
                    EXPECTED RECOVERY
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    DECISION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredPayments.map(
                  (payment) => (

                    <tr
                      key={payment.customer_id}
                    >

                      {/* CUSTOMER */}

                      <td>

                        <div className="customer">
                          {payment.customer_id}
                        </div>

                        <div className="customer-meta">
                          {payment.customer_tenure_months || 0}
                          {" "}
                          months tenure
                        </div>

                      </td>


                      {/* AMOUNT */}

                      <td>

                        <strong>
                          {money(payment.amount)}
                        </strong>

                      </td>


                      {/* FAILURE */}

                      <td>

                        <span className="failure">
                          {payment.failure_reason ||
                            "Unknown"}
                        </span>

                      </td>


                      {/* PAYMENT METHOD */}

                      <td>

                        <span className="payment-method">
                          {payment.payment_method ||
                            "Unknown"}
                        </span>

                      </td>


                      {/* AI ACTION */}

                      <td>

                        <span
                          className={
                            payment.recommended_action ===
                            "Retry"
                              ? "action retry"
                              : payment.recommended_action ===
                                "Reminder"
                              ? "action reminder"
                              : "action none"
                          }
                        >
                          {payment.recommended_action ||
                            payment.intervention ||
                            "Review"}
                        </span>

                      </td>


                      {/* RECOVERY */}

                      <td>

                        <strong className="recovery">
                          {money(
                            payment.net_expected_revenue ||
                              payment.expected_revenue
                          )}
                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            payment.reviewStatus ===
                            "Approved"
                              ? "status approved"
                              : payment.reviewStatus ===
                                "Rejected"
                              ? "status rejected"
                              : "status pending"
                          }
                        >
                          {payment.reviewStatus}
                        </span>

                      </td>


                      {/* DECISION */}

                      <td>

                        {payment.reviewStatus ===
                        "Pending" ? (

                          <div className="decision-buttons">

                            <button
                              className="approve"
                              onClick={() =>
                                updateReview(
                                  payment.customer_id,
                                  "Approved"
                                )
                              }
                            >
                              ✓ Approve
                            </button>

                            <button
                              className="reject"
                              onClick={() =>
                                updateReview(
                                  payment.customer_id,
                                  "Rejected"
                                )
                              }
                            >
                              × Reject
                            </button>

                          </div>

                        ) : (

                          <button
                            className="undo"
                            onClick={() =>
                              updateReview(
                                payment.customer_id,
                                "Pending"
                              )
                            }
                          >
                            Undo
                          </button>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      )}


      {/* ====================================================
          EXPLANATION
      ==================================================== */}

      <section className="explanation">

        <div className="explanation-icon">
          AI
        </div>

        <div>

          <div className="explanation-title">
            HUMAN OVERSIGHT ENABLED
          </div>

          <p>
            Reclaim does not automatically execute
            high-impact recovery actions. AI recommendations
            are surfaced for human review, providing
            transparency, accountability and operational
            control.
          </p>

        </div>

      </section>


      {/* ====================================================
          FOOTER
      ==================================================== */}

      <footer>

        <span>
          RECLAIM AI REVENUE RECOVERY
        </span>

        <span>
          AI DECISION INTELLIGENCE • HUMAN OVERSIGHT
        </span>

      </footer>


      {/* ====================================================
          STYLES
      ==================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #07090b;
          color: #eef2f2;
          padding: 32px 42px 50px;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* HEADER */

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 35px;
        }

        .brand {
          color: #f4f7f7;
          text-decoration: none;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .subtitle {
          color: #626c70;
          font-size: 9px;
          letter-spacing: 2px;
          margin-top: 5px;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #687276;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d6a3;
        }


        /* BACK */

        .back {
          display: inline-block;
          color: #6c767a;
          text-decoration: none;
          font-size: 11px;
          margin-bottom: 45px;
        }

        .back:hover {
          color: #00d6a3;
        }


        /* HERO */

        .hero {
          margin-bottom: 35px;
        }

        .eyebrow {
          color: #00d6a3;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2.5px;
          margin-bottom: 13px;
        }

        h1 {
          margin: 0;
          font-size: 47px;
          letter-spacing: -2px;
        }

        .hero p {
          max-width: 620px;
          color: #707a7e;
          font-size: 13px;
          line-height: 1.7;
          margin-top: 14px;
        }


        /* ERROR */

        .error-box {
          padding: 15px 18px;
          border: 1px solid #3b2222;
          background: #160d0d;
          color: #d88b8b;
          border-radius: 9px;
          margin-bottom: 22px;
          font-size: 12px;
        }


        /* SUMMARY */

        .summary {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: #0d1012;
          border: 1px solid #202629;
          border-radius: 11px;
          padding: 20px;
        }

        .summary-card.highlight {
          background: #0c1512;
        }

        .summary-label {
          color: #6c767a;
          font-size: 8px;
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .summary-number {
          font-size: 31px;
          font-weight: 700;
          margin-top: 12px;
        }

        .summary-money {
          font-size: 22px;
          font-weight: 700;
          margin-top: 16px;
        }

        .summary-description {
          color: #505b5f;
          font-size: 9px;
          margin-top: 7px;
        }


        /* CONTROLS */

        .controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .search-wrapper {
          position: relative;
          width: 420px;
        }

        .search-icon {
          position: absolute;
          left: 13px;
          top: 10px;
          color: #606a6e;
          font-size: 18px;
        }

        input {
          width: 100%;
          background: #0d1012;
          color: #e9eeee;
          border: 1px solid #202629;
          border-radius: 8px;
          padding: 11px 14px 11px 37px;
          outline: none;
          font-size: 11px;
        }

        input:focus {
          border-color: #00d6a3;
        }

        .filters {
          display: flex;
          gap: 6px;
        }

        .filter {
          border: 1px solid #202629;
          background: #0d1012;
          color: #707a7e;
          border-radius: 7px;
          padding: 9px 13px;
          font-size: 10px;
          cursor: pointer;
        }

        .filter.active {
          background: #00d6a3;
          border-color: #00d6a3;
          color: #03110d;
          font-weight: 700;
        }


        /* TABLE */

        .table-card {
          background: #0b0e10;
          border: 1px solid #202629;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          padding: 18px 20px;
          border-bottom: 1px solid #202629;
        }

        .table-title {
          font-size: 9px;
          letter-spacing: 1.5px;
          font-weight: 700;
          color: #7a8588;
        }

        .table-count {
          color: #4e595d;
          font-size: 10px;
          margin-left: 10px;
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 13px 15px;
          color: #555f63;
          font-size: 8px;
          letter-spacing: 1px;
          font-weight: 700;
          border-bottom: 1px solid #202629;
          white-space: nowrap;
        }

        td {
          padding: 16px 15px;
          border-bottom: 1px solid #171d20;
          font-size: 11px;
          vertical-align: middle;
        }

        tbody tr:hover {
          background: #0e1214;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }


        /* CUSTOMER */

        .customer {
          font-weight: 700;
          color: #e8eeee;
        }

        .customer-meta {
          color: #4e595d;
          font-size: 8px;
          margin-top: 5px;
        }


        /* FAILURE */

        .failure {
          color: #aab2b5;
          white-space: nowrap;
        }

        .payment-method {
          color: #7e898d;
        }


        /* ACTION */

        .action {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 700;
        }

        .action.retry {
          background: #10241f;
          color: #00d6a3;
        }

        .action.reminder {
          background: #211d10;
          color: #d6b45c;
        }

        .action.none {
          background: #171b1d;
          color: #737d81;
        }


        /* RECOVERY */

        .recovery {
          color: #00d6a3;
        }


        /* STATUS */

        .status {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .status.pending {
          background: #211d10;
          color: #d6b45c;
        }

        .status.approved {
          background: #10241f;
          color: #00d6a3;
        }

        .status.rejected {
          background: #251313;
          color: #d87878;
        }


        /* DECISION BUTTONS */

        .decision-buttons {
          display: flex;
          gap: 5px;
        }

        .approve,
        .reject,
        .undo {
          border: none;
          border-radius: 5px;
          padding: 7px 9px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .approve {
          background: #00d6a3;
          color: #03110d;
        }

        .reject {
          background: #241315;
          color: #d87979;
          border: 1px solid #402123;
        }

        .undo {
          background: #171b1d;
          color: #8b9599;
          border: 1px solid #2a3033;
        }

        .approve:hover {
          opacity: 0.85;
        }

        .reject:hover,
        .undo:hover {
          opacity: 0.8;
        }


        /* EMPTY */

        .empty {
          text-align: center;
          border: 1px solid #202629;
          background: #0c0f11;
          border-radius: 12px;
          padding: 70px 20px;
        }

        .empty-icon {
          width: 45px;
          height: 45px;
          margin: auto;
          border-radius: 50%;
          background: #10241f;
          color: #00d6a3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .empty h2 {
          font-size: 18px;
          margin-top: 18px;
        }

        .empty p {
          color: #687276;
          font-size: 11px;
        }


        /* EXPLANATION */

        .explanation {
          display: flex;
          gap: 17px;
          align-items: flex-start;
          margin-top: 25px;
          padding: 20px;
          border: 1px solid #202629;
          background: #0c1010;
          border-radius: 10px;
        }

        .explanation-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border: 1px solid #23453c;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00d6a3;
          font-size: 9px;
          font-weight: 800;
        }

        .explanation-title {
          color: #899396;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .explanation p {
          max-width: 850px;
          color: #596467;
          font-size: 10px;
          line-height: 1.7;
          margin: 8px 0 0;
        }


        /* FOOTER */

        footer {
          display: flex;
          justify-content: space-between;
          color: #41494c;
          font-size: 8px;
          letter-spacing: 0.8px;
          margin-top: 45px;
        }


        /* RESPONSIVE */

        @media (max-width: 900px) {

          .page {
            padding: 25px 20px;
          }

          .summary {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .controls {
            align-items: stretch;
            flex-direction: column;
          }

          .search-wrapper {
            width: 100%;
          }

        }


        @media (max-width: 600px) {

          .summary {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 38px;
          }

          footer {
            flex-direction: column;
            gap: 10px;
          }

        }

      `}</style>

    </main>
  );
}