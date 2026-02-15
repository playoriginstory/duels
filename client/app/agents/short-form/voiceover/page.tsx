"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function VoiceoverProductionPage() {
  const [script, setScript] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [language, setLanguage] = useState("en");
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
  const [translationVoiceId, setTranslationVoiceId] = useState("");
  const [translationLanguage, setTranslationLanguage] = useState("en");
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);

  // Fetch Eleven Labs voices on mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch("/api/short-form/list-voices");
        const data = await res.json();
        setVoices(data.voices);
      } catch (err) {
        console.error("Failed to fetch voices:", err);
      }
    };
    fetchVoices();
  }, []);

  // Upload script file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setScript(text);
  };

  // Analyze script
  const handleAnalyze = async () => {
    if (!script) return alert("Please enter a script first.");

    setLoading(true);
    setAudio(null);
    setTranslatedAudio(null);

    try {
      const res = await fetch("/api/short-form/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setAnalyzed(true);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze script");
    } finally {
      setLoading(false);
    }
  };

  // Generate main voice
  const handleGenerate = async () => {
    if (!voiceId) return alert("Select a voice first.");

    setLoading(true);
    setAudio(null);

    try {
      const res = await fetch("/api/short-form/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          voiceId,
          language,
        }),
      });
      const data = await res.json();
      setAudio(`data:audio/mp3;base64,${data.audio}`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate voiceover");
    } finally {
      setLoading(false);
    }
  };

  // Generate translated voice
  const handleTranslate = async () => {
    if (!translationVoiceId) return alert("Select a translation voice first.");

    setLoading(true);
    setTranslatedAudio(null);

    try {
      const res = await fetch("/api/short-form/translate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          voiceId: translationVoiceId,
          language: translationLanguage,
        }),
      });
      const data = await res.json();
      setTranslatedAudio(`data:audio/mp3;base64,${data.audio}`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate translated voiceover");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Voiceover Production</h1>

      {/* Script Input */}
      <textarea
        className="w-full border p-3 rounded"
        rows={6}
        placeholder="Paste your script..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      {/* File Upload */}
      <input type="file" accept=".txt" onChange={handleFileUpload} />

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

      {/* Voice Select and Generate */}
      {analyzed && (
        <>
          <label className="block mb-1 font-semibold">Select Voice</label>
          <select
            className="border p-2 rounded w-full mb-2"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
          >
            <option value="">-- Choose Voice --</option>
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Voice"}
          </Button>

          {/* Translation Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Optional Translation Voice</h3>

            <label className="block mb-1">Select Voice</label>
            <select
              className="border p-2 rounded w-full mb-2"
              value={translationVoiceId}
              onChange={(e) => setTranslationVoiceId(e.target.value)}
            >
              <option value="">-- Choose Voice --</option>
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <label className="block mb-1">Target Language</label>
            <select
              className="border p-2 rounded w-full mb-2"
              value={translationLanguage}
              onChange={(e) => setTranslationLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>

            <Button onClick={handleTranslate} disabled={loading}>
              {loading ? "Generating..." : "Generate Translation"}
            </Button>
          </div>
        </>
      )}

      {/* Audio Players */}
      {audio && (
        <div className="mt-4">
          <h4 className="font-semibold">Original Voiceover</h4>
          <audio controls className="w-full">
            <source src={audio} type="audio/mp3" />
          </audio>
        </div>
      )}

      {translatedAudio && (
        <div className="mt-4">
          <h4 className="font-semibold">Translated Voiceover</h4>
          <audio controls className="w-full">
            <source src={translatedAudio} type="audio/mp3" />
          </audio>
        </div>
      )}
    </div>
  );
}
