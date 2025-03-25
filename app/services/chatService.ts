// Constant
const QWEN_API_KEY = process.env.NEXT_PUBLIC_QWEN_API_KEY;
const QWEN_API_URL = 'http://localhost:8010/compatible-mode/v1/chat/completions';

// Types
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  status: 'success' | 'error';
  message: string;
  reasoning?: string;
  tokens?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send messages to the Qwen API using OpenAI-compatible endpoint
 */
export const sendChatRequest = async (messages: Message[]): Promise<ChatResponse> => {
  try {
    if (!QWEN_API_KEY) {
      console.error('API Key not found in environment variables');
      throw new Error('QWEN_API_KEY is not configured');
    }

    // Debug: Log the API key format (only first few characters)
    console.log('API Key format check:', {
      keyStart: QWEN_API_KEY.substring(0, 5),
      keyLength: QWEN_API_KEY.length,
      isString: typeof QWEN_API_KEY === 'string'
    });

    // Prepare request body in OpenAI format with stream=true to get reasoning content
    const requestBody = {
      model: 'qwq-plus',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      stream: true,
      temperature: 0.7,
      max_tokens: 1500
    };

    // Prepare headers for OpenAI-compatible endpoint
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY.trim()}`
    };

    // Debug: Log complete request details
    console.log('Making request to Qwen API:', {
      url: QWEN_API_URL,
      method: 'POST',
      headers: Object.keys(headers),
      bodyPreview: {
        model: requestBody.model,
        messageCount: messages.length,
        stream: requestBody.stream
      }
    });

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('Failed to parse error response as JSON:', e);
        errorData = { message: errorText };
      }

      console.error('API Error Response:', errorData);
      return {
        status: 'error',
        message: errorData.message || 'Unable to connect to AI assistant. Please try again later.',
      };
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Process the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let reasoningContent = '';
    let responseContent = '';
    let isAnswering = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode the chunk
      const chunk = decoder.decode(value);
      result += chunk;

      // Split into lines
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          // Check if it's the [DONE] message
          if (line === 'data: [DONE]') continue;

          try {
            // Parse the JSON data
            const data = JSON.parse(line.substring(6));
            console.log('Stream chunk:', data);
            
            // Handle reasoning content
            if (data.choices && 
                data.choices[0] && 
                data.choices[0].delta && 
                data.choices[0].delta.reasoning_content) {
              reasoningContent += data.choices[0].delta.reasoning_content;
              console.log('Reasoning content:', data.choices[0].delta.reasoning_content);
            }
            
            // Handle response content
            if (data.choices && 
                data.choices[0] && 
                data.choices[0].delta && 
                data.choices[0].delta.content) {
              isAnswering = true;
              responseContent += data.choices[0].delta.content;
              console.log('Response content:', data.choices[0].delta.content);
            }
          } catch (e) {
            console.error('Failed to parse stream chunk:', e);
          }
        }
      }
    }

    console.log('Completed streaming. Final content:', {
      reasoningContent,
      responseContent
    });

    // If we have no response content but have reasoning content, use that
    if (!responseContent && reasoningContent) {
      console.log('No response content but found reasoning, using reasoning as fallback');
      responseContent = reasoningContent;
    }

    // Fail if we have no content at all
    if (!responseContent) {
      console.error('No response or reasoning content in API response');
      throw new Error('Empty response from API');
    }
    
    // Return only the final response content to display to the user
    // The reasoning is still stored for debugging purposes
    return {
      status: 'success',
      message: responseContent,
      reasoning: reasoningContent,
      tokens: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  } catch (error) {
    console.error('Detailed error in chat request:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      status: 'error',
      message: 'Unable to connect to AI assistant. Please try again later.',
    };
  }
};
