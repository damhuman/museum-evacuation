"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChatInterface } from "@/components/ChatInterface";

function ChatContent() {
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario") || undefined;

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-6rem)]">
      <ChatInterface scenario={scenario} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Завантаження...
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
