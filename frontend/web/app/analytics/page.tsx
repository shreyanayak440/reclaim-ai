"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://127.0.0.1:5000";

type DashboardData = {
  payments_analyzed: number;
  revenue_at_risk: number;
  expected_recovery: number;
  net_expected_recovery: number;
  recovery_rate: number;
  human_approvals: number;
  action_allocation: {
    "No Action"?: number;
    Reminder?: number;
    Retry?: number;
  };
};

export default function Home() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [agentRunning, setAgentRunning] =
    useState(false);

  const [agentMessage, setAgentMessage] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/dashboard`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Dashboard API returned ${response.status}`
        );
      }

      const json = await response.json();

      setData(json);

    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        "Unable to connect to Reclaim backend."
      );
    } finally {
      setLoading(false);
    }
  }


  async function runAgent() {
    try {
      setAgentRunning(true);
      setAgentMessage("");

      const response = await fetch(
        `${API}/api/run-agent`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Agent returned ${response.status}`
        );
      }

      const result = await response.json();

      setAgentMessage(
        result.message ||
        "Recovery agent completed successfully."
      );

      await loadDashboard();

    } catch (err) {
      console.error(
        "Agent error:",
        err
      );

      setAgentMessage(
        "Recovery agent could not be executed."
      );

    } finally {
      setAgentRunning(false);
    }
  }


  function money(value: number) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value || 0);
  }


  function number(value: number) {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(value || 0);
  }


  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loader">
          <div className="dot" />
          <span>
            LOADING RECLAIM
          </span>
        </div>

        <style jsx>{`

          .loadingPage {
            min-height: 100vh;
            background: #07090b;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, Helvetica, sans-serif;
          }

          .loader {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #6c777a;
            font-size: 10px;
            letter-spacing: 2px;
          }

          .dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #00d6a3;
            box-shadow:
              0 0 12px #00d6a3;
          }

        `}</style>
      </main>
    );
  }


  if (error || !data) {
    return (
      <main className="errorPage">

        <div className="errorBox">

          <div className="logo">
            RECLAIM
          </div>

          <h1>
            Backend Connection Failed
          </h1>

          <p>
            {error ||
              "Dashboard data is unavailable."}
          </p>

          <button
            onClick={loadDashboard}
          >
            RETRY CONNECTION
          </button>

          <div className="hint">
            Make sure Flask is running on
            127.0.0.1:5000.
          </div>

        </div>

        <style jsx>{`

          .errorPage {
            min-height: 100vh;
            background: #07090b;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, Helvetica, sans-serif;
          }

          .errorBox {
            width: 420px;
            max-width: 90%;
            text-align: center;
            padding: 40px;
            background: #0c0f11;
            border: 1px solid #202629;
            border-radius: 12px;
          }

          .logo {
            color: #00d6a3;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 2px;
          }

          h1 {
            font-size: 22px;
            margin-top: 25px;
          }

          p {
            color: #697477;
            font-size: 12px;
            line-height: 1.6;
          }

          button {
            margin-top: 20px;
            padding: 12px 18px;
            border: none;
            border-radius: 6px;
            background: #00d6a3;
            color: #06100d;
            font-weight: 700;
            cursor: pointer;
          }

          .hint {
            margin-top: 20px;
            color: #414b4e;
            font-size: 9px;
          }

        `}</style>

      </main>
    );
  }


  const retry =
    data.action_allocation?.Retry || 0;

  const reminder =
    data.action_allocation?.Reminder || 0;

  const noAction =
    data.action_allocation?.[
      "No Action"
    ] || 0;


  return (
    <main className="page">

      {/* ================================================= */}
      {/* NAVIGATION */}
      {/* ================================================= */}

      <nav className="navigation">

        <Link
          href="/"
          className="brand"
        >
          RECLAIM
        </Link>

        <div className="navLinks">

          <Link
            href="/"
            className="navLink active"
          >
            Dashboard
          </Link>

          <Link
            href="/decisions"
            className="navLink"
          >
            Decisions
          </Link>

          <Link
            href="/analytics"
            className="navLink"
          >
            Analytics
          </Link>

          <Link
            href="/audit"
            className="navLink"
          >
            Audit
          </Link>

        </div>

        <div className="online">

          <span />

          AI ENGINE ONLINE

        </div>

      </nav>


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section className="hero">

        <div className="eyebrow">
          REVENUE RECOVERY INTELLIGENCE
        </div>

        <h1>
          Recover more.
          <br />
          Lose less.
        </h1>

        <p>
          AI-powered decision intelligence
          for failed payment recovery.
        </p>

      </section>


      {/* ================================================= */}
      {/* AGENT CONTROL */}
      {/* ================================================= */}

      <section className="agentBar">

        <div>

          <div className="agentTitle">
            RECOVERY AGENT
          </div>

          <div className="agentDescription">
            Analyze failed payments and
            execute optimal recovery actions.
          </div>

        </div>

        <button
          className={
            agentRunning
              ? "agentButton running"
              : "agentButton"
          }
          onClick={runAgent}
          disabled={agentRunning}
        >

          {agentRunning
            ? "RUNNING..."
            : "RUN RECOVERY AGENT →"}

        </button>

      </section>


      {agentMessage && (

        <div className="agentMessage">
          {agentMessage}
        </div>

      )}


      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <section className="kpis">

        <div className="card">

          <div className="cardLabel">
            PAYMENTS ANALYZED
          </div>

          <div className="cardValue">
            {number(
              data.payments_analyzed
            )}
          </div>

          <div className="cardHint">
            Failed payments processed
          </div>

        </div>


        <div className="card">

          <div className="cardLabel">
            REVENUE AT RISK
          </div>

          <div className="cardValue">
            {money(
              data.revenue_at_risk
            )}
          </div>

          <div className="cardHint">
            Total payment exposure
          </div>

        </div>


        <div className="card highlight">

          <div className="cardLabel">
            EXPECTED RECOVERY
          </div>

          <div className="cardValue green">
            {money(
              data.expected_recovery
            )}
          </div>

          <div className="cardHint">
            AI predicted recovery
          </div>

        </div>


        <div className="card highlight">

          <div className="cardLabel">
            RECOVERY RATE
          </div>

          <div className="cardValue green">
            {data.recovery_rate}%
          </div>

          <div className="cardHint">
            Expected recovery ratio
          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* MAIN GRID */}
      {/* ================================================= */}

      <section className="mainGrid">


        {/* --------------------------------------------- */}
        {/* RECOVERY VALUE */}
        {/* --------------------------------------------- */}

        <div className="panel">

          <div className="eyebrow">
            FINANCIAL IMPACT
          </div>

          <h2>
            Expected Recovery
          </h2>

          <div className="bigNumber">
            {money(
              data.net_expected_recovery
            )}
          </div>

          <div className="muted">
            Net expected recovery
          </div>


          <div className="metricRow">

            <span>
              Gross expected recovery
            </span>

            <strong>
              {money(
                data.expected_recovery
              )}
            </strong>

          </div>


          <div className="metricRow">

            <span>
              Revenue at risk
            </span>

            <strong>
              {money(
                data.revenue_at_risk
              )}
            </strong>

          </div>


          <div className="metricRow">

            <span>
              Human approvals
            </span>

            <strong>
              {number(
                data.human_approvals
              )}
            </strong>

          </div>

        </div>


        {/* --------------------------------------------- */}
        {/* ACTION ALLOCATION */}
        {/* --------------------------------------------- */}

        <div className="panel">

          <div className="eyebrow">
            AI DECISION ENGINE
          </div>

          <h2>
            Action Allocation
          </h2>

          <div className="muted">
            Recommended recovery strategy
          </div>


          <div className="actionList">


            {/* RETRY */}

            <div className="actionItem">

              <div className="actionHeader">

                <span>
                  Retry
                </span>

                <strong>
                  {number(retry)}
                </strong>

              </div>

              <div className="bar">

                <div
                  className="barFill"
                  style={{
                    width:
                      `${(
                        retry /
                        data.payments_analyzed
                      ) * 100}%`,
                  }}
                />

              </div>

            </div>


            {/* REMINDER */}

            <div className="actionItem">

              <div className="actionHeader">

                <span>
                  Reminder
                </span>

                <strong>
                  {number(reminder)}
                </strong>

              </div>

              <div className="bar">

                <div
                  className="barFill"
                  style={{
                    width:
                      `${(
                        reminder /
                        data.payments_analyzed
                      ) * 100}%`,
                  }}
                />

              </div>

            </div>


            {/* NO ACTION */}

            <div className="actionItem">

              <div className="actionHeader">

                <span>
                  No Action
                </span>

                <strong>
                  {number(noAction)}
                </strong>

              </div>

              <div className="bar">

                <div
                  className="barFill"
                  style={{
                    width:
                      `${(
                        noAction /
                        data.payments_analyzed
                      ) * 100}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* QUICK ACCESS */}
      {/* ================================================= */}

      <section className="quickSection">

        <div className="sectionTitle">
          QUICK ACCESS
        </div>

        <div className="quickGrid">


          <Link
            href="/decisions"
            className="quickCard"
          >

            <div className="quickNumber">
              01
            </div>

            <div>

              <h3>
                Payment Decisions
              </h3>

              <p>
                Review AI recovery
                recommendations.
              </p>

            </div>

            <span className="arrow">
              →
            </span>

          </Link>


          <Link
            href="/analytics"
            className="quickCard"
          >

            <div className="quickNumber">
              02
            </div>

            <div>

              <h3>
                Analytics
              </h3>

              <p>
                Explore recovery
                performance.
              </p>

            </div>

            <span className="arrow">
              →
            </span>

          </Link>


          <Link
            href="/audit"
            className="quickCard"
          >

            <div className="quickNumber">
              03
            </div>

            <div>

              <h3>
                Audit Log
              </h3>

              <p>
                Track agent decisions
                and outcomes.
              </p>

            </div>

            <span className="arrow">
              →
            </span>

          </Link>

        </div>

      </section>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer>

        <span>
          RECLAIM AI REVENUE RECOVERY
        </span>

        <span>
          DECISION INTELLIGENCE •
          AUTOMATED RECOVERY
        </span>

      </footer>


      {/* ================================================= */}
      {/* STYLES */}
      {/* ================================================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        .page {
          min-height: 100vh;
          background: #07090b;
          color: #edf2f2;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          padding-bottom: 60px;
        }


        /* NAVIGATION */

        .navigation {
          height: 68px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom:
            1px solid #1e2528;
          background: #080b0d;
        }


        .brand {
          color: white;
          text-decoration: none;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }


        .navLinks {
          display: flex;
          gap: 5px;
        }


        .navLink {
          color: #697477;
          text-decoration: none;
          font-size: 11px;
          padding: 9px 15px;
          border-radius: 6px;
          transition: 0.2s;
        }


        .navLink:hover {
          color: white;
          background: #111618;
        }


        .navLink.active {
          color: #00d6a3;
          background: #10221e;
        }


        .online {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #00d6a3;
          font-size: 9px;
          letter-spacing: 1px;
        }


        .online span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d6a3;
          box-shadow:
            0 0 10px #00d6a3;
        }


        /* HERO */

        .hero {
          padding:
            65px 40px 38px;
          max-width: 1000px;
        }


        .eyebrow {
          color: #00d6a3;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
        }


        h1 {
          margin: 12px 0;
          font-size: 52px;
          line-height: 1.02;
          letter-spacing: -2.5px;
        }


        .hero p {
          margin-top: 17px;
          color: #697477;
          font-size: 13px;
        }


        /* AGENT */

        .agentBar {
          margin:
            0 40px 14px;
          padding: 18px 20px;
          border:
            1px solid #20282a;
          border-radius: 9px;
          background: #0c1011;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }


        .agentTitle {
          color: #00d6a3;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }


        .agentDescription {
          color: #687376;
          font-size: 10px;
          margin-top: 6px;
        }


        .agentButton {
          border: none;
          border-radius: 6px;
          padding: 12px 18px;
          background: #00d6a3;
          color: #06100d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
        }


        .agentButton:hover {
          opacity: 0.9;
        }


        .agentButton.running {
          opacity: 0.6;
          cursor: wait;
        }


        .agentMessage {
          margin:
            0 40px 14px;
          padding: 11px 15px;
          border:
            1px solid #16473b;
          background: #0b1d19;
          border-radius: 6px;
          color: #00d6a3;
          font-size: 10px;
        }


        /* KPI */

        .kpis {
          padding:
            0 40px;
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
        }


        .card {
          padding: 21px;
          background: #0c1011;
          border:
            1px solid #20282a;
          border-radius: 9px;
        }


        .card.highlight {
          border-color: #163b33;
        }


        .cardLabel {
          color: #687376;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.4px;
        }


        .cardValue {
          margin-top: 14px;
          font-size: 25px;
          font-weight: 700;
        }


        .cardHint {
          margin-top: 7px;
          color: #4c575a;
          font-size: 9px;
        }


        .green {
          color: #00d6a3;
        }


        /* MAIN GRID */

        .mainGrid {
          padding:
            12px 40px 0;
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 12px;
        }


        .panel {
          padding: 24px;
          background: #0c1011;
          border:
            1px solid #20282a;
          border-radius: 9px;
        }


        h2 {
          margin:
            9px 0 5px;
          font-size: 19px;
        }


        .muted {
          color: #596467;
          font-size: 10px;
        }


        .bigNumber {
          margin-top: 28px;
          color: #00d6a3;
          font-size: 34px;
          font-weight: 700;
        }


        .metricRow {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom:
            1px solid #1b2224;
          color: #667174;
          font-size: 10px;
        }


        .metricRow strong {
          color: #cbd2d3;
        }


        /* ACTIONS */

        .actionList {
          margin-top: 28px;
        }


        .actionItem {
          margin-bottom: 22px;
        }


        .actionHeader {
          display: flex;
          justify-content: space-between;
          color: #aeb7b8;
          font-size: 10px;
          margin-bottom: 8px;
        }


        .actionHeader strong {
          color: #d3d9da;
        }


        .bar {
          height: 7px;
          background: #181e20;
          border-radius: 10px;
          overflow: hidden;
        }


        .barFill {
          height: 100%;
          background: #00d6a3;
          border-radius: 10px;
        }


        /* QUICK ACCESS */

        .quickSection {
          padding:
            30px 40px 0;
        }


        .sectionTitle {
          color: #4e595c;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.8px;
          margin-bottom: 11px;
        }


        .quickGrid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }


        .quickCard {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px;
          text-decoration: none;
          color: white;
          background: #0c1011;
          border:
            1px solid #20282a;
          border-radius: 9px;
          transition: 0.2s;
        }


        .quickCard:hover {
          border-color: #31534a;
          transform: translateY(-2px);
        }


        .quickNumber {
          color: #00d6a3;
          font-size: 9px;
        }


        .quickCard h3 {
          margin: 0;
          font-size: 12px;
        }


        .quickCard p {
          margin:
            5px 0 0;
          color: #596467;
          font-size: 9px;
        }


        .arrow {
          margin-left: auto;
          color: #00d6a3;
          font-size: 16px;
        }


        /* FOOTER */

        footer {
          margin:
            45px 40px 0;
          padding-top: 20px;
          border-top:
            1px solid #1a2022;
          display: flex;
          justify-content: space-between;
          color: #3e484b;
          font-size: 8px;
          letter-spacing: 1px;
        }


        /* RESPONSIVE */

        @media (max-width: 850px) {

          .navigation {
            padding: 12px 18px;
            height: auto;
            flex-wrap: wrap;
            gap: 12px;
          }


          .navLinks {
            order: 3;
            width: 100%;
            justify-content: center;
            overflow-x: auto;
          }


          .online {
            display: none;
          }


          .hero {
            padding:
              45px 20px 30px;
          }


          h1 {
            font-size: 42px;
          }


          .agentBar {
            margin:
              0 20px 14px;
          }


          .kpis {
            padding: 0 20px;
            grid-template-columns:
              1fr 1fr;
          }


          .mainGrid {
            padding:
              12px 20px 0;
            grid-template-columns: 1fr;
          }


          .quickSection {
            padding:
              25px 20px 0;
          }


          .quickGrid {
            grid-template-columns: 1fr;
          }


          footer {
            margin:
              40px 20px 0;
            flex-direction: column;
            gap: 10px;
          }

        }


        @media (max-width: 500px) {

          .kpis {
            grid-template-columns: 1fr;
          }


          .agentBar {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }


          .agentButton {
            width: 100%;
          }


          h1 {
            font-size: 36px;
          }

        }

      `}</style>

    </main>
  );
}