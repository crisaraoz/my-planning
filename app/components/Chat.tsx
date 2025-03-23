import { useState, useRef, useEffect } from "react";
import styles from "./styles/chat.module.css";
import { MessageSquareIcon } from "lucide-react";
import { sendChatRequest } from "../services/chatService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant for project management and task planning.' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de los mensajes cuando se añaden nuevos
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
      const response = await sendChatRequest(newMessages);
      
      if (response.status === 'success') {
        setMessages([
          ...newMessages, 
          { role: 'assistant' as const, content: response.message }
        ]);
      } else {
        // Instead of showing the raw error, add a more user-friendly assistant message
        setMessages([
          ...newMessages, 
          { role: 'assistant' as const, content: 'I apologize, but I\'m unable to connect to the AI service at the moment. Please try again later.' }
        ]);
        
        // Still log the error via toast but with the friendlier message
        toast.error(response.message);
      }
    } catch (error) {
      // Add a friendly assistant message even on unexpected errors
      setMessages([
        ...newMessages, 
        { role: 'assistant' as const, content: 'I apologize, but I\'m unable to connect to the AI service at the moment. Please try again later.' }
      ]);
      toast.error("Unable to connect to AI assistant");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Contenedor principal del chat */}
      <div className={`flex flex-col transition-all duration-300 ${isOpen ? "h-[400px] w-[300px]" : "h-12 w-40"}`}>
        {/* Cabecera del chat */}
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
            {/* Título del asistente */}
            <h3 className="font-semibold text-card-foreground p-3 border-b border-border">AI Assistant</h3>
            
            {/* Contenedor de mensajes */}
            <div className="overflow-y-auto flex-grow p-3 bg-background">
              {messages.filter(m => m.role !== 'system').map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Campo de entrada fijo en la parte inferior */}
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
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
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