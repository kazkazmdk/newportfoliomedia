import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Heading,
  Progress,
  Text,
} from "@chakra-ui/react";
import type { CapabilityStatus } from "src/lib/ai-capability";
import type { ModelErrorKind } from "src/hooks/useLanguageModel";

type Props = {
  capability: CapabilityStatus | "BOOT";
  creating: boolean;
  downloadProgress: number | null;
  errorKind: ModelErrorKind;
  errorMessage: string | null;
  sessionReady: boolean;
  onEnable: () => void;
  onRetry: () => void;
};

const REQUIREMENTS_URL =
  "https://developer.chrome.com/docs/ai/prompt-api";

export function CapabilityPanel({
  capability,
  creating,
  downloadProgress,
  errorKind,
  errorMessage,
  sessionReady,
  onEnable,
  onRetry,
}: Props) {
  if (capability === "BOOT") {
    return (
      <Box px={4} py={6}>
        <Text>Checking on-device AI support…</Text>
      </Box>
    );
  }

  if (capability === "UNSUPPORTED") {
    return (
      <Alert status="info" variant="subtle" flexDirection="column" alignItems="flex-start" p={6}>
        <AlertIcon />
        <AlertTitle>LOCAL AI</AlertTitle>
        <AlertDescription>
          This demo uses the browser&apos;s on-device Language Model API.
          Your current browser/device does not support it yet.
        </AlertDescription>
        <Button
          as="a"
          href={REQUIREMENTS_URL}
          target="_blank"
          rel="noopener noreferrer"
          mt={4}
          colorScheme="blue"
          variant="outline"
        >
          Learn what is required
        </Button>
      </Alert>
    );
  }

  if (capability === "UNAVAILABLE") {
    return (
      <Alert status="warning" flexDirection="column" alignItems="flex-start" p={6}>
        <AlertIcon />
        <AlertTitle>On-device model unavailable</AlertTitle>
        <AlertDescription>
          The Language Model API is present, but no local model can be used on
          this device.
        </AlertDescription>
        <Button mt={4} onClick={onRetry} variant="outline">
          Retry
        </Button>
      </Alert>
    );
  }

  if (errorKind === "download-failed" || errorKind === "session-failed") {
    return (
      <Alert status="error" flexDirection="column" alignItems="flex-start" p={6}>
        <AlertIcon />
        <AlertTitle>
          {errorKind === "download-failed"
            ? "Model download failed"
            : "Session creation failed"}
        </AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
        <Button mt={4} onClick={onEnable}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (sessionReady) return null;

  const needsDownload = capability === "DOWNLOADABLE" || capability === "DOWNLOADING";

  return (
    <Box px={4} py={6} borderWidth="1px" borderRadius="md" mx={4} mt={4}>
      <Heading size="sm" mb={2}>
        LOCAL AI
      </Heading>
      <Text mb={4}>
        {needsDownload
          ? "Local AI model needs to be downloaded."
          : "Your browser supports on-device AI."}
      </Text>
      {creating && downloadProgress !== null && (
        <Box mb={4}>
          <Text fontSize="sm" mb={2}>
            Downloading local AI model… {downloadProgress}%
          </Text>
          <Progress value={downloadProgress} aria-label="Model download progress" />
        </Box>
      )}
      <Button colorScheme="blue" onClick={onEnable} isLoading={creating}>
        {needsDownload ? "Download / Enable" : "Enable local AI"}
      </Button>
    </Box>
  );
}
