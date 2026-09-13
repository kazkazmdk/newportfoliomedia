import { describe, expect, it } from "vitest";
import {
  MemoryConversationStore,
  appendStreamingChunk,
  createConversation,
  createConversationId,
  titleFromMessages,
  toInitialPrompts,
} from "./conversation-store";

describe("conversation helpers", () => {
  it("creates unique ids", () => {
    expect(createConversationId()).not.toBe(createConversationId());
  });

  it("persists and restores a conversation in memory", async () => {
    const store = new MemoryConversationStore();
    const conversation = createConversation("abc");
    conversation.messages = [{ role: "user", text: "hello" }];
    await store.save(conversation);
    await expect(store.get("abc")).resolves.toEqual(conversation);
    await expect(store.list()).resolves.toHaveLength(1);
    await store.delete("abc");
    await expect(store.get("abc")).resolves.toBeNull();
  });

  it("appends streaming chunks onto the last assistant message", () => {
    const first = appendStreamingChunk([{ role: "user", text: "hi" }], "Hel");
    expect(first).toEqual([
      { role: "user", text: "hi" },
      { role: "assistant", text: "Hel" },
    ]);
    expect(appendStreamingChunk(first, "lo")).toEqual([
      { role: "user", text: "hi" },
      { role: "assistant", text: "Hello" },
    ]);
  });

  it("builds initial prompts and titles from stored messages", () => {
    const messages = [
      { role: "user" as const, text: "Summarize this" },
      { role: "assistant" as const, text: "Sure" },
    ];
    expect(titleFromMessages(messages)).toBe("Summarize this");
    expect(toInitialPrompts(messages)).toEqual([
      { role: "user", content: "Summarize this" },
      { role: "assistant", content: "Sure" },
    ]);
  });
});
