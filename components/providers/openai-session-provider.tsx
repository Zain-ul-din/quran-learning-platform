"use client";
import { apiEndPoints } from "@/lib/api";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

export const OpenAISessionContext = createContext<{
  clientSecret: string | null;
}>({
  clientSecret: null,
});

export function OpenAISessionProvider({ children }: { children: ReactNode }) {
  const pending = useRef<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (pending.current) return;
      pending.current = true;

      fetch(apiEndPoints.openAIClientSecret, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLanguage: "ar" }),
      })
        .then(async (response) => {
          const { value } = await response.json();
          setClientSecret(value);
        })
        .finally(() => {
          pending.current = false;
        });
    };

    fetchSession();
  }, []);

  return (
    <OpenAISessionContext
      value={{
        clientSecret,
      }}
    >
      {children}
    </OpenAISessionContext>
  );
}
