import { NextResponse } from "next/server";
import { ElevenLabsClient, RealtimeEvents } from "@elevenlabs/elevenlabs-js";

export const runtime = "nodejs";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const connection = await elevenlabs.speechToText.realtime.connect({
      modelId: "scribe_v2_realtime",
      url,
      includeTimestamps: true,
    });

    let finalTranscript = "";

    connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
      finalTranscript += data.text + " ";
    });

    connection.on(RealtimeEvents.ERROR, (err) => {
      console.error("Realtime error:", err);
    });

    // Wait some seconds or build streaming response (advanced)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    await connection.close();

    return NextResponse.json({
      transcript: finalTranscript.trim(),
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Streaming failed" }, { status: 500 });
  }
}
