type ChatBubbleProps = {
    message: string;
    sender: 'user' | 'ai';
};

export function ChatBubble({ message, sender }: ChatBubbleProps): string {
    const bubbleClass = sender === 'user' ? 'chat-bubble user' : 'chat-bubble ai';
    return `
        <div class="${bubbleClass}">
            <p>${message}</p>
        </div>
    `;
}
