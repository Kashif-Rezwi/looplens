import { NextResponse } from "next/server";
import type { ProjectReport } from "@/types/report";
import { publishReport } from "@/server/reports";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { report?: ProjectReport };

    if (!body.report) {
      return NextResponse.json({ error: "Report payload is required." }, { status: 400 });
    }

    const result = await publishReport(body.report);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not publish report." },
      { status: 400 }
    );
  }
}
