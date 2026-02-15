"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function VoiceoverService() {
  const [script, setScript] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [language, setLanguage] = useState("en");
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Upload script file
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setScript(text);
  };

  // Step 1: Analyze script
  const handleAnalyze = async () => {
    if (!script) return alert("Please enter a script first.");

    setLoading(true);
    setAudio(null);

    const res = await fetch("/api/analyze-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script }),
    });

    const data = await res.json();
    setAnalysis(data.analysis);
    setAnalyzed(true);
    setLoading(false);
  };

  // Step 2: Generate Voice
  const handleGenerate = async () => {
    if (!voiceId) return alert("Select a voice first.");

    setLoading(true);

    const res = await fetch("/api/voiceover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: script,
        voiceId,
        language,
      }),
    });

    const data = await res.json();
    setAudio(`data:audio/mp3;base64,${data.audio}`);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">

      <h1 className="text-2xl font-bold">Voiceover Duel</h1>

      {/* Script Input */}
      <textarea
        className="w-full border p-3 rounded"
        rows={6}
        placeholder="Paste your script..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      {/* File Upload */}
      <input
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
      />

      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
      </select>

      {/* Analyze Button */}
      <Button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Script"}
      </Button>

      {/* Analysis Output */}
      {analysis && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Agent Feedback</h2>
          <p className="text-sm whitespace-pre-wrap">{analysis}</p>
        </div>
      )}

      {/* Voice Select */}
      {analyzed && (
        <>
          <input
            type="text"
            placeholder="Enter Voice ID"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Final Voice"}
          </Button>
        </>
      )}

      {/* Audio Player */}
      {audio && (
        <audio controls className="w-full">
          <source src={audio} type="audio/mp3" />
        </audio>
      )}
    </div>
  );
}
