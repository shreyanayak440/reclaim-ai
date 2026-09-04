"use client";

import { useEffect, useState } from "react";

type Payment = {
  customer_id: string;
  amount: number;
  failure_reason?: string;
  payment_method?: string;
  intervention?: string;
  previous_failures?: number;
  previous_successes?: number;
  retry_count?: number;
  recovery_outcome?: string;
};

export default function DecisionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayments() {
      try {
        const response = await fetch("/api/payments", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load payments");
        }

        const data = await response.json();

        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load payment decisions.");
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <main className="page">

      {/* HEADER */}

      <header className="topbar">

        <div>
          <div className="logo">RECLAIM</div>
          <div className="tagline">
            Revenue Recovery Intelligence
          </div>
        </div>

        <a href="/" className="back">
          ← Dashboard
        </a>

      </header>

      {/* TITLE */}

      <section className="hero">

        <div>

          <div className="eyebrow">
            AI DECISION ENGINE
          </div>

          <h1>
            Payment Decisions
          </h1>

          <p>
            AI-generated recovery actions for failed
            payment opportunities.
          </p>

        </div>

        <div className="counter">

          <span>OPPORTUNITIES</span>

          <strong>
            {payments.length}
          </strong>

          <small>
            highest-value payments
          </small>

        </div>

      </section>

      {/* TABLE */}

      <section className="tableCard">

        {loading && (
          <div className="message">
            Loading AI decisions...
          </div>
        )}

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {!loading && !error && payments.length === 0 && (
          <div className="message">
            No payment records found.
          </div>
        )}

        {!loading && !error && payments.length > 0 && (

          <div className="tableContainer">

            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Failure Reason</th>
                  <th>Method</th>
                  <th>AI Action</th>
                  <th>Previous Failures</th>
                  <th>Recovery</th>
                </tr>

              </thead>

              <tbody>

                {payments.map((payment, index) => (

                  <tr key={`${payment.customer_id}-${index}`}>

                    <td className="number">
                      {index + 1}
                    </td>

                    <td>
                      <strong>
                        {payment.customer_id}
                      </strong>
                    </td>

                    <td className="amount">
                      {money(payment.amount)}
                    </td>

                    <td>
                      {payment.failure_reason || "—"}
                    </td>

                    <td>
                      {payment.payment_method || "—"}
                    </td>

                    <td>

                      <span
                        className={`action ${
                          payment.intervention === "Retry"
                            ? "retry"
                            : payment.intervention === "Reminder"
                            ? "reminder"
                            : "none"
                        }`}
                      >
                        {payment.intervention || "No Action"}
                      </span>

                    </td>

                    <td>
                      {payment.previous_failures ?? 0}
                    </td>

                    <td>

                      <span
                        className={
                          payment.recovery_outcome === "Recovered"
                            ? "recovered"
                            : "pending"
                        }
                      >
                        {payment.recovery_outcome || "Pending"}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      <style jsx>{`

        .page {
          min-height: 100vh;
          background: #07090b;
          color: #f4f7f7;
          padding: 32px 42px 60px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 60px;
        }

        .logo {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .tagline {
          margin-top: 4px;
          color: #70797d;
          font-size: 13px;
        }

        .back {
          color: #dfe5e5;
          text-decoration: none;
          border: 1px solid #252b2e;
          background: #101315;
          border-radius: 9px;
          padding: 11px 16px;
          font-size: 14px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
          margin-bottom: 30px;
        }

        .eyebrow {
          color: #00d6a3;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          margin-bottom: 14px;
        }

        h1 {
          font-size: 44px;
          margin: 0;
          letter-spacing: -1.5px;
        }

        .hero p {
          color: #7d8589;
          margin-top: 12px;
        }

        .counter {
          background: #0d1012;
          border: 1px solid #22282b;
          border-radius: 14px;
          padding: 18px 24px;
          min-width: 170px;
        }

        .counter span {
          display: block;
          color: #737c80;
          font-size: 10px;
          letter-spacing: 1.5px;
        }

        .counter strong {
          display: block;
          font-size: 30px;
          margin-top: 5px;
        }

        .counter small {
          color: #697174;
          font-size: 11px;
        }

        .tableCard {
          border: 1px solid #202629;
          background: #0c0f11;
          border-radius: 15px;
          overflow: hidden;
        }

        .tableContainer {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        th {
          background: #101315;
          color: #737c80;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-align: left;
          padding: 17px;
          border-bottom: 1px solid #202629;
        }

        td {
          padding: 17px;
          font-size: 13px;
          color: #d9dede;
          border-bottom: 1px solid #191e21;
        }

        tbody tr:hover {
          background: #111517;
        }

        .number {
          color: #626b6f;
        }

        .amount {
          font-weight: 700;
        }

        .action {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .retry {
          color: #00d6a3;
          background: rgba(0, 214, 163, 0.12);
        }

        .reminder {
          color: #ffc247;
          background: rgba(255, 194, 71, 0.12);
        }

        .none {
          color: #929b9f;
          background: rgba(140, 150, 155, 0.12);
        }

        .recovered {
          color: #00d6a3;
          font-weight: 700;
          font-size: 12px;
        }

        .pending {
          color: #8b9498;
          font-size: 12px;
        }

        .message {
          padding: 70px;
          text-align: center;
          color: #7b8589;
        }

        .error {
          color: #ff6b6b;
        }

        @media (max-width: 700px) {

          .page {
            padding: 24px 18px;
          }

          .hero {
            flex-direction: column;
            align-items: flex-start;
          }

          h1 {
            font-size: 34px;
          }

        }

      `}</style>

    </main>
  );
}