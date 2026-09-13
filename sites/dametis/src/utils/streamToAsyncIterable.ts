export async function* streamToAsyncIterable(
  stream: ReadableStream<string> | AsyncIterable<string>
) {
  const iterable = stream as AsyncIterable<string>;
  if (iterable && typeof iterable[Symbol.asyncIterator] === "function") {
    yield* iterable;
    return;
  }
  const readable = stream as ReadableStream<string>;
  const reader = readable.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value !== undefined) yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
