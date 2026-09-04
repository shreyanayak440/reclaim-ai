"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Decisions", path: "/decisions" },
    { name: "Analytics", path: "/analytics" },
    { name: "Audit", path: "/audit" },
  ];

  return (
    <nav className="navigation">

      <Link href="/" className="brand">
        RECLAIM
      </Link>

      <div className="links">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={
              pathname === link.path
                ? "link active"
                : "link"
            }
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="online">
        <span />
        AI ONLINE
      </div>

      <style jsx>{`
        .navigation {
          width: 100%;
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: #080b0d;
          border-bottom: 1px solid #202629;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
        }

        .brand {
          color: white;
          text-decoration: none;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .links {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .link {
          color: #707a7d;
          text-decoration: none;
          font-size: 11px;
          padding: 9px 14px;
          border-radius: 6px;
          transition: 0.2s;
        }

        .link:hover {
          color: white;
          background: #111618;
        }

        .link.active {
          color: #00d6a3;
          background: #10221e;
        }

        .online {
          color: #00d6a3;
          font-size: 9px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .online span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d6a3;
          box-shadow: 0 0 8px #00d6a3;
        }

        @media (max-width: 700px) {
          .navigation {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .links {
            order: 3;
            width: 100%;
            justify-content: center;
            overflow-x: auto;
          }

          .online {
            display: none;
          }
        }
      `}</style>

    </nav>
  );
}