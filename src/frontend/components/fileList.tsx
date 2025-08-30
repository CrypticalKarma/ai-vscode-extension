import React from 'react';

type FileListProps = {
    files: string[];
};

export default function FileList({ files }: FileListProps) {
    return (
        <ul className="file-list">
            {files.map((file, index) => (
                <li key={index}>{file}</li>
            ))}
        </ul>
    );
}
