import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure your API key is correctly loaded.
// The '!' non-null assertion operator assumes the environment variable is always present.
// Consider adding a fallback or robust error handling if it might be missing.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const ELEVEN_API_KEY = process.env.ELEVEN_LABS_API_KEY; // This variable is not used in the provided snippet, but kept.

export async function POST(req: Request) {
  try {
    const { script, language, useElevenLabs } = await req.json();

    if (!script || !language)
      return NextResponse.json({ error: "Missing script or language" }, { status: 400 });

    // If the language is English, no translation is needed, return the original script.
    if (language === "en") return NextResponse.json({ translatedScript: script });

    // Use Gemini for translation if not explicitly using Eleven Labs (or if Eleven Labs isn't for translation here)
    if (!useElevenLabs) {
      // Get the generative model instance
      // "gemini-pro" is typically used for text-only tasks like translation.
      // "gemini-3-flash-preview" is likely an incorrect or outdated model name for the public API.
      // Always refer to Google AI's official documentation for current model names (e.g., 'gemini-1.5-flash-latest').
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Translate the following short-form video script into ${language} without changing meaning:

${script}`;

      // Use generateContent on the model instance
      const result = await model.generateContent(prompt);
      const response = result.response;
      const translatedScript = response.text(); // Extract the translated text

      return NextResponse.json({ translatedScript });
    }

    // If useElevenLabs is true, and the intention is that Eleven Labs handles
    // the text-to-speech *after* translation, you might still need to translate here.
    // If the intention is that Eleven Labs itself can perform translation + TTS,
    // then returning the original script might be correct for that specific flow.
    // Based on the comment, it seems like the latter.
    return NextResponse.json({ translatedScript: script });
  } catch (err: any) {
    console.error("Translate script error:", err);
    return NextResponse.json({ error: err.message || "Translation failed" }, { status: 500 });
  }
}