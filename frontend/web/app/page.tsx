"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  payments_analyzed: number;
  revenue_at_risk: number;
  expected_recovery: number;
  net_expected_recovery: number;
  recovery_rate: number;
  human_approvals: number;
  action_allocation: {
    "No Action": number;
    Reminder: number;
    Retry: number;
  };
};

type AgentResponse = {
  success?: boolean;
  message?: string;
  customer_id?: string;
  amount?: number;
  recommended_action?: string;
  recovery_probability?: number;
  expected_revenue?: number;
  approval_required?: boolean;
  decision_status?: string;
  execution_status?: string;
  error?: string;
};

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [agentResult, setAgentResult] =
    useState<AgentResponse | null>(null);

  async function getDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Dashboard API failed");
      }

      const result = await response.json();
      setData(result);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to connect to Reclaim backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runRecoveryAgent() {
    try {
      setRunning(true);
      setMessage("AI agent is evaluating the recovery portfolio...");
      setAgentResult(null);

      const response = await fetch(
        "http://127.0.0.1:5000/api/run-agent",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Agent request failed");
      }

      const result: AgentResponse =
        await response.json();

      setAgentResult(result);

      if (result.success) {
        setMessage(
          "Recovery Agent completed successfully."
        );
      } else {
        setMessage(
          result.error ||
            "Recovery Agent could not complete the decision."
        );
      }

      await getDashboard();
    } catch (error) {
      console.error(error);

      setMessage(
        "Recovery Agent could not connect to the backend."
      );
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    getDashboard();
  }, []);

  function money(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function number(value: number) {
    return value.toLocaleString("en-IN");
  }

  function percentage(value: number) {
    return `${Number(value).toFixed(2)}%`;
  }

  const totalActions =
    data
      ? data.action_allocation.Retry +
        data.action_allocation.Reminder +
        data.action_allocation["No Action"]
      : 0;

  function actionPercent(value: number) {
    if (!totalActions) return 0;
    return (value / totalActions) * 100;
  }

  if (loading && !data) {
    return (
      <main className="loading-page">
        <div className="loader-card">
          <div className="loader-logo">
            RECLAIM
          </div>

          <div className="loader-line" />

          <p>
            Initializing revenue intelligence...
          </p>
        </div>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: #060809;
            color: #f5f7f7;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family:
              Inter, Arial, Helvetica, sans-serif;
          }

          .loader-card {
            text-align: center;
            width: 320px;
          }

          .loader-logo {
            font-size: 34px;
            font-weight: 900;
            letter-spacing: 4px;
          }

          .loader-line {
            width: 100%;
            height: 2px;
            background: #17201e;
            margin: 24px 0 18px;
            overflow: hidden;
            position: relative;
          }

          .loader-line::after {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 40%;
            height: 100%;
            background: #00d6a3;
            animation: load 1.2s infinite;
          }

          .loader-card p {
            color: #687275;
            font-size: 12px;
          }

          @keyframes load {
            0% {
              transform: translateX(-120%);
            }

            100% {
              transform: translateX(350%);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="header">

        <div>
          <div className="brand">
            RECLAIM
          </div>

          <div className="tagline">
            AI REVENUE RECOVERY INTELLIGENCE
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          <span>SYSTEM ONLINE</span>
        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">

        <div className="hero-copy">

          <div className="eyebrow">
            REVENUE RECOVERY CONTROL CENTER
          </div>

          <h1>
            Turn failed
            <br />
            payments into
            <br />
            <span>recovered revenue.</span>
          </h1>

          <p>
            Reclaim evaluates every failed payment,
            estimates recovery probability and
            selects the highest-value intervention
            under business policy constraints.
          </p>

          <div className="hero-pills">
            <span>AI DECISIONING</span>
            <span>POLICY GUARDRAILS</span>
            <span>HUMAN OVERSIGHT</span>
          </div>

        </div>


        {/* =================================================
            AGENT PANEL
        ================================================= */}

        <div className="agent-panel">

          <div className="agent-panel-top">
            <div>
              <div className="agent-label">
                AUTONOMOUS RECOVERY AGENT
              </div>

              <div className="agent-state">
                {running
                  ? "ANALYZING PORTFOLIO"
                  : "READY FOR DECISION"}
              </div>
            </div>

            <div
              className={
                running
                  ? "agent-indicator active"
                  : "agent-indicator"
              }
            />
          </div>

          <div className="agent-description">
            Selects the optimal recovery action
            based on expected revenue, payment
            history and recovery probability.
          </div>

          <button
            className="agent-button"
            onClick={runRecoveryAgent}
            disabled={running}
          >
            <span>
              {running
                ? "Running AI Agent..."
                : "Run Recovery Agent"}
            </span>

            <span className="button-arrow">
              →
            </span>
          </button>

        </div>

      </section>


      {/* =====================================================
          STATUS
      ===================================================== */}

      {message && (
        <div className="message">

          <span className="message-icon">
            {running ? "◌" : "✓"}
          </span>

          <span>{message}</span>

        </div>
      )}


      {/* =====================================================
          AGENT RESULT
      ===================================================== */}

      {agentResult?.success && (
        <section className="agent-result">

          <div className="result-header">
            <div>
              <div className="eyebrow">
                LATEST AGENT DECISION
              </div>

              <h2>
                Recovery action selected
              </h2>
            </div>

            <div className="executed-badge">
              {agentResult.execution_status ||
                "EXECUTED"}
            </div>
          </div>

          <div className="result-grid">

            <div className="result-item">
              <span>CUSTOMER</span>
              <strong>
                {agentResult.customer_id ||
                  "—"}
              </strong>
            </div>

            <div className="result-item">
              <span>PAYMENT VALUE</span>
              <strong>
                {money(
                  agentResult.amount || 0
                )}
              </strong>
            </div>

            <div className="result-item">
              <span>RECOMMENDED ACTION</span>
              <strong className="action-value">
                {agentResult.recommended_action ||
                  "—"}
              </strong>
            </div>

            <div className="result-item">
              <span>RECOVERY PROBABILITY</span>
              <strong>
                {agentResult.recovery_probability
                  ? percentage(
                      agentResult.recovery_probability *
                        100
                    )
                  : "—"}
              </strong>
            </div>

            <div className="result-item">
              <span>EXPECTED REVENUE</span>
              <strong>
                {money(
                  agentResult.expected_revenue ||
                    0
                )}
              </strong>
            </div>

            <div className="result-item">
              <span>DECISION STATUS</span>
              <strong>
                {agentResult.decision_status ||
                  "—"}
              </strong>
            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          KPI SECTION
      ===================================================== */}

      {data && (
        <section className="metrics">

          <div className="metric">
            <div className="metric-top">
              <span className="metric-label">
                PAYMENTS ANALYZED
              </span>

              <span className="metric-index">
                01
              </span>
            </div>

            <div className="metric-value">
              {number(
                data.payments_analyzed
              )}
            </div>

            <div className="metric-description">
              Failed transactions evaluated
            </div>
          </div>


          <div className="metric">
            <div className="metric-top">
              <span className="metric-label">
                REVENUE AT RISK
              </span>

              <span className="metric-index">
                02
              </span>
            </div>

            <div className="metric-value">
              {money(data.revenue_at_risk)}
            </div>

            <div className="metric-description">
              Value currently exposed to payment failure
            </div>
          </div>


          <div className="metric highlight">
            <div className="metric-top">
              <span className="metric-label">
                EXPECTED RECOVERY
              </span>

              <span className="metric-index">
                03
              </span>
            </div>

            <div className="metric-value green">
              {money(data.expected_recovery)}
            </div>

            <div className="metric-description">
              AI-estimated recoverable revenue
            </div>
          </div>


          <div className="metric">
            <div className="metric-top">
              <span className="metric-label">
                NET EXPECTED RECOVERY
              </span>

              <span className="metric-index">
                04
              </span>
            </div>

            <div className="metric-value">
              {money(
                data.net_expected_recovery
              )}
            </div>

            <div className="metric-description">
              Expected recovery after intervention costs
            </div>
          </div>

        </section>
      )}


      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      {data && (
        <section className="analytics-grid">

          {/* RECOVERY RATE */}

          <div className="analytics-card recovery-card">

            <div className="card-heading">
              <span>
                RECOVERY EFFICIENCY
              </span>

              <span className="card-number">
                01
              </span>
            </div>

            <div className="recovery-number">
              {percentage(data.recovery_rate)}
            </div>

            <div className="progress-track">
              <div
                className="progress-value"
                style={{
                  width: `${Math.min(
                    data.recovery_rate,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="analytics-note">
              AI projected recovery rate
            </div>

          </div>


          {/* HUMAN APPROVAL */}

          <div className="analytics-card">

            <div className="card-heading">
              <span>
                HUMAN OVERSIGHT
              </span>

              <span className="card-number">
                02
              </span>
            </div>

            <div className="recovery-number">
              {number(
                data.human_approvals
              )}
            </div>

            <div className="approval-label">
              DECISIONS REQUIRING REVIEW
            </div>

            <div className="oversight-bar">
              <div
                style={{
                  width: `${Math.min(
                    data.human_approvals /
                      Math.max(
                        data.payments_analyzed,
                        1
                      ) *
                      100 *
                      8,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="analytics-note">
              Policy-controlled human intervention
            </div>

          </div>


          {/* ACTION ALLOCATION */}

          <div className="analytics-card action-card">

            <div className="card-heading">
              <span>
                AI ACTION ALLOCATION
              </span>

              <span className="card-number">
                03
              </span>
            </div>

            <div className="action-list">

              <div className="action-row">

                <div className="action-title">
                  <span className="action-dot retry" />
                  <span>Retry</span>
                </div>

                <div className="action-count">
                  {number(
                    data.action_allocation.Retry
                  )}
                </div>

                <div className="action-track">
                  <div
                    className="action-fill retry-fill"
                    style={{
                      width: `${actionPercent(
                        data.action_allocation.Retry
                      )}%`,
                    }}
                  />
                </div>

              </div>


              <div className="action-row">

                <div className="action-title">
                  <span className="action-dot reminder" />
                  <span>Reminder</span>
                </div>

                <div className="action-count">
                  {number(
                    data.action_allocation.Reminder
                  )}
                </div>

                <div className="action-track">
                  <div
                    className="action-fill reminder-fill"
                    style={{
                      width: `${actionPercent(
                        data.action_allocation.Reminder
                      )}%`,
                    }}
                  />
                </div>

              </div>


              <div className="action-row">

                <div className="action-title">
                  <span className="action-dot none" />
                  <span>No Action</span>
                </div>

                <div className="action-count">
                  {number(
                    data.action_allocation[
                      "No Action"
                    ]
                  )}
                </div>

                <div className="action-track">
                  <div
                    className="action-fill none-fill"
                    style={{
                      width: `${actionPercent(
                        data.action_allocation[
                          "No Action"
                        ]
                      )}%`,
                    }}
                  />
                </div>

              </div>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          DECISION INTELLIGENCE
      ===================================================== */}

      <section className="decision-section">

        <div className="decision-copy">

          <div className="eyebrow">
            DECISION INTELLIGENCE
          </div>

          <h2>
            One failed payment.
            <br />
            Multiple possible actions.
            <br />
            <span>One optimal decision.</span>
          </h2>

          <p>
            Reclaim does not blindly retry failed
            transactions. It evaluates payment
            context and expected recovery value,
            then selects the intervention with the
            strongest revenue outcome while respecting
            business policy.
          </p>

        </div>


        <div className="decision-flow">

          <div className="flow-step">
            <div className="flow-number">
              01
            </div>

            <strong>
              DETECT
            </strong>

            <span>
              Failed payment
            </span>
          </div>

          <div className="flow-line" />

          <div className="flow-step">
            <div className="flow-number">
              02
            </div>

            <strong>
              PREDICT
            </strong>

            <span>
              Recovery probability
            </span>
          </div>

          <div className="flow-line" />

          <div className="flow-step">
            <div className="flow-number">
              03
            </div>

            <strong>
              OPTIMIZE
            </strong>

            <span>
              Highest-value action
            </span>
          </div>

          <div className="flow-line" />

          <div className="flow-step">
            <div className="flow-number">
              04
            </div>

            <strong>
              EXECUTE
            </strong>

            <span>
              Guarded recovery
            </span>
          </div>

        </div>

      </section>


      {/* =====================================================
          TRUST / DIFFERENTIATORS
      ===================================================== */}

      <section className="trust-section">

        <div className="trust-card">

          <div className="trust-icon">
            AI
          </div>

          <div>
            <strong>
              AI-Driven Decisions
            </strong>

            <p>
              Recovery probability and expected
              revenue guide intervention selection.
            </p>
          </div>

        </div>


        <div className="trust-card">

          <div className="trust-icon">
            $
          </div>

          <div>
            <strong>
              Revenue Optimization
            </strong>

            <p>
              Decisions are evaluated by expected
              financial outcome, not simply accuracy.
            </p>
          </div>

        </div>


        <div className="trust-card">

          <div className="trust-icon">
            H
          </div>

          <div>
            <strong>
              Human Oversight
            </strong>

            <p>
              Sensitive decisions can be routed
              through controlled approval workflows.
            </p>
          </div>

        </div>


        <div className="trust-card">

          <div className="trust-icon">
            ✓
          </div>

          <div>
            <strong>
              Auditable Execution
            </strong>

            <p>
              Decisions and execution outcomes are
              recorded for operational accountability.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <div>
          <strong>
            RECLAIM
          </strong>

          <span>
            AI REVENUE RECOVERY
          </span>
        </div>

        <div className="footer-right">
          Decision Intelligence
          <span>•</span>
          Automated Recovery
          <span>•</span>
          Human Oversight
        </div>

      </footer>


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 10%,
              rgba(0, 214, 163, 0.055),
              transparent 30%
            ),
            #060809;
          color: #f3f6f5;
          padding: 30px 48px 55px;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }


        /* HEADER */

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 70px;
        }

        .brand {
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .tagline {
          color: #606b6e;
          font-size: 9px;
          letter-spacing: 2px;
          margin-top: 6px;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #7c8789;
          font-size: 9px;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d6a3;
          box-shadow:
            0 0 12px
            rgba(0, 214, 163, 0.7);
        }


        /* HERO */

        .hero {
          display: grid;
          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(320px, 0.75fr);
          gap: 60px;
          align-items: end;
          margin-bottom: 35px;
        }

        .eyebrow {
          color: #00d6a3;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 3px;
          margin-bottom: 17px;
        }

        h1 {
          margin: 0;
          font-size: clamp(48px, 6vw, 78px);
          line-height: 0.93;
          letter-spacing: -4px;
          font-weight: 800;
        }

        h1 span {
          color: #00d6a3;
        }

        .hero-copy p {
          max-width: 650px;
          color: #788285;
          font-size: 13px;
          line-height: 1.8;
          margin: 25px 0 0;
        }

        .hero-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .hero-pills span {
          border: 1px solid #20292a;
          background: #0b0f10;
          color: #657073;
          border-radius: 100px;
          padding: 7px 10px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
        }


        /* AGENT */

        .agent-panel {
          border: 1px solid #1d2826;
          background:
            linear-gradient(
              145deg,
              #0d1513,
              #090c0d
            );
          border-radius: 15px;
          padding: 23px;
          box-shadow:
            0 20px 70px
            rgba(0, 0, 0, 0.25);
        }

        .agent-panel-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .agent-label {
          color: #667174;
          font-size: 8px;
          letter-spacing: 2px;
          font-weight: 800;
        }

        .agent-state {
          color: #e5ece9;
          font-size: 15px;
          font-weight: 700;
          margin-top: 9px;
        }

        .agent-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #00d6a3;
          box-shadow:
            0 0 16px
            rgba(0, 214, 163, 0.5);
        }

        .agent-indicator.active {
          animation: pulse 0.9s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.35;
            transform: scale(0.7);
          }
        }

        .agent-description {
          color: #697376;
          font-size: 11px;
          line-height: 1.65;
          margin: 18px 0;
        }

        .agent-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 0;
          border-radius: 9px;
          padding: 15px 17px;
          background: #00d6a3;
          color: #03120e;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.2s,
            opacity 0.2s;
        }

        .agent-button:hover {
          transform: translateY(-2px);
        }

        .agent-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .button-arrow {
          font-size: 19px;
        }


        /* MESSAGE */

        .message {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #1b2925;
          background: #09110f;
          color: #87918f;
          border-radius: 9px;
          padding: 12px 15px;
          font-size: 11px;
          margin-bottom: 20px;
        }

        .message-icon {
          color: #00d6a3;
          font-size: 14px;
        }


        /* AGENT RESULT */

        .agent-result {
          border: 1px solid #1c302a;
          background: #09110f;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }

        .result-header h2 {
          font-size: 24px;
          letter-spacing: -1px;
          margin: 0;
        }

        .executed-badge {
          border: 1px solid #194d3e;
          background: #0b1c17;
          color: #00d6a3;
          border-radius: 100px;
          padding: 8px 12px;
          font-size: 8px;
          letter-spacing: 1px;
          font-weight: 900;
        }

        .result-grid {
          display: grid;
          grid-template-columns:
            repeat(6, 1fr);
          border-top: 1px solid #1b2825;
        }

        .result-item {
          padding: 17px 14px 4px 0;
          border-right: 1px solid #1b2825;
          margin-right: 14px;
        }

        .result-item:last-child {
          border-right: 0;
        }

        .result-item span {
          display: block;
          color: #5f696c;
          font-size: 8px;
          letter-spacing: 1.2px;
          font-weight: 800;
        }

        .result-item strong {
          display: block;
          color: #e8edeb;
          font-size: 14px;
          margin-top: 8px;
        }

        .result-item .action-value {
          color: #00d6a3;
        }


        /* METRICS */

        .metrics {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          border: 1px solid #1c2325;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .metric {
          padding: 24px;
          background: #0b0e10;
          border-right: 1px solid #1c2325;
          min-width: 0;
        }

        .metric:last-child {
          border-right: 0;
        }

        .metric.highlight {
          background:
            linear-gradient(
              145deg,
              #0c1714,
              #0a0f0e
            );
        }

        .metric-top {
          display: flex;
          justify-content: space-between;
        }

        .metric-label {
          color: #697477;
          font-size: 8px;
          letter-spacing: 1.7px;
          font-weight: 800;
        }

        .metric-index {
          color: #30393b;
          font-size: 8px;
        }

        .metric-value {
          margin-top: 16px;
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -1px;
          white-space: nowrap;
        }

        .metric-value.green {
          color: #00d6a3;
        }

        .metric-description {
          color: #555f62;
          font-size: 9px;
          line-height: 1.5;
          margin-top: 8px;
        }


        /* ANALYTICS */

        .analytics-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr 1.8fr;
          gap: 20px;
          margin-bottom: 70px;
        }

        .analytics-card {
          border: 1px solid #1c2325;
          background: #0b0e10;
          border-radius: 14px;
          padding: 22px;
          min-height: 210px;
        }

        .card-heading {
          display: flex;
          justify-content: space-between;
          color: #697477;
          font-size: 8px;
          letter-spacing: 1.7px;
          font-weight: 800;
        }

        .card-number {
          color: #30393b;
        }

        .recovery-number {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -2px;
          margin-top: 27px;
        }

        .progress-track {
          height: 6px;
          background: #1c2526;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 20px;
        }

        .progress-value {
          height: 100%;
          background: #00d6a3;
          border-radius: 10px;
          transition: width 0.6s ease;
        }

        .analytics-note {
          color: #555f62;
          font-size: 9px;
          margin-top: 13px;
        }

        .approval-label {
          color: #697477;
          font-size: 8px;
          letter-spacing: 1px;
          margin-top: 8px;
        }

        .oversight-bar {
          height: 5px;
          background: #1c2526;
          margin-top: 25px;
          border-radius: 10px;
          overflow: hidden;
        }

        .oversight-bar div {
          height: 100%;
          background: #768083;
        }


        /* ACTIONS */

        .action-list {
          margin-top: 18px;
        }

        .action-row {
          display: grid;
          grid-template-columns: 105px 70px 1fr;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .action-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b6bfbd;
          font-size: 10px;
        }

        .action-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .retry {
          background: #00d6a3;
        }

        .reminder {
          background: #87908e;
        }

        .none {
          background: #3e4749;
        }

        .action-count {
          text-align: right;
          color: #dce3e1;
          font-size: 12px;
          font-weight: 800;
        }

        .action-track {
          height: 5px;
          background: #1b2224;
          border-radius: 10px;
          overflow: hidden;
        }

        .action-fill {
          height: 100%;
          border-radius: 10px;
        }

        .retry-fill {
          background: #00d6a3;
        }

        .reminder-fill {
          background: #7d8887;
        }

        .none-fill {
          background: #3e4749;
        }


        /* DECISION */

        .decision-section {
          border-top: 1px solid #1c2325;
          border-bottom: 1px solid #1c2325;
          padding: 55px 0;
          display: grid;
          grid-template-columns:
            0.8fr 1.2fr;
          gap: 70px;
          align-items: center;
          margin-bottom: 25px;
        }

        .decision-copy h2 {
          font-size: 32px;
          line-height: 1.08;
          letter-spacing: -1.5px;
          margin: 0;
        }

        .decision-copy h2 span {
          color: #00d6a3;
        }

        .decision-copy p {
          max-width: 560px;
          color: #6f797b;
          font-size: 11px;
          line-height: 1.8;
          margin-top: 20px;
        }


        /* FLOW */

        .decision-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .flow-step {
          min-width: 105px;
          text-align: center;
        }

        .flow-number {
          color: #00d6a3;
          font-size: 9px;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .flow-step strong {
          display: block;
          color: #dfe6e3;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .flow-step span {
          display: block;
          color: #586265;
          font-size: 8px;
          line-height: 1.5;
          margin-top: 7px;
        }

        .flow-line {
          width: 35px;
          height: 1px;
          background: #263032;
        }


        /* TRUST */

        .trust-section {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 50px;
        }

        .trust-card {
          display: flex;
          gap: 13px;
          padding: 18px;
          border: 1px solid #171e20;
          background: #090c0d;
          border-radius: 11px;
        }

        .trust-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #1b332d;
          background: #0b1613;
          border-radius: 7px;
          color: #00d6a3;
          font-size: 8px;
          font-weight: 900;
        }

        .trust-card strong {
          color: #dbe2df;
          font-size: 10px;
        }

        .trust-card p {
          color: #596365;
          font-size: 8px;
          line-height: 1.6;
          margin: 6px 0 0;
        }


        /* FOOTER */

        footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #151b1d;
          padding-top: 25px;
          color: #4c5658;
          font-size: 8px;
          letter-spacing: 1px;
        }

        footer strong {
          color: #858e90;
          margin-right: 10px;
        }

        .footer-right {
          display: flex;
          gap: 9px;
        }


        /* LOADING */

        @media (max-width: 1100px) {

          .page {
            padding: 25px 25px 45px;
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .agent-panel {
            max-width: 600px;
          }

          .result-grid {
            grid-template-columns:
              repeat(3, 1fr);
            row-gap: 10px;
          }

          .analytics-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .action-card {
            grid-column: 1 / -1;
          }

          .decision-section {
            grid-template-columns: 1fr;
          }

          .trust-section {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }


        @media (max-width: 700px) {

          .page {
            padding: 20px 15px 40px;
          }

          .header {
            margin-bottom: 45px;
          }

          h1 {
            font-size: 47px;
            letter-spacing: -2.5px;
          }

          .metrics {
            grid-template-columns: 1fr;
          }

          .metric {
            border-right: 0;
            border-bottom: 1px solid #1c2325;
          }

          .metric:last-child {
            border-bottom: 0;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .action-card {
            grid-column: auto;
          }

          .result-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .decision-flow {
            flex-wrap: wrap;
          }

          .flow-line {
            width: 20px;
          }

          .trust-section {
            grid-template-columns: 1fr;
          }

          footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
          }

          .footer-right {
            flex-wrap: wrap;
          }
        }

      `}</style>

    </main>
  );
}