import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Health proxy error:", error);

    return NextResponse.json(
      { error: "Cannot connect to Reclaim backend" },
      { status: 502 }
    );
  }
}