"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAgentConfig, AgentVertical } from "@//lib/agents";

export default function ShortFormAgentPage() {
  const config = getAgentConfig("short-form" as AgentVertical);

  const [script, setScript] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [mp3Url, setMp3Url] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      // Call your AI script analysis endpoint
      const res = await fetch("/api/short-form/analyze-script", {
        method: "POST",
        body: JSON.stringify({ script }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setAnalysis(data.analysis);

      // Call your voiceover endpoint
      const voiceRes = await fetch("/api/short-form/generate-voice", {
        method: "POST",
        body: JSON.stringify({ script }),
        headers: { "Content-Type": "application/json" },
      });

      const voiceData = await voiceRes.json();
      setMp3Url(voiceData.mp3Url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">{config.name}</h1>
      <p>{config.firstMessage}</p>

      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Paste or type your script here..."
        className="w-full h-40 p-2 border rounded-md"
      />

      <Button onClick={handleGenerate} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Analyze & Generate Voice"}
      </Button>

      {analysis && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h2 className="font-semibold">Script Analysis:</h2>
          <pre>{analysis}</pre>
        </div>
      )}

      {mp3Url && (
        <div className="mt-4">
          <h2 className="font-semibold">Voiceover:</h2>
          <audio controls src={mp3Url}></audio>
          <a href={mp3Url} download className="ml-2 text-blue-600 underline">
            Download MP3
          </a>
        </div>
      )}
    </div>
  );
}
