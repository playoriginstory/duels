import { NextResponse } from "next/server";

const ELEVEN_API_KEY = process.env.ELEVEN_LABS_API_KEY;

export async function POST(req: Request) {
  try {
    const { script, voiceId } = await req.json();
    if (!script || !voiceId) {
      return NextResponse.json({ error: "Missing script or voiceId" }, { status: 400 });
    }

    if (!ELEVEN_API_KEY) {
      return NextResponse.json({ error: "Eleven Labs API key not set" }, { status: 500 });
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: script, voice_settings: { stability: 0.5, similarity_boost: 0.5 } }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.message || "Eleven Labs TTS failed");
    }

    const audioBuffer = await res.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const mp3Url = `data:audio/mpeg;base64,${base64Audio}`;

    return NextResponse.json({ mp3Url });
  } catch (err: any) {
    console.error("Generate voice error:", err);
    return NextResponse.json({ error: err.message || "Voice generation failed" }, { status: 500 });
  }
}
