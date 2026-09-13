import type { FormEvent } from "react";
import { Button, Container, Flex, Input } from "@chakra-ui/react";
import { useState } from "react";
import { canSendMessage } from "src/lib/ai-capability";

type Props = {
  placeholder: string;
  disabled: boolean;
  sending: boolean;
  sessionReady: boolean;
  creating: boolean;
  onSend: (text: string) => Promise<void> | void;
};

export const UserInput = ({
  placeholder,
  disabled,
  sending,
  sessionReady,
  creating,
  onSend,
}: Props) => {
  const [input, setInput] = useState("");
  const allowSend = canSendMessage({
    session: sessionReady ? true : null,
    sending,
    creating,
    input,
  });

  const handleSend = async () => {
    if (!allowSend) return;
    const value = input;
    setInput("");
    await onSend(value);
  };

  return (
    <Container
      w="full"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      p={3}
      bg="white"
      boxShadow="md"
    >
      <Flex
        maxW="container.md"
        as="form"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          mr={2}
          disabled={disabled || sending || creating || !sessionReady}
          autoComplete="off"
          aria-label="Message"
        />
        <Button
          colorScheme="blue"
          isLoading={sending}
          isDisabled={!allowSend}
          type="submit"
        >
          Send
        </Button>
      </Flex>
    </Container>
  );
};
