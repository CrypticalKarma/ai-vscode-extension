const fs = require('fs');
const path = require('path');

// Define batches of folders/files
const batches = [
  {
    description: 'Core folders and extension entry point',
    items: {
      'src/': null,
      'src/extension.ts': `import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension activated');
}

export function deactivate() {}`
    }
  },
  {
    description: 'Backend modules',
    items: {
      'src/backend/': null,
      'src/backend/aiService.ts': `export const aiService = () => {};`,
      'src/backend/fileManager.ts': `export const readFile = (path: string) => {};`,
      'src/backend/projectAnalyzer.ts': `export const analyzeProject = () => {};`
    }
  },
  {
    description: 'Frontend modules',
    items: {
      'src/frontend/': null,
      'src/frontend/components/': null,
      'src/frontend/aiPanel.ts': `export const createAiPanel = () => {};`,
      'src/frontend/panelRenderer.ts': `export const renderPanel = () => {};`,
      'src/frontend/components/fileList.tsx': `export const FileList = () => null;`,
      'src/frontend/components/codeEditor.tsx': `export const CodeEditor = () => null;`
    }
  },
  {
    description: 'Utils and types',
    items: {
      'src/utils/': null,
      'src/utils/logger.ts': `export const log = (msg: string) => console.log(msg);`,
      'src/utils/pathUtils.ts': `export const normalizePath = (p: string) => p;`,
      'src/utils/constants.ts': `export const AI_API_URL = '';`,
      'src/types/': null,
      'src/types/ai.ts': `export interface AIRequest { prompt: string; }`,
      'src/types/file.ts': `export interface FileData { path: string; content: string; }`,
      'src/types/webview.ts': `export interface WebviewMessage { type: string; payload: any; }`
    }
  },
  {
    description: 'Root config files',
    items: {
      'package.json': `{
  "name": "ai-vscode-extension",
  "displayName": "AI VSCode Extension",
  "version": "0.0.1",
  "main": "./out/extension.js"
}`,
      'tsconfig.json': `{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "rootDir": "src",
    "strict": true
  }
}`,
      '.gitignore': `node_modules/\nout/\n.vscode/`,
      'README.md': `# AI VSCode Extension`
    }
  }
];

// Function to create folders/files
const createBatch = (batch) => {
  console.log(`\n--- Creating batch: ${batch.description} ---`);
  for (const [filePath, content] of Object.entries(batch.items)) {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content || '');
      console.log(`Created: ${filePath}`);
    } else {
      console.log(`Skipped (exists): ${filePath}`);
    }
  }
};

// Run incrementally
const runBatches = async () => {
  for (const batch of batches) {
    createBatch(batch);
    console.log(`Batch "${batch.description}" done. Test before continuing.\n`);
    // Optional: wait for user input before next batch
    await new Promise(res => {
      process.stdout.write('Press Enter to continue to next batch...');
      process.stdin.once('data', () => res());
    });
  }
  console.log('\nAll batches complete!');
};

runBatches();
