"use client";

import { useEffect, useMemo, useState } from "react";

type AuditRecord = {
  timestamp: string;
  customer_id: string;
  amount: number;
  failure_reason: string;
  recommended_action: string;
  recovery_probability: number;
  expected_revenue: number;
  approval_required: boolean | string;
  decision_status: string;
  execution_status: string;
  outcome: string;
  actual_revenue: number;
  decision_reason: string;
  learning_signal: string;
};

export default function AuditPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAudit();
  }, []);

  async function loadAudit() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/audit", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Audit API unavailable");
      }

      const data = await response.json();

      setRecords(
        Array.isArray(data)
          ? data
          : data.records || []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Audit records could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return records;
    }

    return records.filter((record) =>
      [
        record.customer_id,
        record.failure_reason,
        record.recommended_action,
        record.decision_status,
        record.execution_status,
        record.outcome,
        record.learning_signal,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search]);

  const approved = records.filter(
    (record) =>
      record.decision_status === "APPROVED"
  ).length;

  const rejected = records.filter(
    (record) =>
      record.decision_status === "REJECTED"
  ).length;

  const executed = records.filter(
    (record) =>
      record.execution_status === "EXECUTED"
  ).length;

  const recovered = records.filter(
    (record) =>
      record.outcome === "Recovered"
  ).length;

  function money(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function probability(value: number) {
    return `${(Number(value || 0) * 100).toFixed(1)}%`;
  }

  function statusClass(value: string) {
    const normalized =
      value?.toLowerCase();

    if (
      normalized === "approved" ||
      normalized === "executed" ||
      normalized === "recovered" ||
      normalized === "positive"
    ) {
      return "positive";
    }

    if (
      normalized === "rejected" ||
      normalized === "failed" ||
      normalized === "negative"
    ) {
      return "negative";
    }

    return "neutral";
  }

  if (loading) {
    return (
      <main className="loading">
        <div>
          <div className="logo">
            RECLAIM
          </div>

          <p>
            Loading audit intelligence...
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
            font-family: Arial, sans-serif;
          }

          .logo {
            font-size: 30px;
            font-weight: 800;
            letter-spacing: 2px;
          }

          p {
            color: #687276;
            font-size: 12px;
            margin-top: 10px;
          }

        `}</style>
      </main>
    );
  }

  return (
    <main className="page">

      {/* HEADER */}

      <header className="header">

        <div>

          <a
            href="/"
            className="brand"
          >
            RECLAIM
          </a>

          <div className="subtitle">
            AI REVENUE RECOVERY
          </div>

        </div>

        <div className="online">

          <span />

          SYSTEM ONLINE

        </div>

      </header>


      {/* BACK */}

      <a
        href="/"
        className="back"
      >
        ← Back to Dashboard
      </a>


      {/* HERO */}

      <section className="hero">

        <div className="eyebrow">
          DECISION INTELLIGENCE
        </div>

        <h1>
          Audit Log
        </h1>

        <p>
          Complete traceability of AI recommendations,
          human decisions, recovery execution and
          learning outcomes.
        </p>

      </section>


      {/* ERROR */}

      {error && (

        <div className="error">
          {error}
        </div>

      )}


      {/* METRICS */}

      <section className="metrics">

        <div className="metric">

          <div className="label">
            TOTAL DECISIONS
          </div>

          <div className="number">
            {records.length}
          </div>

          <div className="small">
            Recorded events
          </div>

        </div>


        <div className="metric">

          <div className="label">
            APPROVED
          </div>

          <div className="number">
            {approved}
          </div>

          <div className="small">
            Recovery actions approved
          </div>

        </div>


        <div className="metric">

          <div className="label">
            EXECUTED
          </div>

          <div className="number">
            {executed}
          </div>

          <div className="small">
            Actions executed
          </div>

        </div>


        <div className="metric">

          <div className="label">
            RECOVERED
          </div>

          <div className="number">
            {recovered}
          </div>

          <div className="small">
            Successful outcomes
          </div>

        </div>

      </section>


      {/* SEARCH */}

      <section className="toolbar">

        <div className="search">

          <span>
            ⌕
          </span>

          <input
            placeholder="Search customer, action, outcome..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <button
          className="refresh"
          onClick={loadAudit}
        >
          ↻ Refresh
        </button>

      </section>


      {/* TABLE */}

      {filteredRecords.length > 0 ? (

        <section className="table-card">

          <div className="table-top">

            <span>
              RECOVERY DECISION HISTORY
            </span>

            <span className="count">
              {filteredRecords.length} records
            </span>

          </div>


          <div className="table-scroll">

            <table>

              <thead>

                <tr>

                  <th>
                    TIMESTAMP
                  </th>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    AMOUNT
                  </th>

                  <th>
                    FAILURE
                  </th>

                  <th>
                    AI ACTION
                  </th>

                  <th>
                    PROBABILITY
                  </th>

                  <th>
                    EXPECTED
                  </th>

                  <th>
                    DECISION
                  </th>

                  <th>
                    EXECUTION
                  </th>

                  <th>
                    OUTCOME
                  </th>

                  <th>
                    LEARNING
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.map(
                  (record, index) => (

                    <tr
                      key={`${record.timestamp}-${record.customer_id}-${index}`}
                    >

                      <td className="timestamp">
                        {record.timestamp}
                      </td>

                      <td className="customer">
                        {record.customer_id}
                      </td>

                      <td>
                        {money(record.amount)}
                      </td>

                      <td className="failure">
                        {record.failure_reason}
                      </td>

                      <td>

                        <span className="action">
                          {record.recommended_action}
                        </span>

                      </td>

                      <td>
                        {probability(
                          record.recovery_probability
                        )}
                      </td>

                      <td className="recovery">
                        {money(
                          record.expected_revenue
                        )}
                      </td>

                      <td>

                        <span
                          className={`badge ${statusClass(
                            record.decision_status
                          )}`}
                        >
                          {record.decision_status}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge ${statusClass(
                            record.execution_status
                          )}`}
                        >
                          {record.execution_status}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge ${statusClass(
                            record.outcome
                          )}`}
                        >
                          {record.outcome}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`signal ${statusClass(
                            record.learning_signal
                          )}`}
                        >
                          {record.learning_signal}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      ) : (

        <section className="empty">

          <div className="empty-icon">
            ◌
          </div>

          <h2>
            No audit records found
          </h2>

          <p>
            {error
              ? "Check that the audit API is running."
              : "No records match your search."}
          </p>

        </section>

      )}


      {/* ARCHITECTURE NOTE */}

      <section className="note">

        <div className="note-icon">
          AI
        </div>

        <div>

          <div className="note-title">
            CLOSED-LOOP RECOVERY INTELLIGENCE
          </div>

          <p>
            Every recovery decision can be traced from
            AI recommendation through approval,
            execution and outcome. Learning signals can
            subsequently be used to improve future
            recovery decisions.
          </p>

        </div>

      </section>


      {/* FOOTER */}

      <footer>

        <span>
          RECLAIM AI REVENUE RECOVERY
        </span>

        <span>
          DECISION INTELLIGENCE • AUDITABILITY
        </span>

      </footer>


      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #07090b;
          color: #edf2f2;
          padding: 32px 42px 50px;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 34px;
        }

        .brand {
          color: #f4f7f7;
          text-decoration: none;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .subtitle {
          color: #606b6e;
          font-size: 8px;
          letter-spacing: 2px;
          margin-top: 5px;
        }

        .online {
          display: flex;
          gap: 8px;
          align-items: center;
          color: #657074;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .online span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d6a3;
        }

        .back {
          color: #687276;
          text-decoration: none;
          font-size: 11px;
        }

        .back:hover {
          color: #00d6a3;
        }

        .hero {
          margin-top: 43px;
          margin-bottom: 34px;
        }

        .eyebrow {
          color: #00d6a3;
          font-size: 9px;
          letter-spacing: 2.5px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        h1 {
          font-size: 47px;
          letter-spacing: -2px;
          margin: 0;
        }

        .hero p {
          max-width: 670px;
          color: #707b7f;
          font-size: 13px;
          line-height: 1.7;
          margin-top: 14px;
        }

        .error {
          border: 1px solid #452323;
          background: #160d0d;
          color: #d77c7c;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 11px;
          margin-bottom: 20px;
        }

        .metrics {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 13px;
          margin-bottom: 24px;
        }

        .metric {
          background: #0d1012;
          border: 1px solid #202629;
          border-radius: 10px;
          padding: 20px;
        }

        .label {
          color: #697377;
          font-size: 8px;
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .number {
          font-size: 30px;
          font-weight: 700;
          margin-top: 12px;
        }

        .small {
          color: #4f5a5e;
          font-size: 9px;
          margin-top: 7px;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .search {
          position: relative;
          width: 420px;
        }

        .search span {
          position: absolute;
          left: 13px;
          top: 8px;
          color: #667074;
          font-size: 18px;
        }

        input {
          width: 100%;
          background: #0d1012;
          border: 1px solid #202629;
          border-radius: 8px;
          color: #edf2f2;
          padding: 11px 13px 11px 37px;
          outline: none;
          font-size: 11px;
        }

        input:focus {
          border-color: #00d6a3;
        }

        .refresh {
          background: #0d1012;
          border: 1px solid #202629;
          color: #7a8589;
          border-radius: 7px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 10px;
        }

        .refresh:hover {
          color: #00d6a3;
          border-color: #00d6a3;
        }

        .table-card {
          background: #0b0e10;
          border: 1px solid #202629;
          border-radius: 11px;
          overflow: hidden;
        }

        .table-top {
          display: flex;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid #202629;
          color: #778286;
          font-size: 9px;
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .count {
          color: #4e595d;
          letter-spacing: 0;
          font-weight: 400;
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1300px;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 12px 14px;
          color: #505b5f;
          font-size: 8px;
          letter-spacing: 1px;
          border-bottom: 1px solid #202629;
          white-space: nowrap;
        }

        td {
          padding: 14px;
          font-size: 10px;
          border-bottom: 1px solid #171d20;
          white-space: nowrap;
        }

        tbody tr:hover {
          background: #0e1214;
        }

        .timestamp {
          color: #596467;
          font-size: 9px;
        }

        .customer {
          color: #e8eeee;
          font-weight: 700;
        }

        .failure {
          color: #899397;
        }

        .action {
          color: #00d6a3;
          background: #10241f;
          border-radius: 4px;
          padding: 5px 7px;
          font-size: 8px;
          font-weight: 700;
        }

        .recovery {
          color: #00d6a3;
          font-weight: 700;
        }

        .badge {
          display: inline-block;
          border-radius: 4px;
          padding: 5px 7px;
          font-size: 8px;
          font-weight: 700;
        }

        .badge.positive {
          background: #10241f;
          color: #00d6a3;
        }

        .badge.negative {
          background: #251313;
          color: #d87979;
        }

        .badge.neutral {
          background: #191d1f;
          color: #818b8f;
        }

        .signal {
          font-size: 8px;
          font-weight: 700;
        }

        .signal.positive {
          color: #00d6a3;
        }

        .signal.negative {
          color: #d87979;
        }

        .signal.neutral {
          color: #778286;
        }

        .empty {
          border: 1px solid #202629;
          background: #0c0f11;
          border-radius: 11px;
          text-align: center;
          padding: 70px 20px;
        }

        .empty-icon {
          color: #00d6a3;
          font-size: 28px;
        }

        .empty h2 {
          font-size: 18px;
          margin-top: 15px;
        }

        .empty p {
          color: #657074;
          font-size: 11px;
        }

        .note {
          display: flex;
          gap: 15px;
          margin-top: 22px;
          padding: 20px;
          border: 1px solid #202629;
          background: #0c1010;
          border-radius: 10px;
        }

        .note-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #23453c;
          border-radius: 7px;
          color: #00d6a3;
          font-size: 8px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .note-title {
          color: #899396;
          font-size: 9px;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .note p {
          max-width: 900px;
          color: #596467;
          font-size: 10px;
          line-height: 1.7;
          margin: 8px 0 0;
        }

        footer {
          display: flex;
          justify-content: space-between;
          color: #41494c;
          font-size: 8px;
          letter-spacing: 0.8px;
          margin-top: 45px;
        }

        @media (max-width: 900px) {

          .page {
            padding: 25px 20px;
          }

          .metrics {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .search {
            width: 100%;
          }

        }

        @media (max-width: 600px) {

          .metrics {
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