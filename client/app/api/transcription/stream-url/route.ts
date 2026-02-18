import { NextResponse } from "next/server";
import { ElevenLabsClient, RealtimeEvents } from "@elevenlabs/elevenlabs-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ELEVENLABS_API_KEY" },
        { status: 500 }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Instantiate inside the handler - avoids stale client at module load time
    // when env vars may not yet be available
    const elevenlabs = new ElevenLabsClient({ apiKey });

    const connection = await elevenlabs.speechToText.realtime.connect({
      modelId: "scribe_v2_realtime",
      includeTimestamps: true,
    });

    let finalTranscript = "";

    connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
      finalTranscript += data.text + " ";
    });

    connection.on(RealtimeEvents.ERROR, (err) => {
      console.error("Realtime error:", err);
    });

    // Fetch the audio from the URL and pipe it to the connection
    const audioRes = await fetch(url);

    if (!audioRes.ok || !audioRes.body) {
      return NextResponse.json(
        { error: `Failed to fetch audio URL: ${audioRes.status}` },
        { status: 400 }
      );
    }

    const reader = audioRes.body.getReader();

    // Stream audio chunks into the realtime connection
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const base64 = Buffer.from(value).toString("base64");
      connection.send({ audioBase64: base64 });
    }

    // Signal end of audio and wait for final transcript
    connection.commit();

    // Wait for committed transcript(s) to come back - adjust timeout as needed
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await connection.close();

    return NextResponse.json({
      transcript: finalTranscript.trim(),
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Streaming failed:", message);
    return NextResponse.json({ error: "Streaming failed", detail: message }, { status: 500 });
  }
}