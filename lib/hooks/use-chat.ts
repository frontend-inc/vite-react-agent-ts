import { useState, useCallback, useRef } from 'react';
import { parseSSE } from '@/lib/utils/sse';

// ============================================================================
// Types
// ============================================================================

export type MessagePartStatus =
  | 'streaming'
  | 'complete'
  | 'tool-input-start'
  | 'tool-input-streaming'
  | 'tool-input-available'
  | 'tool-output-available';

export interface TextPart {
  type: 'text';
  text: string;
  status: 'streaming' | 'complete';
}

export interface ReasoningPart {
  type: 'reasoning';
  text: string;
  status: 'streaming' | 'complete';
}

export interface ToolPart {
  type: 'tool';
  toolCallId: string;
  toolName: string;
  input?: unknown;
  output?: unknown;
  status: 'tool-input-start' | 'tool-input-streaming' | 'tool-input-available' | 'tool-output-available';
}

export interface FilePart {
  type: 'file';
  url: string;
  mediaType?: string;
  filename?: string;
  status: 'complete';
}

export type MessagePart = TextPart | ReasoningPart | ToolPart | FilePart;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
  timestamp: string;
}

export interface UseChatOptions {
  api: string;
  headers?: Record<string, string>;
  onFinish?: (params: { message: Message }) => void;
  onError?: (error: Error) => void;
}

export type ChatStatus = 'idle' | 'submitted' | 'streaming' | 'ready' | 'error';

export interface UseChatReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  status: ChatStatus;
  error: string | null;
  sendMessage: (params: SendMessageParams) => Promise<void>;
  clearMessages: () => void;
}

export interface SendMessageParams {
  role: 'user' | 'assistant';
  parts: Array<{ type: string; text?: string; url?: string }>;
}

// SSE Event Types
interface SSETextDeltaEvent {
  type: 'text-delta';
  delta: string;
}

interface SSEReasoningStartEvent {
  type: 'reasoning-start';
}

interface SSEReasoningDeltaEvent {
  type: 'reasoning-delta';
  delta: string;
}

interface SSEReasoningEndEvent {
  type: 'reasoning-end';
}

interface SSEToolInputStartEvent {
  type: 'tool-input-start';
  toolCallId: string;
  toolName: string;
}

interface SSEToolInputDeltaEvent {
  type: 'tool-input-delta';
  toolCallId: string;
  delta: string;
}

interface SSEToolInputAvailableEvent {
  type: 'tool-input-available';
  toolCallId: string;
  toolName: string;
  input: unknown;
}

interface SSEToolOutputAvailableEvent {
  type: 'tool-output-available';
  toolCallId: string;
  toolName: string;
  output: unknown;
}

interface SSEStartEvent {
  type: 'start';
}

interface SSEFinishEvent {
  type: 'finish';
}

interface SSEStartStepEvent {
  type: 'start-step';
}

interface SSEFinishStepEvent {
  type: 'finish-step';
}

type SSEEvent =
  | SSETextDeltaEvent
  | SSEReasoningStartEvent
  | SSEReasoningDeltaEvent
  | SSEReasoningEndEvent
  | SSEToolInputStartEvent
  | SSEToolInputDeltaEvent
  | SSEToolInputAvailableEvent
  | SSEToolOutputAvailableEvent
  | SSEStartEvent
  | SSEFinishEvent
  | SSEStartStepEvent
  | SSEFinishStepEvent;

// ============================================================================
// Helper Functions
// ============================================================================

const createMessageId = (role: 'user' | 'assistant'): string => {
  return `msg-${Date.now()}-${role}`;
};

const getMediaType = (urlOrFilename: string): string => {
  const filename = urlOrFilename.split('/').pop() || urlOrFilename;
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const mediaTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  };

  return mediaTypeMap[ext] || 'image/jpeg';
};

const getFilenameFromUrl = (url: string): string => {
  return url.split('/').pop() || 'image.jpg';
};

// ============================================================================
// useChat Hook
// ============================================================================

export function useChat(options: UseChatOptions): UseChatReturn {
  const { api, headers = {}, onFinish, onError } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Track current state during streaming
  const streamingStateRef = useRef<{
    currentTextPart: TextPart | null;
    currentReasoningPart: ReasoningPart | null;
    toolParts: Map<string, ToolPart>;
    toolInputBuffers: Map<string, string>;
  }>({
    currentTextPart: null,
    currentReasoningPart: null,
    toolParts: new Map(),
    toolInputBuffers: new Map(),
  });

  // Reader ref for cancelling the stream
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async ({ role, parts }: SendMessageParams): Promise<void> => {
      const hasContent = parts.some((p) => (p.type === 'text' && p.text?.trim()) || (p.type === 'file' && p.url));
      if (!hasContent) {
        setError('Please enter a message or upload an image');
        setStatus('error');
        return;
      }

      setStatus('submitted');
      setError(null);

      // Cancel any existing stream
      if (readerRef.current) {
        readerRef.current.cancel();
        readerRef.current = null;
      }

      // Reset streaming state
      streamingStateRef.current = {
        currentTextPart: null,
        currentReasoningPart: null,
        toolParts: new Map(),
        toolInputBuffers: new Map(),
      };

      try {
        // Create user message with parts including status
        const userMessage: Message = {
          id: createMessageId('user'),
          role,
          parts: parts.map((p) => ({
            ...p,
            status: 'complete' as const,
          })) as MessagePart[],
          timestamp: new Date().toISOString(),
        };

        // Add user message to state
        setMessages((prev) => [...prev, userMessage]);

        // Build messages array for API - use parts directly
        const allMessages = [...messages, userMessage];
        const messagesForAPI = allMessages.map((msg) => ({
          role: msg.role,
          parts: msg.parts.map((p) => {
            if (p.type === 'text') {
              return { type: 'text', text: p.text };
            }
            if (p.type === 'file' && 'url' in p) {
              return {
                type: 'file',
                mediaType: getMediaType((p as any).url),
                filename: getFilenameFromUrl((p as any).url),
                url: (p as any).url,
              };
            }
            return p;
          }),
        }));

        // Make API request
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({ messages: messagesForAPI }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorData}`);
        }

        // Create assistant message
        const assistantMessage: Message = {
          id: createMessageId('assistant'),
          role: 'assistant',
          parts: [],
          timestamp: new Date().toISOString(),
        };

        // Add empty assistant message
        setMessages((prev) => [...prev, assistantMessage]);

        // Set status to streaming once we start receiving data
        setStatus('streaming');

        // Process SSE stream
        await parseSSE(
          response,
          (data: SSEEvent) => {
            handleSSEEvent(data, assistantMessage.id, setMessages, streamingStateRef);
          },
          (err) => {
            setError(err.message);
            setStatus('error');
            if (onError) onError(err);
          },
          readerRef
        );

        // Finalize any streaming parts
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          const lastMsg = updated[lastIdx];

          if (lastMsg && lastMsg.role === 'assistant') {
            const finalParts = lastMsg.parts.map((part) => {
              if (part.type === 'text' && part.status === 'streaming') {
                return { ...part, status: 'complete' as const };
              }
              if (part.type === 'reasoning' && part.status === 'streaming') {
                return { ...part, status: 'complete' as const };
              }
              return part;
            });

            const finalMessage: Message = {
              ...lastMsg,
              parts: finalParts,
            };

            updated[lastIdx] = finalMessage;

            // Call onFinish callback
            if (onFinish) {
              onFinish({ message: finalMessage });
            }

            return updated;
          }

          return updated;
        });
        // Set status to ready after successful completion
        setStatus('ready');
      } catch (err: any) {
        console.error('Error processing request:', err);
        const errorMessage = err.message || 'Failed to process your request';
        setError(errorMessage);
        setStatus('error');
        if (onError) onError(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        readerRef.current = null;
      }
    },
    [api, headers, messages, onFinish, onError]
  );

  const isLoading = status === 'submitted' || status === 'streaming';

  return {
    messages,
    setMessages,
    isLoading,
    status,
    error,
    sendMessage,
    clearMessages,
  };
}

// ============================================================================
// SSE Event Handler
// ============================================================================

function handleSSEEvent(
  event: SSEEvent,
  messageId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  streamingStateRef: React.MutableRefObject<{
    currentTextPart: TextPart | null;
    currentReasoningPart: ReasoningPart | null;
    toolParts: Map<string, ToolPart>;
    toolInputBuffers: Map<string, string>;
  }>
): void {
  const state = streamingStateRef.current;

  switch (event.type) {
    case 'start':
    case 'start-step':
    case 'finish-step':
    case 'finish':
      // These are lifecycle events, no action needed for parts
      break;

    case 'text-delta': {
      const delta = event.delta;
      if (!delta) break;

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        const parts = [...lastMsg.parts];

        // Check if we have a current text part that's streaming
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.type === 'text' && lastPart.status === 'streaming') {
          // Append to existing text part
          parts[parts.length - 1] = {
            ...lastPart,
            text: lastPart.text + delta,
          };
        } else {
          // Create new text part
          parts.push({
            type: 'text',
            text: delta,
            status: 'streaming',
          });
        }

        return [
          ...updated.slice(0, lastIdx),
          {
            ...lastMsg,
            parts,
          },
        ];
      });
      break;
    }

    case 'reasoning-start': {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        // Finalize any current text part
        const parts = lastMsg.parts.map((part) =>
          part.type === 'text' && part.status === 'streaming'
            ? { ...part, status: 'complete' as const }
            : part
        );

        // Add new reasoning part
        parts.push({
          type: 'reasoning',
          text: '',
          status: 'streaming',
        });

        return [
          ...updated.slice(0, lastIdx),
          { ...lastMsg, parts },
        ];
      });
      break;
    }

    case 'reasoning-delta': {
      const delta = event.delta;
      if (!delta) break;

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        const parts = [...lastMsg.parts];
        const reasoningIdx = parts.findLastIndex(
          (p) => p.type === 'reasoning' && p.status === 'streaming'
        );

        if (reasoningIdx !== -1) {
          const reasoningPart = parts[reasoningIdx] as ReasoningPart;
          parts[reasoningIdx] = {
            ...reasoningPart,
            text: reasoningPart.text + delta,
          };
        }

        return [
          ...updated.slice(0, lastIdx),
          { ...lastMsg, parts },
        ];
      });
      break;
    }

    case 'reasoning-end': {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        const parts = lastMsg.parts.map((part) =>
          part.type === 'reasoning' && part.status === 'streaming'
            ? { ...part, status: 'complete' as const }
            : part
        );

        return [
          ...updated.slice(0, lastIdx),
          { ...lastMsg, parts },
        ];
      });
      break;
    }

    case 'tool-input-start': {
      const { toolCallId, toolName } = event;

      // Initialize input buffer
      state.toolInputBuffers.set(toolCallId, '');

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        // Finalize any streaming text/reasoning parts
        const parts = lastMsg.parts.map((part) => {
          if (part.type === 'text' && part.status === 'streaming') {
            return { ...part, status: 'complete' as const };
          }
          if (part.type === 'reasoning' && part.status === 'streaming') {
            return { ...part, status: 'complete' as const };
          }
          return part;
        });

        // Add new tool part
        parts.push({
          type: 'tool',
          toolCallId,
          toolName,
          status: 'tool-input-start',
        });

        return [
          ...updated.slice(0, lastIdx),
          { ...lastMsg, parts },
        ];
      });
      break;
    }

    case 'tool-input-delta': {
      const { toolCallId, delta } = event;
      if (!delta) break;

      // Accumulate input in buffer
      const currentBuffer = state.toolInputBuffers.get(toolCallId) || '';
      state.toolInputBuffers.set(toolCallId, currentBuffer + delta);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        const parts = lastMsg.parts.map((part) => {
          if (part.type === 'tool' && part.toolCallId === toolCallId) {
            return {
              ...part,
              status: 'tool-input-streaming' as const,
            };
          }
          return part;
        });

        return [
          ...updated.slice(0, lastIdx),
          { ...lastMsg, parts },
        ];
      });
      break;
    }

    case 'tool-input-available': {
      const { toolCallId, toolName, input } = event;

      // Clear the input buffer
      state.toolInputBuffers.delete(toolCallId);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        const parts = lastMsg.parts.map((part) => {
          if (part.type === 'tool' && part.toolCallId === toolCallId) {
            return {
              ...part,
              // Only override toolName if provided in event
              ...(toolName && { toolName }),
              input,
              status: 'tool-input-available' as const,
            };
          }
          return part;
        });

        return [
          ...updated.slice(0, lastIdx),
          { ...lastMsg, parts },
        ];
      });
      break;
    }

    case 'tool-output-available': {
      const { toolCallId, toolName, output } = event;

      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];

        if (!lastMsg || lastMsg.id !== messageId) return prev;

        const parts = lastMsg.parts.map((part) => {
          if (part.type === 'tool' && part.toolCallId === toolCallId) {
            return {
              ...part,
              // Only override toolName if provided in event
              ...(toolName && { toolName }),
              output,
              status: 'tool-output-available' as const,
            };
          }
          return part;
        });

        return [
          ...updated.slice(0, lastIdx),
          { ...lastMsg, parts },
        ];
      });
      break;
    }
  }
}

export default useChat;
