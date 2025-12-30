/**
 * NovaSolutions Chatbot Widget - Embeddable Script
 * Usage: <script src="https://votre-domaine.com/embed/chatbot.js" data-client-id="CLIENT_ID"></script>
 */
(function () {
    'use strict';

    // Get client ID from script tag
    const scriptTag = document.currentScript;
    const clientId = scriptTag?.getAttribute('data-client-id') || '';
    const apiUrl = scriptTag?.src.replace('/embed/chatbot.js', '') || '';

    if (!clientId) {
        console.error('[NovaChatbot] Missing data-client-id attribute');
        return;
    }

    // Inject CSS
    const styles = `
        #nova-chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }

        #nova-chatbot-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            transition: all 0.3s ease;
        }

        #nova-chatbot-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(139, 92, 246, 0.6);
        }

        #nova-chatbot-btn .chat-icon,
        #nova-chatbot-btn .close-icon {
            position: absolute;
            transition: all 0.3s ease;
        }

        #nova-chatbot-btn .close-icon {
            opacity: 0;
            transform: rotate(-90deg);
        }

        #nova-chatbot-btn.active .chat-icon {
            opacity: 0;
            transform: rotate(90deg);
        }

        #nova-chatbot-btn.active .close-icon {
            opacity: 1;
            transform: rotate(0);
        }

        #nova-chatbot-container {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 380px;
            height: 520px;
            background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
            opacity: 1;
            transform: translateY(0);
        }

        #nova-chatbot-container.hidden {
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        }

        .nova-chatbot-header {
            background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%);
            padding: 20px;
            text-align: center;
            color: white;
        }

        .nova-chatbot-header span {
            font-size: 18px;
            font-weight: 600;
            display: block;
        }

        .nova-chatbot-header small {
            font-size: 12px;
            opacity: 0.9;
            margin-top: 4px;
            display: block;
        }

        #nova-chatbot-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        #nova-chatbot-messages::-webkit-scrollbar {
            width: 6px;
        }

        #nova-chatbot-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        #nova-chatbot-messages::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
        }

        .nova-chat-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            animation: nova-fadeIn 0.3s ease;
        }

        @keyframes nova-fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .nova-chat-message.user {
            background: linear-gradient(135deg, #a855f7, #6366f1);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .nova-chat-message.bot {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .nova-typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 0;
        }

        .nova-typing-indicator span {
            width: 8px;
            height: 8px;
            background: rgba(139, 92, 246, 0.6);
            border-radius: 50%;
            animation: nova-bounce 1.4s infinite ease-in-out;
        }

        .nova-typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .nova-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .nova-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes nova-bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
        }

        .nova-chatbot-input-area {
            display: flex;
            padding: 15px;
            gap: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        #nova-chatbot-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.05);
            color: white;
            font-size: 14px;
            outline: none;
            transition: all 0.3s ease;
        }

        #nova-chatbot-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        #nova-chatbot-input:focus {
            border-color: rgba(139, 92, 246, 0.5);
            background: rgba(255, 255, 255, 0.08);
        }

        #nova-chatbot-send {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #a855f7, #6366f1);
            border: none;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        #nova-chatbot-send:hover {
            transform: scale(1.1);
        }

        #nova-chatbot-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        @media (max-width: 480px) {
            #nova-chatbot-container {
                width: calc(100vw - 40px);
                height: calc(100vh - 120px);
                bottom: 80px;
                right: -10px;
            }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widget = document.createElement('div');
    widget.id = 'nova-chatbot-widget';
    widget.innerHTML = `
        <button id="nova-chatbot-btn">
            <span class="chat-icon">💬</span>
            <span class="close-icon">✕</span>
        </button>
        <div id="nova-chatbot-container" class="hidden">
            <div class="nova-chatbot-header">
                <span>🤖 Assistant IA</span>
                <small>Comment puis-je vous aider ?</small>
            </div>
            <div id="nova-chatbot-messages"></div>
            <div class="nova-chatbot-input-area">
                <input type="text" id="nova-chatbot-input" placeholder="Écrivez votre message...">
                <button id="nova-chatbot-send">➤</button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // State
    let isOpen = false;
    let messages = [];
    let isLoading = false;

    // Elements
    const btn = document.getElementById('nova-chatbot-btn');
    const container = document.getElementById('nova-chatbot-container');
    const messagesEl = document.getElementById('nova-chatbot-messages');
    const input = document.getElementById('nova-chatbot-input');
    const sendBtn = document.getElementById('nova-chatbot-send');

    // Toggle chatbot
    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        btn.classList.toggle('active', isOpen);
        container.classList.toggle('hidden', !isOpen);
        if (isOpen && messages.length === 0) {
            addBotMessage("Bonjour ! Comment puis-je vous aider aujourd'hui ?");
        }
    });

    // Add message to UI
    function addMessage(role, content) {
        const msg = document.createElement('div');
        msg.className = `nova-chat-message ${role}`;
        msg.textContent = content;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        messages.push({ role, content });
    }

    function addBotMessage(text) {
        // Simulate typing effect
        const msg = document.createElement('div');
        msg.className = 'nova-chat-message bot';
        messagesEl.appendChild(msg);

        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                msg.textContent = text.slice(0, i + 1);
                messagesEl.scrollTop = messagesEl.scrollHeight;
                i++;
            } else {
                clearInterval(interval);
                messages.push({ role: 'bot', content: text });
            }
        }, 15);
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'nova-chat-message bot';
        typing.id = 'nova-typing';
        typing.innerHTML = '<div class="nova-typing-indicator"><span></span><span></span><span></span></div>';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('nova-typing');
        if (typing) typing.remove();
    }

    // Send message
    async function sendMessage() {
        const text = input.value.trim();
        if (!text || isLoading) return;

        input.value = '';
        addMessage('user', text);
        isLoading = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            const response = await fetch(`${apiUrl}/api/embed/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: clientId,
                    message: text,
                    history: messages.slice(-10)
                })
            });

            const data = await response.json();
            hideTyping();

            if (data.error) {
                addBotMessage("Désolé, une erreur s'est produite. Réessayez.");
            } else {
                // Handle booking block if present
                const blockPattern = /\*{0,2}BLOCK_RDV\*{0,2}\s*:?\s*(\{[\s\S]*?\})/i;
                const blockMatch = data.response.match(blockPattern);

                if (blockMatch) {
                    try {
                        const bookingData = JSON.parse(blockMatch[1]);
                        const hasEmail = bookingData.contact?.includes('@');
                        const confirmMsg = hasEmail
                            ? "Parfait ! 📧 Vous recevrez un email de confirmation. À très bientôt !"
                            : "C'est noté ! Nous vous contacterons très bientôt !";
                        addBotMessage(confirmMsg);

                        // Send booking notification
                        await fetch(`${apiUrl}/api/embed/booking`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ clientId, ...bookingData })
                        });
                    } catch {
                        addBotMessage(data.response.replace(blockPattern, '').trim());
                    }
                } else {
                    addBotMessage(data.response);
                }
            }
        } catch (error) {
            hideTyping();
            addBotMessage("Désolé, une erreur s'est produite. Réessayez.");
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();
