import React, { useState } from 'react';
import ChatBubble from './components/ChatBubble';
import FileList from './components/fileList';
import CodeEditor from './components/codeEditor';

export default function App() {
    const [messages, setMessages] = useState<{ message: string; sender: 'user' | 'ai' }[]>([]);
    const [files, setFiles] = useState<string[]>(['file1.txt', 'file2.txt']);
    const [code, setCode] = useState<string>('console.log("Hello world");');

    return (
        <div className="app-container">
            <div className="chat-section">
                {messages.map((msg, index) => (
                    <ChatBubble key={index} message={msg.message} sender={msg.sender} />
                ))}
            </div>
            <FileList files={files} />
            <CodeEditor code={code} onChange={setCode} />
        </div>
    );
}
