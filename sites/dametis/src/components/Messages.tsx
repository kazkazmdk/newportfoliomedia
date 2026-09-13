import type { Message } from "src/types/messageType";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

type Props = {
  messages: Message[];
  emptyLabel?: string;
};

export const Messages = ({
  messages,
  emptyLabel = "Start a conversation…",
}: Props) => {
  return (
    <VStack p={3} mb={4} pb={24} align="stretch">
      {messages.length === 0 && (
        <Text color="gray.500" textAlign="center">
          {emptyLabel}
        </Text>
      )}
      {messages.map((msg, i) => (
        <Flex
          key={`${msg.role}-${i}`}
          w="full"
          justify={msg.role === "user" ? "flex-end" : "flex-start"}
        >
          <Box
            bg={msg.role === "user" ? "blue.500" : "green.500"}
            color="white"
            px={4}
            py={2}
            w="fit-content"
            borderRadius="xl"
            maxW="80%"
            fontSize="md"
            boxShadow="sm"
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};
