"use client";
import { useRedirectToFirstSlate } from "@/hooks/useRedirectToFirstSlate";
import { useEffect, useState } from "react";

export default function Home() {
  const redirectToFirstSlate = useRedirectToFirstSlate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRedirect = async () => {
    setLoading(true);

    try {
      await redirectToFirstSlate();
    } catch (e) {
      setError("Failed to redirect to the first slate.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRedirect();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-24">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-24 text-red-500">
        {error}
        <button
          className="
        bg-mist text-smoke p-2 px-3 rounded-lg mt-3"
          onClick={handleRedirect}
          disabled={loading}
          aria-label="Retry redirecting to the first slate"
        >
          Retry
        </button>
      </div>
    );
  }
}
