"use client";

import { useScribe } from "@elevenlabs/react";
import { useState } from "react";

export default function ClientTranscription() {
  const [connecting, setConnecting] = useState(false);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    includeTimestamps: true,
    onPartialTranscript: (data) => {
      console.log("Partial:", data.text);
    },
  });

  const start = async () => {
    setConnecting(true);

    const res = await fetch("/api/transcription/scribe-token");
    const { token } = await res.json();

    await scribe.connect({
      token,
      microphone: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    setConnecting(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={start} disabled={scribe.isConnected || connecting}>
        Start Listening
      </button>

      <button onClick={scribe.disconnect} disabled={!scribe.isConnected}>
        Stop
      </button>

      {scribe.partialTranscript && (
        <p className="text-blue-500">
          Live: {scribe.partialTranscript}
        </p>
      )}

      <div>
        {scribe.committedTranscripts.map((t) => (
          <p key={t.id}>{t.text}</p>
        ))}
      </div>
    </div>
  );
}
