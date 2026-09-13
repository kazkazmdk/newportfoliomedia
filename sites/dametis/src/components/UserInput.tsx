import type { Dispatch, SetStateAction } from "react";
import type { Message } from "src/types/messageType";
import { Container, Flex, Button, Input, useToast } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useLanguageModelSession } from "src/hooks/useLanguageModelSession";
import { streamToAsyncIterable } from "src/utils/streamToAsyncIterable";

type Props = {
  setMessages: Dispatch<SetStateAction<Message[]>>;
};

export const UserInput = ({ setMessages }: Props) => {
  const { data: session } = useLanguageModelSession();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const handleSend = async () => {
    if (!input.trim() || !session) return;
    setSending(true);
    setMessages((msgs) => [...msgs, { role: "user", text: input }]);
    const userInput = input;
    setInput("");
    try {
      const response = await session.promptStreaming(userInput);
      for await (const chunk of streamToAsyncIterable(response)) {
        setMessages((msgs) => {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.role === "assistant") {
            return [
              ...msgs.slice(0, -1),
              { ...lastMsg, text: lastMsg.text + chunk },
            ];
          }
          return [...msgs, { role: "assistant", text: chunk }];
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de la réponse du modèle.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", text: "Erreur lors de la réponse du modèle." },
      ]);
    }
    setSending(false);
    // inputRef.current?.focus();
  };
  return (
    <Container
      w={"full"}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      p={3}
      bg="white"
      boxShadow="md"
    >
      <Flex
        maxW={"container.md"}
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message…"
          mr={2}
          disabled={sending}
          autoComplete="off"
        />
        <Button
          colorScheme="blue"
          onClick={handleSend}
          isLoading={sending}
          disabled={!input.trim() || sending}
          type="submit"
        >
          Send
        </Button>
      </Flex>
    </Container>
  );
};
