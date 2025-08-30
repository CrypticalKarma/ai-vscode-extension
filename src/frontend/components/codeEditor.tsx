import React from 'react';

type CodeEditorProps = {
    code: string;
    onChange: (newCode: string) => void;
};

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
    return (
        <textarea
            className="code-editor"
            value={code}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
