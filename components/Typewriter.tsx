'use client';

import { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    delay?: number;
    startDelay?: number;
    className?: string;
}

export default function Typewriter({ text, delay = 80, startDelay = 800, className = '' }: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        const startTimeout = setTimeout(() => {
            let currentIndex = 0;

            const intervalId = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(intervalId);
                    setIsTyping(false);
                }
            }, delay);

            return () => clearInterval(intervalId);
        }, startDelay);

        return () => clearTimeout(startTimeout);
    }, [text, delay, startDelay]);

    // Cursor blink effect
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);

        return () => clearInterval(blinkInterval);
    }, []);

    return (
        <span className={`${className} ${!isTyping ? 'typed' : ''}`}>
            {displayedText}
            <span
                className="typing-cursor"
                style={{
                    opacity: showCursor ? 1 : 0,
                    transition: 'opacity 0.1s',
                    marginLeft: '2px',
                    fontWeight: 100
                }}
            >
                |
            </span>
        </span>
    );
}
