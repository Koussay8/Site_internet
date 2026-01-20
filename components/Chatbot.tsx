'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import knowledgeBase from '@/knowledge-base.json';

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
        const tempMessage: Message = { role: 'bot', content: '' };
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
        }, 15);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    knowledgeBase: knowledgeBase,
                }),
            });

            const data = await response.json();

            if (data.error) {
                simulateTyping("Désolé, une erreur s'est produite. Réessayez.");
            } else {
                // Check for booking block
                const blockPattern = /\*{0,2}BLOCK_RDV\*{0,2}\s*:?\s*(\{[\s\S]*?\})/i;
                const blockMatch = data.response.match(blockPattern);

                if (blockMatch) {
                    try {
                        const bookingData = JSON.parse(blockMatch[1]);
                        const hasEmail = bookingData.contact?.includes('@');
                        const confirmMsg = hasEmail
                            ? "Parfait ! 📧 Vous recevrez un email de confirmation avec l'invitation calendar. À très bientôt !"
                            : "C'est noté ! Un membre de notre équipe vous contactera. À très bientôt !";
                        simulateTyping(confirmMsg);

                        // Send booking to backend
                        await fetch('/api/contact', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...bookingData, type: 'chatbot_booking' }),
                        });
                    } catch {
                        simulateTyping(data.response.replace(blockPattern, '').trim());
                    }
                } else {
                    simulateTyping(data.response);
                }
            }
        } catch {
            simulateTyping("Désolé, une erreur s'est produite. Réessayez.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-2xl shadow-orange-500/50 hover:scale-110 transition-all duration-300 ${isOpen ? 'rotate-0' : ''
                    }`}
                aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
            >
                {/* Pulse animation */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 animate-ping opacity-75"></span>
                )}

                {isOpen ? (
                    <X className="w-7 h-7 relative z-10" />
                ) : (
                    <MessageCircle className="w-7 h-7 relative z-10" />
                )}

                {/* Badge "Nouveau" */}
                {!isOpen && !hasGreeted && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`absolute bottom-20 right-0 w-[380px] sm:w-[420px] h-[600px] bg-[rgb(30,30,30)] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-300 flex flex-col overflow-hidden ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-orange-400 to-orange-600 p-6 flex items-center gap-3 shadow-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">Nova</h3>
                        <p className="text-white/90 text-sm">Votre conseillère IA</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-white/90 text-xs font-medium">En ligne</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[rgb(25,25,27)]">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/10 rounded-full mb-4">
                                <Sparkles className="w-10 h-10 text-orange-400" />
                            </div>
                            <p className="text-gray-400 text-sm">
                                Décrivez votre activité et découvrez comment l'IA peut vous aider
                            </p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                                        : 'bg-white/5 text-white border border-white/10 backdrop-blur-sm'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-[rgb(30,30,30)] border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Décrivez votre activité..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-orange-500/30"
                            aria-label="Envoyer"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-500 text-xs text-center mt-2">
                        Propulsé par l'IA · Réponse instantanée
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
