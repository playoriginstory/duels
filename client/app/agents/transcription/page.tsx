"use client";

import { useState } from "react";
import ClientTranscription from "./TranscriptionClient";

export default function TranscriptionPage() {
  const [mode, setMode] = useState<"client" | "server" | null>(null);
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");

  const handleUrlTranscribe = async () => {
    const res = await fetch("/api/transcription/stream-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setTranscript(data.transcript || "");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Realtime Transcription Agent</h1>

      <div className="flex gap-4">
        <button onClick={() => setMode("client")}>
          🎙 Live (Client Side)
        </button>

        <button onClick={() => setMode("server")}>
          🌐 Stream from URL
        </button>
      </div>

      {mode === "client" && <ClientTranscription />}

      {mode === "server" && (
        <div className="space-y-4">
          <input
            className="border p-2 w-full"
            placeholder="Paste audio stream URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button onClick={handleUrlTranscribe}>
            Start Transcription
          </button>

          {transcript && (
            <div className="border p-4 bg-gray-100">
              {transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
