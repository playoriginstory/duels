import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const runtime = "nodejs";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function GET() {
  try {
    const token = await elevenlabs.tokens.singleUse.create("realtime_scribe");

    return NextResponse.json({ token: token.token });
  } catch (err: any) {
    console.error("Token error:", err);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
