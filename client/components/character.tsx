"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";

type Agent = {
  value: number;
  vertical: string;
  description: string;
  preview: string;
  prompt: string;
};

const AGENT_LIBRARY: Agent[] = [
  {
    value: 5,
    vertical: "dubbing",
    description: "Dubbing Coach",
    preview: "/assets/images/writingagent.png",
    prompt:
      "Transform your audio or video file into 29 languages with our dubbing coach.",
  },
  {
    value: 0,
    vertical: "short-form",
    description: "(COMING SOON) Short Form Video Coach",
    preview: "/assets/images/mediacoach.png",
    prompt:
      "A cutting-edge media coach for short form video creators.",
  },
  {
    value: 2,
    vertical: "transcription",
    description: "(COMING SOON) Real-Time Translation Coach",
    preview: "/assets/images/marketingcoach.png",
    prompt:
      "Your real-time translation coach for navigating languages on the fly.",
  },
  {
    value: 3,
    vertical: "eventproduction",
    description: "(COMING SOON) Event Production Coach",
    preview: "/assets/images/eventcoach.png",
    prompt:
      "An elite event production coach to help you meet your goals.",
  },
];

export default function ServiceAgentPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [agents] = useState<Agent[]>(AGENT_LIBRARY);

  // Dubbing states
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [dubbingResult, setDubbingResult] = useState<any>(null);

  const goToAgentPage = (vertical: string) => {
    router.push(`/agents/${vertical}`);
  };

  const goToVoiceoverPage = () => {
    router.push("/agents/short-form/voiceover");
  };

  const goToTranscriptionPage = () => {
    router.push("/agents/transcription");
  };

  const handleDubbing = async () => {
    if (!fileInput || !address) return;

    const formData = new FormData();
    formData.append("file", fileInput);
    formData.append("target_lang", "en");
    formData.append("wallet", address); // only on first call

    const res = await fetch("/api/dub", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const data = await res.json();
    setDubbingResult(data);

    if (data.token) setToken(data.token); // save JWT for next calls
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Agents</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <div key={agent.value} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                onClick={() => goToAgentPage(agent.vertical)}
              >
                <p className="text-center text-sm text-gray-500 py-1 bg-gray-100">
                  Service: {agent.description}
                </p>

                <img
                  src={agent.preview}
                  alt={agent.description}
                  className="h-48 w-48 object-cover"
                />

                <p className="p-2 text-xs text-gray-600">{agent.prompt}</p>
              </div>

              {agent.vertical === "short-form" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={goToVoiceoverPage}
                  className="mt-1"
                >
                  Voiceover Production (COMING SOON)
                </Button>
              )}

              {agent.vertical === "transcription" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={goToTranscriptionPage}
                  className="mt-1"
                >
                  Transcription (COMING SOON)
                </Button>
              )}

              {agent.vertical === "dubbing" && (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                    className="mb-2"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!fileInput}
                    onClick={handleDubbing}
                  >
                    Enter Dubbing
                  </Button>

                  {dubbingResult && (
                    <pre className="mt-2 text-xs">
                      {JSON.stringify(dubbingResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
