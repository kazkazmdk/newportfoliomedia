import type { Message } from "src/types/messageType";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

type Props = {
  messages: Message[];
};

export const Messages = ({ messages }: Props) => {
  return (
    <VStack p={3} mb={4} pb={20}>
      {messages.length === 0 && (
        <Text color="gray.400" textAlign="center">
          Start a conversation…
        </Text>
      )}
      {messages.map((msg, i) => (
        <Flex
          key={i}
          w={"full"}
          justify={msg.role === "user" ? "flex-end" : "flex-start"}
        >
          <Box
            bg={msg.role === "user" ? "blue.500" : "green.500"}
            color="white"
            px={4}
            py={2}
            w={"fit-content"}
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
