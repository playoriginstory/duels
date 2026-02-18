"use client";

import { useScribe } from "@elevenlabs/react";
import { useState } from "react";

export default function ClientTranscription() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onPartialTranscript: (data) => {
      console.log("Partial:", data.text);
    },
    onCommittedTranscript: (data) => {
      console.log("Committed:", data.text);
    },
  });

  const start = async () => {
    try {
      setConnecting(true);
      setError(null);

      const res = await fetch("/api/transcription/scribe-token");

      if (!res.ok) {
        throw new Error(`Token fetch failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Token response:", data);

      // Handle both { token: "xyz" } and bare string shapes from the SDK
      const tokenString =
      typeof data === "string"
        ? data
        : typeof data.token === "string"
        ? data.token
        : typeof data.token?.token === "string"
        ? data.token.token
        : null;
    
    if (!tokenString) {
      throw new Error("Invalid token format returned from server");
    }
    
    await scribe.connect({
      token: tokenString,
      microphone: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Scribe connect error:", message);
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-gray-200">

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={start}
          disabled={scribe.isConnected || connecting}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Start Listening"}
        </button>

        <button
          onClick={scribe.disconnect}
          disabled={!scribe.isConnected}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      {/* Connection status */}
      <p className="text-sm text-zinc-500">
        Status: {connecting ? "Connecting..." : scribe.isConnected ? "🟢 Connected" : "⚪ Idle"}
      </p>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Live Transcript */}
      {scribe.partialTranscript && (
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <p className="text-gray-400 italic">
            Live: {scribe.partialTranscript}
          </p>
        </div>
      )}

      {/* Committed Transcripts */}
      <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[80px]">
        {scribe.committedTranscripts.length === 0 && (
          <p className="text-zinc-600 text-sm italic">Transcription will appear here...</p>
        )}
        {scribe.committedTranscripts.map((t) => (
          <p key={t.id} className="text-gray-300 text-lg leading-relaxed">
            {t.text}
          </p>
        ))}
      </div>

    </div>
  );
}
