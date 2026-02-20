"use client";

import CharacterPage from "@/components/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectKitButton } from "connectkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnecting, isConnected } = useAccount();
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // added to handle initial render

  // Check eligibility on wallet connect
  useEffect(() => {
    const verify = async () => {
      if (!address || !isConnected) {
        setEligible(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/verify-holder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: address }),
        });
        const data = await res.json();

        if (!res.ok) {
          setEligible(false);
        } else {
          setEligible(true);
          setToken(data.token || null);
          localStorage.setItem("duelsSession", data.token);
        }
      } catch (err) {
        console.error("Eligibility check failed:", err);
        setEligible(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [address, isConnected]);

  // Initial load / connecting wallet
  if (loading || isConnecting) {
    return (
      <Card className="w-full max-w-lg text-center">
        <CardContent className="!pt-6">
          <p>{isConnecting ? "Connecting wallet..." : "Checking eligibility..."}</p>
        </CardContent>
      </Card>
    );
  }

  // Wallet not connected
  if (!isConnected) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Duels</CardTitle>
          <p>Connect your wallet to begin</p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectKitButton />
        </CardContent>
      </Card>
    );
  }

  // Wallet connected but not eligible
  if (eligible === false) {
    return (
      <Card className="w-full max-w-lg text-center">
        <CardContent className="!pt-6">
          <p>Hold ≥ 100 ORIGIN or DUELS to access Duels dubbing.</p>
          <p className="mt-2">
            <a
              href="https://app.virtuals.io/prototypes/0xDFAC0671843E7294330C6859701729Cad3AdBdC7"
              target="_blank"
              className="text-blue-500 underline"
            >
              Purchase DUELS here
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  // Wallet connected and eligible → show agent page
  if (eligible) {
    return <CharacterPage />;
  }

  // Fallback if something unexpected happens
  return (
    <Card className="w-full max-w-lg text-center">
      <CardContent className="!pt-6">
        <p>Loading your wallet status...</p>
      </CardContent>
    </Card>
  );
}