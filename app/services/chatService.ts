// Constant
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Types
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  status: 'success' | 'error';
  message: string;
  tokens?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send messages to the OpenAI chat API
 */
export const sendChatRequest = async (messages: Message[]): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'gpt-3.5-turbo', // You can make this configurable
      }),
    });

    if (!response.ok) {
      // Instead of throwing the raw error, handle it more gracefully
      if (response.status === 404) {
        return {
          status: 'error',
          message: 'Unable to connect to AI assistant. Please try again later.',
        };
      }
      
      // For other errors, try to parse the error message
      try {
        const errorJson = await response.json();
        return {
          status: 'error',
          message: 'Unable to connect to AI assistant. Please try again later.',
        };
      } catch {
        // If we can't parse the JSON, return a generic message
        return {
          status: 'error',
          message: 'Unable to connect to AI assistant. Please try again later.',
        };
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat request:', error);
    return {
      status: 'error',
      message: 'Unable to connect to AI assistant. Please try again later.',
    };
  }
};
