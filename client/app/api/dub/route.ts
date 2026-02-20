import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const MAX_DUBS = 3;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let dubsRemaining = MAX_DUBS;
    let wallet = "";

    if (authHeader) {
      // If token is provided, verify it
      try {
        const payload = jwt.verify(authHeader.replace("Bearer ", ""), process.env.JWT_SECRET!) as any;
        wallet = payload.wallet;
        dubsRemaining = payload.dubsRemaining ?? MAX_DUBS;
      } catch (err) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } else {
      // No token yet — wallet must be in formData
      const formData = await req.formData();
      wallet = formData.get("wallet") as string;
      if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    if (dubsRemaining <= 0) {
      return NextResponse.json({ error: "No dubs remaining" }, { status: 403 });
    }

    // Grab file + language from formData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const targetLang = formData.get("target_lang") as string;
    const sourceLang = (formData.get("source_lang") as string) || "auto";

    if (!file || !targetLang) {
      return NextResponse.json({ error: "File and target language required" }, { status: 400 });
    }

    // Send to ElevenLabs
    const elevenForm = new FormData();
    elevenForm.append("file", file);
    elevenForm.append("target_lang", targetLang);
    elevenForm.append("source_lang", sourceLang);
    elevenForm.append("name", "Dubbing Agent Job");
    elevenForm.append("dubbing_studio", "false");

    const response = await fetch("https://api.elevenlabs.io/v1/dubbing", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
      body: elevenForm,
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data }, { status: 500 });

    // Create new token with decremented dubs
    const newToken = jwt.sign(
      { wallet, dubsRemaining: dubsRemaining - 1 },
      process.env.JWT_SECRET!,
      { expiresIn: "6h" }
    );

    return NextResponse.json({ ...data, token: newToken });
  } catch (error) {
    console.error("Dubbing error:", error);
    return NextResponse.json({ error: "Dubbing failed" }, { status: 500 });
  }
}
