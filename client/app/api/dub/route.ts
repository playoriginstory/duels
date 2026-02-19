import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const targetLang = formData.get("target_lang") as string;
    const sourceLang = formData.get("source_lang") as string;

    if (!file || !targetLang) {
      return NextResponse.json(
        { error: "File and target language required" },
        { status: 400 }
      );
    }

    const elevenForm = new FormData();
    elevenForm.append("file", file);
    elevenForm.append("target_lang", targetLang);
    elevenForm.append("source_lang", sourceLang || "auto");
    elevenForm.append("name", "Dubbing Agent Job");
    elevenForm.append("dubbing_studio", "false"); // Required for resource endpoint to work

    const response = await fetch(
      "https://api.elevenlabs.io/v1/dubbing",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: elevenForm,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Dubbing error:", error);
    return NextResponse.json({ error: "Dubbing failed" }, { status: 500 });
  }
}
