import { NextResponse } from "next/server";

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/dashboard",
      {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Backend dashboard request failed",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    clearTimeout(timeout);

    console.error("RECLAIM DASHBOARD PROXY ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Reclaim backend",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}