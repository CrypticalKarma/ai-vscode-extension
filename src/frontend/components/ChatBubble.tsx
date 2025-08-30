import React from 'react';

type ChatBubbleProps = {
    message: string;
    sender: 'user' | 'ai';
};

export default function ChatBubble({ message, sender }: ChatBubbleProps) {
    const bubbleClass = sender === 'user' ? 'chat-bubble user' : 'chat-bubble ai';
    return (
        <div className={bubbleClass}>
            <p>{message}</p>
        </div>
    );
}
