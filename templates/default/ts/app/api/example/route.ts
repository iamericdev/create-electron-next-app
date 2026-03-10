import { NextResponse } from "next/server";

// Example Post request
export async function POST(request: Request) {
  try {
    return NextResponse.json({
      message: "Hello World",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}

// Example GET request
export async function GET(request: Request) {
  try {
    return NextResponse.json({
      message: "Hello World",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
