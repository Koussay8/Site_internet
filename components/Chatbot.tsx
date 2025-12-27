'use client';

import { useState, useRef, useEffect } from 'react';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Welcome message - runs only once on mount
    useEffect(() => {
        if (messages.length === 0) {
            simulateTyping("Bonjour ! Je suis Nova, votre conseillère IA. Quel est votre secteur d'activité ?");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <div id="chatbot-widget">
            <button
                className={`chatbot-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="chat-icon">💬</span>
                <span className="close-icon">✕</span>
            </button>

            <div id="chatbot-container" className={isOpen ? '' : 'chatbot-hidden'}>
                <div className="chatbot-header">
                    <span>🤖 Assistant NovaSolutions</span>
                    <small>Trouvez la solution IA parfaite pour vous</small>
                </div>

                <div id="chatbot-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-message ${msg.role}`}>
                            {msg.content}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat-message bot">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chatbot-input-area">
                    <input
                        type="text"
                        id="chatbot-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Décrivez votre activité ou problème..."
                    />
                    <button id="chatbot-send" onClick={sendMessage}>➤</button>
                </div>
            </div>
        </div>
    );
}
