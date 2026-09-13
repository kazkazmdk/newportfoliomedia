import type { Message } from "src/types/messageType";
import { useState } from "react";
import { Container } from "@chakra-ui/react";
import { UserInput } from "src/components/UserInput";
import { Messages } from "src/components/Messages";

export default function App() {
  // replace with zustand and link to indexeddb
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <Container>
      <Messages messages={messages} />
      <UserInput setMessages={setMessages} />
    </Container>
  );
}
