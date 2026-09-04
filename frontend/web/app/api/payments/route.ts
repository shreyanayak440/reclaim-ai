import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/payments",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Backend returned an error",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("PAYMENTS PROXY ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Flask backend",
      },
      { status: 502 }
    );
  }
}