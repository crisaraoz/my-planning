import { useState, useRef, useEffect } from "react";
import styles from "./styles/chat.module.css";
import { MessageSquareIcon } from "lucide-react";
import { sendChatRequest } from "../services/chatService";
import { Mosaic } from "react-loading-indicators";
import { toast } from "sonner";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant for project management and task planning.' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the end of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      console.log('Sending messages:', newMessages); // Debug log
      const response = await sendChatRequest(newMessages);
      console.log('Received response:', response); // Debug log
      
      if (response.status === 'success' && response.message) {
        // Only add the final response (not the thinking process)
        const assistantMessage = { 
          role: 'assistant' as const, 
          content: response.message,
          reasoning: response.reasoning // Store reasoning but don't display it
        };
        console.log('Adding assistant message:', assistantMessage); // Debug log
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Instead of showing the raw error, add a more user-friendly assistant message
        const errorMessage = { 
          role: 'assistant' as const, 
          content: 'I apologize, but I\'m unable to process your request at the moment. Please try again.' 
        };
        console.log('Adding error message:', errorMessage); // Debug log
        setMessages(prev => [...prev, errorMessage]);
        
        // Show error toast
        toast.error(response.message || 'Unable to get response from AI assistant');
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Add a friendly assistant message on errors
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'I apologize, but I\'m unable to process your request at the moment. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Unable to connect to AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main chat container */}
      <div className={`flex flex-col transition-all duration-300 ${isOpen ? "h-[500px] w-[400px]" : "h-12 w-40"}`}>
        {/* Chat header */}
        <div
          className={`${styles.chatButton} bg-card text-card-foreground rounded-lg p-3 shadow-lg flex items-center justify-between cursor-pointer`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {!isOpen && <MessageSquareIcon className="w-4 h-4 mr-2 text-primary" />}
          <span className={`transition-all duration-300 ${isOpen ? "text-card-foreground" : styles.textGradient}`}>
            {isOpen ? "Close Chat" : "AI Assistant"}
          </span>
          {isOpen && (
            <span className="text-card-foreground text-lg font-bold" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          )}
        </div>

        {isOpen && (
          <div className="bg-card rounded-lg flex flex-col flex-grow h-full overflow-hidden mt-2 border border-border shadow-md">
            {/* Assistant title */}
            <h3 className="font-semibold text-card-foreground p-3 border-b border-border">AI Assistant</h3>
            
            {/* Message container */}
            <div className="overflow-y-auto flex-grow p-3 bg-background">
              {messages.filter(m => m.role !== 'system').map((message, index) => (
                <div 
                  key={index} 
                  className={`flex mb-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                    <Mosaic 
                      color={["#6c2dcd", "#5433d6", "#3c59df", "#2481e8"]} 
                      size="small" 
                      text="" 
                      textColor="" 
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input field fixed at the bottom */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-muted rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 