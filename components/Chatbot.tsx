import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, ArrowRight, Calendar } from 'lucide-react';
import knowledgeBase from '../knowledge-base.json';

interface Message {
    role: 'user' | 'bot';
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Welcome message - only when chat is opened for the first time
    useEffect(() => {
        if (isOpen && !hasGreeted && messages.length === 0) {
            setHasGreeted(true);
            simulateTyping("Bonjour ! Je suis Nova, votre conseillère IA. Quel est votre secteur d'activité ?");
        }
    }, [isOpen, hasGreeted, messages.length]);

    const simulateTyping = (text: string) => {
        let index = 0;
        setIsLoading(true);
        const tempMessage: Message = { role: 'bot', content: '' };

        // Slight initial delay for realism
        setTimeout(() => {
            setIsLoading(false);
            setMessages(prev => [...prev, tempMessage]);

            const interval = setInterval(() => {
                if (index < text.length) {
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'bot', content: text.slice(0, index + 1) };
                        return updated;
                    });
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 20); // Slightly faster typing
        }, 600);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Mock API call since we don't have the backend
        setTimeout(() => {
            setIsLoading(false);
            // Simple mock logic based on keywords
            let response = "Je peux vous aider à automatiser cette tâche. Souhaitez-vous un rendez-vous de démonstration ?";

            if (userMessage.toLowerCase().includes("prix") || userMessage.toLowerCase().includes("coût")) {
                response = "Nos solutions commencent à partir de 1000€/mois pour un retour sur investissement rapide. Voulez-vous une estimation précise ?";
            } else if (userMessage.toLowerCase().includes("rdv") || userMessage.toLowerCase().includes("rendez-vous")) {
                response = "**BLOCK_RDV** {\"contact\": \"email@example.com\"}";
            } else if (userMessage.toLowerCase().includes("bonjour") || userMessage.toLowerCase().includes("salut")) {
                response = "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
            }

            // Check for booking block logic from original code
            const blockPattern = /\*{0,2}BLOCK_RDV\*{0,2}\s*:?\s*(\{[\s\S]*?\})/i;
            const blockMatch = response.match(blockPattern);

            if (blockMatch) {
                simulateTyping("Parfait ! 📧 Vous recevrez une invitation. À très bientôt !");
            } else {
                simulateTyping(response);
            }

        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Chat Button with advanced animation */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-16 h-16 rounded-full bg-[rgb(20,20,20)] border border-orange-500/30 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:scale-105 transition-all duration-300 ${isOpen ? 'rotate-90 scale-90' : ''}`}
                aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
            >
                {/* Glowing Orb Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-600/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                {isOpen ? (
                    <X className="w-6 h-6 relative z-10 text-gray-300" />
                ) : (
                    <div className="relative z-10">
                        <div className="absolute inset-0 bg-orange-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                        <Bot className="w-7 h-7 text-orange-500" />
                    </div>
                )}

                {/* Badge "Nouveau" */}
                {!isOpen && !hasGreeted && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                    </span>
                )}
            </button>

            {/* Chat Window - Futuristic Glassmorphism */}
            <div
                className={`absolute bottom-24 right-0 w-[360px] sm:w-[400px] h-[650px] max-h-[calc(100vh-120px)] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[30px] shadow-2xl transition-all duration-500 origin-bottom-right overflow-hidden flex flex-col ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
                    }`}
            >
                {/* Header with subtle gradient */}
                <div className="relative p-6 flex items-center gap-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 blur-md opacity-40 rounded-full"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full border border-orange-500/30 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-lg tracking-wide">Nova</h3>
                        <p className="text-orange-400/80 text-xs font-medium uppercase tracking-wider">Assistant IA • Vextra</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center py-10 opacity-60">
                            <Sparkles className="w-12 h-12 text-orange-500/50 mx-auto mb-4" />
                            <p className="text-gray-400 text-sm max-w-[200px] mx-auto">
                                Posez-moi une question sur l'automatisation ou prenez rendez-vous.
                            </p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}
                        >
                            {msg.role === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 mt-1 shrink-0">
                                    <Bot className="w-4 h-4 text-orange-500" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-orange-600 text-white rounded-tr-sm'
                                    : 'bg-white/10 text-gray-100 border border-white/5 rounded-tl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center ml-3 mt-1 shrink-0">
                                    <User className="w-4 h-4 text-orange-500" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start items-center gap-3 animate-message-in">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 rounded-tl-sm">
                                <div className="flex items-center gap-1.5 h-4">
                                    <span className="w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Écrivez votre message..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-5 pr-14 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/30 focus:bg-white/10 transition-all text-sm shadow-inner"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-white transition-all disabled:opacity-0 disabled:scale-75 shadow-lg shadow-orange-900/20"
                            aria-label="Envoyer"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                @keyframes messageIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-message-in {
                    animation: messageIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
