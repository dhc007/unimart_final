
import { useState, useRef, useEffect } from "react";
import { Bot, X, SendHorizontal, Maximize, Minimize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MockDataService from "@/services/mockDataService";

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I'm UniBot, your UniMart assistant. How can I help you today?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const dataService = MockDataService.getInstance();
      const products = await dataService.getProducts();
      setProducts(products);
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatProductDetails = (product) => {
    return `📌 *${product.title}* (Category: ${product.category})
💰 Price: ₹${product.price}
🔹 Condition: ${product.condition}
🔹 Seller: ${product.seller}
🔹 Subject: ${product.subject}`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    const userMessage = message;
    setMessage("");
    setIsTyping(true);

    // Search for product matches in the message
    const lowercaseMessage = userMessage.toLowerCase();
    const matchedProducts = products.filter(product =>
      product.title.toLowerCase().includes(lowercaseMessage) ||
      product.category.toLowerCase().includes(lowercaseMessage) ||
      product.subject.toLowerCase().includes(lowercaseMessage)
    );

    try {
      // Simulate API call with delay
      setTimeout(() => {
        let response;
        
        if (matchedProducts.length > 0) {
          // Return product info if we found matches
          response = `I found ${matchedProducts.length} matching items:\n\n${
            matchedProducts.slice(0, 3).map(formatProductDetails).join("\n\n")
          }${matchedProducts.length > 3 ? "\n\n...and more" : ""}`;
        } else if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
          response = "Hello! How can I help you today?";
        } else if (lowercaseMessage.includes("textbook") || lowercaseMessage.includes("book")) {
          response = "We have several textbooks available. Are you looking for any specific subject?";
        } else if (lowercaseMessage.includes("lab") || lowercaseMessage.includes("equipment")) {
          response = "We have lab coats, safety goggles, and other lab equipment available. What specifically are you looking for?";
        } else if (lowercaseMessage.includes("sell")) {
          response = "You can sell your items by going to the 'Sell' page from the navigation menu!";
        } else if (lowercaseMessage.includes("price") || lowercaseMessage.includes("cost")) {
          response = "Prices vary depending on the item. Is there a specific product you're interested in?";
        } else if (lowercaseMessage.includes("blockchain")) {
          response = "Our blockchain verification ensures authentic listings from real students. Look for the verified badge!";
        } else {
          response = "I'm not sure I understand. Could you try rephrasing or ask about specific products, categories, or subjects?";
        }
        
        setMessages((prev) => [...prev, { role: "bot", content: response }]);
        setIsTyping(false);
        
        // Show toast notification for new message
        toast({
          title: "New message from UniBot",
          description: response.substring(0, 60) + (response.length > 60 ? "..." : ""),
          variant: "default",
        });
      }, 1500);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [...prev, { 
        role: "bot", 
        content: "Sorry, I'm having trouble processing your request right now. Please try again later." 
      }]);
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg z-20 flex items-center justify-center"
            onClick={toggleChat}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-80 md:w-96 rounded-lg shadow-xl overflow-hidden z-20 bg-white border border-gray-200"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              height: isMinimized ? "auto" : "500px" 
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot size={20} />
                <h3 className="font-medium">UniBot</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={toggleMinimize} className="p-1 rounded hover:bg-blue-500">
                  {isMinimized ? <Maximize size={16} /> : <Minimize size={16} />}
                </button>
                <button onClick={toggleChat} className="p-1 rounded hover:bg-blue-500">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div 
                  className="flex flex-col h-[calc(500px-110px)]"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.content}</div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-800">
                          <div className="flex space-x-1">
                            <motion.div
                              className="w-2 h-2 rounded-full bg-gray-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            />
                            <motion.div
                              className="w-2 h-2 rounded-full bg-gray-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 rounded-full bg-gray-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 mr-2"
                      disabled={isTyping}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isTyping || !message.trim()}
                      className={isTyping ? "bg-gray-400" : "bg-blue-600"}
                    >
                      <SendHorizontal size={18} />
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
