"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Voice {
  id: string;
  name: string;
}

interface RewriteOption {
  label: string;
  text: string;
}

export default function ShortFormVoiceoverPage() {
  const [script, setScript] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [rewrites, setRewrites] = useState<RewriteOption[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH VOICES
  ========================== */
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch("/api/short-form/list-voices");
        const data = await res.json();
        setVoices(data.voices || []);
      } catch (err) {
        console.error("Failed to fetch voices:", err);
      }
    };
    fetchVoices();
  }, []);

  /* =========================
     ANALYZE SCRIPT
  ========================== */
  const handleAnalyze = async () => {
    if (!script) return alert("Please enter a script first.");

    setLoading(true);
    setAnalysis("");
    setRewrites([]);
    setSelectedText("");
    setAudio(null);

    try {
      const res = await fetch("/api/short-form/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const data = await res.json();
      setAnalysis(data.analysis || "");
    } catch (err) {
      console.error(err);
      alert("Failed to analyze script");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GENERATE REWRITE (A/B/C)
  ========================== */
  const handleRewrite = async (option: string) => {
    if (!script) return alert("Enter a script first.");

    setLoading(true);

    try {
      const res = await fetch("/api/short-form/rewrite-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, option }),
      });

      const data = await res.json();

      if (!data.rewrite) {
        alert("No rewrite returned");
        return;
      }

      // Replace rewrite for this option if it exists
      setRewrites((prev) => {
        const filtered = prev.filter((r) => r.label !== option);
        return [...filtered, { label: option, text: data.rewrite }];
      });

    } catch (err) {
      console.error("Rewrite failed:", err);
      alert("Rewrite failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GENERATE VOICE
  ========================== */
  const handleGenerateVoice = async () => {
    if (!voiceId) return alert("Select a voice first.");
    if (!selectedText) return alert("Select original or a rewrite.");

    setLoading(true);
    setAudio(null);

    try {
      const res = await fetch("/api/short-form/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: selectedText, voiceId }),
      });

      const data = await res.json();

      if (data.audio) {
        setAudio(`data:audio/mp3;base64,${data.audio}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate voiceover");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-gray-50 text-gray-900">
      <h1 className="text-2xl font-bold">Short-Form Voiceover</h1>

      {/* SCRIPT INPUT */}
      <textarea
        className="w-full border p-3 rounded bg-white text-gray-900"
        rows={6}
        placeholder="Paste your script..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      <Button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Script"}
      </Button>

      {/* ANALYSIS */}
      {analysis && (
        <div className="border p-4 rounded bg-gray-100">
          <h2 className="font-semibold mb-2">Agent Feedback</h2>
          <p className="whitespace-pre-wrap text-sm">{analysis}</p>
        </div>
      )}

      {/* REWRITE GENERATORS */}
      {analysis && (
        <div className="border p-4 rounded bg-white space-y-4">
          <h3 className="font-semibold">Generate Rewrite</h3>

          <div className="flex flex-col space-y-2">
            <Button onClick={() => handleRewrite("A")} disabled={loading}>
              Generate Option A (Viral Hook)
            </Button>

            <Button onClick={() => handleRewrite("B")} disabled={loading}>
              Generate Option B (Comedic)
            </Button>

            <Button onClick={() => handleRewrite("C")} disabled={loading}>
              Generate Option C (Emotional)
            </Button>
          </div>
        </div>
      )}

      {/* SELECT ORIGINAL OR REWRITE */}
      {analysis && (
        <div className="border p-4 rounded bg-gray-100 space-y-4">
          <h3 className="font-semibold">Choose Version</h3>

          <Button
            variant={selectedText === script ? "default" : "outline"}
            onClick={() => setSelectedText(script)}
          >
            Use Original
          </Button>

          {rewrites.map((r) => (
            <div key={r.label} className="space-y-2">
              <p className="text-sm whitespace-pre-wrap border p-2 rounded bg-white">
                {r.text}
              </p>

              <Button
                variant={selectedText === r.text ? "default" : "outline"}
                onClick={() => setSelectedText(r.text)}
              >
                Use Rewrite {r.label}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* VOICE SELECTION */}
      {analysis && (
        <div className="border p-4 rounded bg-white space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Select Voice</label>
            <select
              className="border p-2 rounded w-full"
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
          </div>

          <Button
            onClick={handleGenerateVoice}
            disabled={loading || !voiceId || !selectedText}
          >
            {loading ? "Generating..." : "Generate Voice"}
          </Button>
        </div>
      )}

      {/* AUDIO PLAYER */}
      {audio && (
        <div className="mt-4">
          <h4 className="font-semibold">Generated Voiceover</h4>
          <audio controls className="w-full mt-1">
            <source src={audio} type="audio/mp3" />
          </audio>
        </div>
      )}
    </div>
  );
}
