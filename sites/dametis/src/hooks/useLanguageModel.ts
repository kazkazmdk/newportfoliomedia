import { useCallback, useEffect, useRef, useState } from "react";
import {
  type CapabilityStatus,
  downloadPercent,
  getLanguageModelApi,
  checkBrowserCapability,
} from "src/lib/ai-capability";
import { toInitialPrompts } from "src/lib/conversation-store";
import type { Message } from "src/types/messageType";

export type ModelErrorKind =
  | "unsupported"
  | "unavailable"
  | "download-failed"
  | "session-failed"
  | "generation-failed"
  | "stream-interrupted"
  | null;

type SessionLike = {
  promptStreaming: (input: string) => Promise<ReadableStream<string> | AsyncIterable<string>>;
  destroy?: () => void;
};

export function useLanguageModel(messages: Message[]) {
  const [capability, setCapability] = useState<CapabilityStatus | "BOOT">("BOOT");
  const [session, setSession] = useState<SessionLike | null>(null);
  const [creating, setCreating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [errorKind, setErrorKind] = useState<ModelErrorKind>(null);
  const [errorMessage, setErrorKindMessage] = useState<string | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const inspect = useCallback(async () => {
    setCapability("BOOT");
    setErrorKind(null);
    setErrorKindMessage(null);
    const status = await checkBrowserCapability();
    setCapability(status);
    if (status === "UNSUPPORTED") setErrorKind("unsupported");
    if (status === "UNAVAILABLE") setErrorKind("unavailable");
    return status;
  }, []);

  useEffect(() => {
    void inspect();
  }, [inspect]);

  const enable = useCallback(async () => {
    const api = getLanguageModelApi();
    if (!api) {
      setCapability("UNSUPPORTED");
      setErrorKind("unsupported");
      return;
    }
    setCreating(true);
    setErrorKind(null);
    setErrorKindMessage(null);
    setDownloadProgress(0);
    try {
      const sessionInstance = (await api.create({
        initialPrompts: toInitialPrompts(messagesRef.current),
        monitor(channel: EventTarget) {
          channel.addEventListener("downloadprogress", (event) => {
            const progress = event as unknown as { loaded: number; total?: number };
            setDownloadProgress(downloadPercent(progress.loaded, progress.total));
          });
        },
      })) as SessionLike;
      setSession(sessionInstance);
      setDownloadProgress(100);
      setCapability("AVAILABLE");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create local AI session.";
      const status = await checkBrowserCapability();
      if (status === "DOWNLOADABLE" || status === "DOWNLOADING") {
        setErrorKind("download-failed");
      } else {
        setErrorKind("session-failed");
      }
      setErrorKindMessage(message);
    } finally {
      setCreating(false);
    }
  }, []);

  return {
    capability,
    session,
    creating,
    downloadProgress,
    errorKind,
    errorMessage,
    inspect,
    enable,
    setErrorKind,
    setErrorKindMessage,
  };
}
