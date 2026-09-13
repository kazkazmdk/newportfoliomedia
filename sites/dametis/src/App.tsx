import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router";
import { Messages } from "src/components/Messages";
import { UserInput } from "src/components/UserInput";
import { CapabilityPanel } from "src/components/CapabilityPanel";
import { useLanguageModel } from "src/hooks/useLanguageModel";
import { inputPlaceholder } from "src/lib/ai-capability";
import {
  appendStreamingChunk,
  createConversation,
  createConversationStore,
  titleFromMessages,
  type Conversation,
} from "src/lib/conversation-store";
import { streamToAsyncIterable } from "src/utils/streamToAsyncIterable";

const store = createConversationStore();

export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sending, setSending] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const messages = conversation?.messages ?? [];
  const model = useLanguageModel(messages);

  const placeholder = useMemo(() => {
    if (model.creating) return inputPlaceholder("CREATING_SESSION");
    if (model.session) return inputPlaceholder("READY");
    if (model.errorKind) return inputPlaceholder("ERROR");
    if (model.capability === "BOOT") return inputPlaceholder("BOOT");
    return inputPlaceholder(model.capability);
  }, [model.creating, model.session, model.errorKind, model.capability]);

  const refreshList = useCallback(async () => {
    setConversations(await store.list());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refreshList();
      if (cancelled) return;
      if (id) {
        const existing = await store.get(id);
        if (cancelled) return;
        if (existing) {
          setConversation(existing);
          return;
        }
      }
      const created = createConversation();
      await store.save(created);
      if (cancelled) return;
      navigate(`/${created.id}`, { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, refreshList]);

  const persist = useCallback(async (next: Conversation) => {
    await store.save(next);
    setConversation(next);
    await refreshList();
  }, [refreshList]);

  const handleNew = async () => {
    const created = createConversation();
    await store.save(created);
    navigate(`/${created.id}`);
  };

  const handleDelete = async () => {
    if (!conversation) return;
    if (typeof model.session?.destroy === "function") {
      model.session.destroy();
    }
    await store.delete(conversation.id);
    const remaining = await store.list();
    if (remaining[0]) {
      navigate(`/${remaining[0].id}`);
    } else {
      const created = createConversation();
      await store.save(created);
      navigate(`/${created.id}`);
    }
  };

  const handleSend = async (text: string) => {
    if (!conversation || !model.session) return;
    setSending(true);
    setGenerationError(null);
    const withUser: Conversation = {
      ...conversation,
      title: titleFromMessages([...conversation.messages, { role: "user", text }]),
      updatedAt: Date.now(),
      messages: [...conversation.messages, { role: "user", text }],
    };
    await persist(withUser);
    try {
      const response = await model.session.promptStreaming(text);
      let nextMessages = withUser.messages;
      try {
        for await (const chunk of streamToAsyncIterable(response)) {
          nextMessages = appendStreamingChunk(nextMessages, String(chunk));
          const streaming: Conversation = {
            ...withUser,
            updatedAt: Date.now(),
            messages: nextMessages,
          };
          setConversation(streaming);
        }
      } catch (error) {
        setGenerationError(
          error instanceof Error
            ? error.message
            : "The response stream was interrupted."
        );
        model.setErrorKind("stream-interrupted");
        nextMessages = appendStreamingChunk(
          nextMessages,
          "\n\n(Stream interrupted.)"
        );
      }
      await persist({
        ...withUser,
        updatedAt: Date.now(),
        messages: nextMessages,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generation failed.";
      setGenerationError(message);
      model.setErrorKind("generation-failed");
      await persist({
        ...withUser,
        updatedAt: Date.now(),
        messages: [
          ...withUser.messages,
          { role: "assistant", text: "Generation failed. You can retry." },
        ],
      });
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <Container py={10}>
        <Text>Loading conversation…</Text>
      </Container>
    );
  }

  return (
    <Flex minH="100vh">
      <Box
        as="aside"
        w={{ base: "100px", md: "220px" }}
        borderRightWidth="1px"
        p={4}
      >
        <Heading size="sm" mb={4}>
          Dametis
        </Heading>
        <VStack align="stretch" spacing={2}>
          <Button size="sm" onClick={() => void handleNew()}>
            New conversation
          </Button>
          {conversations.map((item) => (
            <Button
              key={item.id}
              variant={item.id === conversation.id ? "solid" : "ghost"}
              size="sm"
              onClick={() => navigate(`/${item.id}`)}
            >
              {item.title}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => void handleDelete()}>
            Delete conversation
          </Button>
        </VStack>
      </Box>
      <Box flex="1" pb={24}>
        <CapabilityPanel
          capability={model.capability}
          creating={model.creating}
          downloadProgress={model.downloadProgress}
          errorKind={model.errorKind}
          errorMessage={model.errorMessage}
          sessionReady={Boolean(model.session)}
          onEnable={() => void model.enable()}
          onRetry={() => void model.inspect()}
        />
        {generationError && (
          <Box px={6} pt={4}>
            <Text color="red.500">{generationError}</Text>
            <Button size="sm" mt={2} onClick={() => setGenerationError(null)}>
              Dismiss
            </Button>
          </Box>
        )}
        <Messages
          messages={messages}
          emptyLabel={
            model.session
              ? "Start a conversation…"
              : "Enable local AI to start chatting."
          }
        />
        <UserInput
          placeholder={placeholder}
          disabled={
            !model.session ||
            model.creating ||
            model.capability === "UNSUPPORTED" ||
            model.capability === "UNAVAILABLE"
          }
          sending={sending}
          sessionReady={Boolean(model.session)}
          creating={model.creating}
          onSend={handleSend}
        />
      </Box>
    </Flex>
  );
}
