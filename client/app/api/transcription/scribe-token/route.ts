import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ELEVENLABS_API_KEY" },
        { status: 500 }
      );
    }

    const elevenlabs = new ElevenLabsClient({ apiKey });

    // SDK returns { token: "sutkn_..." } — pass it through directly
    // The client destructures: const { token } = await res.json()
    const tokenData = await elevenlabs.tokens.singleUse.create("realtime_scribe");

    console.log("SDK tokenData:", tokenData); // verify shape in server logs

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Token creation error:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}