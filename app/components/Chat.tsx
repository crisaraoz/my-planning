import { useState, useRef, useEffect } from "react";
import styles from "./styles/chat.module.css";
import { MessageSquareIcon } from "lucide-react";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; type: "user" | "bot" }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de los mensajes cuando se añaden nuevos
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Agregar el mensaje del usuario
      setMessages((prevMessages) => [...prevMessages, { text: inputValue, type: "user" }]);
      // Agregar una respuesta de ejemplo
      setMessages((prevMessages) => [...prevMessages, { text: "Esta es una respuesta de ejemplo.", type: "bot" }]);
      setInputValue(""); // Limpiar el campo de entrada
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
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"} mb-2`}>
                  <div className={`p-2 rounded-lg max-w-[80%] ${
                    msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Campo de entrada fijo en la parte inferior */}
            <div className="p-3 border-t border-border bg-muted rounded-b-lg">
              <input
                type="text"
                placeholder="Write a message..."
                className="w-full border rounded p-2 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 