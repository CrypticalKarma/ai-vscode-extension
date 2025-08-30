import React from 'react';
import ChatBubble from './components/ChatBubble';
import FileList from './components/fileList';
import CodeEditor from './components/codeEditor';

const App: React.FC = () => {
  return (
    <div>
      <h1>VS Code Extension Webview</h1>
      <ChatBubble />
      <FileList />
      <CodeEditor />
    </div>
  );
};

export default App;
