/**
 * NovaSolutions Chatbot Widget - Embeddable Script
 * Include this script on any website to add the chatbot
 * 
 * Usage: <script src="https://yoursite.com/embed/chatbot.js" data-widget-key="YOUR_KEY"></script>
 */

(function () {
    // Get widget key from script tag
    const scriptTag = document.currentScript || document.querySelector('script[data-widget-key]');
    const widgetKey = scriptTag?.getAttribute('data-widget-key');

    if (!widgetKey) {
        console.error('NovaSolutions Chatbot: Missing data-widget-key attribute');
        return;
    }

    // Configuration
    const API_BASE = scriptTag?.src.replace('/embed/chatbot.js', '') || window.location.origin;
    const COLORS = {
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        bg: '#1e1b4b',
        text: '#ffffff',
        textMuted: '#94a3b8'
    };

    // State
    let isOpen = false;
    let sessionId = localStorage.getItem('nova_chat_session') || null;
    let conversationHistory = [];
    let welcomeMessage = 'Bonjour ! Comment puis-je vous aider ?';

    // Create styles
    const styles = document.createElement('style');
    styles.textContent = `
        #nova-chatbot-widget {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
        }
        
        #nova-chat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        #nova-chat-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(139, 92, 246, 0.5);
        }
        
        #nova-chat-button svg {
            width: 28px;
            height: 28px;
            fill: white;
        }
        
        #nova-chat-window {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 380px;
            height: 520px;
            background: linear-gradient(135deg, ${COLORS.bg} 0%, #312e81 100%);
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(139, 92, 246, 0.3);
        }
        
        #nova-chat-window.open {
            display: flex;
            animation: nova-slide-up 0.3s ease;
        }
        
        @keyframes nova-slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        #nova-chat-header {
            padding: 16px 20px;
            background: rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        #nova-chat-header h3 {
            margin: 0;
            color: ${COLORS.text};
            font-size: 16px;
            font-weight: 600;
        }
        
        #nova-chat-close {
            background: none;
            border: none;
            color: ${COLORS.textMuted};
            cursor: pointer;
            padding: 4px;
        }
        
        #nova-chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .nova-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .nova-message.user {
            align-self: flex-end;
            background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .nova-message.assistant {
            align-self: flex-start;
            background: rgba(255,255,255,0.1);
            color: ${COLORS.text};
            border-bottom-left-radius: 4px;
        }
        
        .nova-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
        }
        
        .nova-typing span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${COLORS.textMuted};
            animation: nova-bounce 1.4s infinite ease-in-out;
        }
        
        .nova-typing span:nth-child(1) { animation-delay: 0s; }
        .nova-typing span:nth-child(2) { animation-delay: 0.2s; }
        .nova-typing span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes nova-bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        
        #nova-chat-input-area {
            padding: 16px;
            background: rgba(0,0,0,0.2);
            display: flex;
            gap: 10px;
        }
        
        #nova-chat-input {
            flex: 1;
            padding: 12px 16px;
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.05);
            color: ${COLORS.text};
            font-size: 14px;
            outline: none;
        }
        
        #nova-chat-input::placeholder {
            color: ${COLORS.textMuted};
        }
        
        #nova-chat-input:focus {
            border-color: ${COLORS.primary};
        }
        
        #nova-chat-send {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #nova-chat-send svg {
            width: 20px;
            height: 20px;
            fill: white;
        }
        
        #nova-chat-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        @media (max-width: 480px) {
            #nova-chat-window {
                width: calc(100vw - 40px);
                height: calc(100vh - 120px);
                bottom: 70px;
                right: 0;
            }
        }
    `;
    document.head.appendChild(styles);

    // Create widget HTML
    const widget = document.createElement('div');
    widget.id = 'nova-chatbot-widget';
    widget.innerHTML = `
        <div id="nova-chat-window">
            <div id="nova-chat-header">
                <h3>💬 Assistant</h3>
                <button id="nova-chat-close">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div id="nova-chat-messages"></div>
            <div id="nova-chat-input-area">
                <input type="text" id="nova-chat-input" placeholder="Écrivez votre message..." />
                <button id="nova-chat-send">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
        <button id="nova-chat-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
        </button>
    `;
    document.body.appendChild(widget);

    // Get elements
    const chatButton = document.getElementById('nova-chat-button');
    const chatWindow = document.getElementById('nova-chat-window');
    const chatClose = document.getElementById('nova-chat-close');
    const chatMessages = document.getElementById('nova-chat-messages');
    const chatInput = document.getElementById('nova-chat-input');
    const chatSend = document.getElementById('nova-chat-send');

    // Toggle chat
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);
        if (isOpen && chatMessages.children.length === 0) {
            addMessage(welcomeMessage, 'assistant');
        }
    }

    chatButton.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);

    // Add message to chat
    function addMessage(text, role) {
        const msg = document.createElement('div');
        msg.className = `nova-message ${role}`;
        msg.textContent = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (role !== 'typing') {
            conversationHistory.push({ role, content: text });
        }
    }

    // Show typing indicator
    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'nova-message assistant nova-typing';
        typing.id = 'nova-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('nova-typing');
        if (typing) typing.remove();
    }

    // Send message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        chatSend.disabled = true;

        addMessage(text, 'user');
        showTyping();

        try {
            const response = await fetch(`${API_BASE}/api/chat/embed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    widgetApiKey: widgetKey,
                    sessionId: sessionId,
                    message: text,
                    conversationHistory: conversationHistory.slice(0, -1) // Exclude new message
                })
            });

            const data = await response.json();
            hideTyping();

            if (data.message) {
                addMessage(data.message, 'assistant');
            }

            if (data.sessionId && !sessionId) {
                sessionId = data.sessionId;
                localStorage.setItem('nova_chat_session', sessionId);
            }

        } catch (error) {
            hideTyping();
            addMessage('Désolé, une erreur est survenue. Veuillez réessayer.', 'assistant');
        }

        chatSend.disabled = false;
        chatInput.focus();
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();
