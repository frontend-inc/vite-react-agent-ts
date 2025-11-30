export async function parseSSE(
  response: Response,
  onMessage: (data: any) => void,
  onError?: (error: Error) => void,
  readerRef?: { current: ReadableStreamDefaultReader<Uint8Array> | null }
): Promise<void> {
  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // Store reader in ref so it can be cancelled externally
  if (readerRef) {
    readerRef.current = reader;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith(':')) {
          continue;
        }

        if (trimmedLine.startsWith('data:')) {
          try {
            const jsonStr = trimmedLine.slice(5).trim();

            if (!jsonStr) {
              continue;
            }

            const data = JSON.parse(jsonStr);

            // Log original payload values for debugging for specific event types
            if (
              data.type &&
              [
                'reasoning-start',
                'reasoning-delta',
                'reasoning-end',
                'tool-input-start',
                'tool-input-available',
                'tool-output-available',
                'finish-step',
                'start-step',
              ].includes(data.type)
            ) {
              console.log(
                `[SSE Debug] Original payload for type "${data.type}":`,
                data
              );
            }

            onMessage(data);
          } catch (e) {
            console.debug('Failed to parse SSE line');
          }
        }
      }
    }

    if (buffer.trim()) {
      const trimmedLine = buffer.trim();

      if (trimmedLine.startsWith('data:')) {
        try {
          const jsonStr = trimmedLine.slice(5).trim();

          if (jsonStr) {
            const data = JSON.parse(jsonStr);

            // Log original payload values for debugging for specific event types
            if (
              data.type &&
              [
                'reasoning-start',
                'reasoning-delta',
                'reasoning-end',
                'tool-input-start',
                'tool-input-available',
                'tool-output-available',
                'finish-step',
                'start-step',
              ].includes(data.type)
            ) {
              console.log(
                `[SSE Debug] Original payload for type "${data.type}":`,
                data
              );
            }

            onMessage(data);
          }
        } catch (e) {
          console.debug('Failed to parse final SSE line');
        }
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}

export async function streamSSE(
  response: Response,
  onDelta?: (delta: string) => void
): Promise<string> {
  let fullContent = '';

  await parseSSE(response, (data) => {
    // Log all keys from the streaming payload, excluding fullContent values
    console.log('[streamSSE Payload Keys]', {
      keys: Object.keys(data),
      type: data.type,
      payloadInfo: Object.keys(data).reduce(
        (acc, key) => {
          const value = data[key];
          if (key === 'fullContent') {
            acc[key] = '[REDACTED_CONTENT]';
          } else if (typeof value === 'string') {
            acc[key] = `string(${value.length})`;
          } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              acc[key] = `array(${value.length})`;
            } else {
              acc[key] = `object(${Object.keys(value).length} keys)`;
            }
          } else {
            acc[key] = typeof value;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    });

    // Only process text-delta events - ignore start, start-step, text-start, etc.
    if (!data || typeof data !== 'object' || data.type !== 'text-delta') {
      console.debug('[streamSSE] Skipping non-delta event:', {
        type: data?.type,
        keys: Object.keys(data || {}),
        allKeys: Object.keys(data || {}),
      });
      return;
    }

    let delta = '';

    // Extract delta from the proper field
    if (data.delta && typeof data.delta === 'string') {
      delta = data.delta;
    }

    // Log detailed delta information, redacting any fullContent
    console.log('[streamSSE Delta Processed]', {
      type: data.type,
      deltaLength: delta.length,
      hasDelta: !!delta,
      payloadKeys: Object.keys(data),
      dataTypes: Object.keys(data).reduce(
        (acc, key) => {
          const value = data[key];
          if (key === 'fullContent') {
            acc[key] = '[REDACTED_CONTENT]';
          } else if (typeof value === 'string') {
            acc[key] = `string(${value.length})`;
          } else if (Array.isArray(value)) {
            acc[key] = `array(${value.length})`;
          } else if (typeof value === 'object' && value !== null) {
            acc[key] = `object(${Object.keys(value).length} keys)`;
          } else {
            acc[key] = typeof value;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    });

    if (delta && typeof delta === 'string') {
      fullContent += delta;

      console.log('[streamSSE After Concat]', {
        contentLength: fullContent.length,
        wasEmpty: fullContent.length === delta.length,
        cumulativeLength: fullContent.length,
        fullContent: '[REDACTED_CONTENT]', // Explicitly redact fullContent
      });

      if (onDelta) {
        onDelta(delta);
      }
    }
  });

  console.log('[streamSSE Complete]', {
    finalContentLength: fullContent.length,
    totalChars: fullContent.length,
    isEmpty: fullContent.length === 0,
    fullContent: '[REDACTED_CONTENT]', // Explicitly redact fullContent
  });

  return fullContent;
}
