import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

interface ChecklistItem {
    label: string;
    done: boolean;
    proofreadRequired?: boolean;
}

let projectChecklist: ChecklistItem[] = [
    { label: 'Open AI Panel', done: false },
    { label: 'Send first AI query', done: false, proofreadRequired: true },
    { label: 'Receive AI response', done: false }
];

const CHECKLIST_FILE = '.vscode/aiChecklist.json';

// Load checklist from project folder
function loadChecklist(workspacePath: string) {
    const filePath = path.join(workspacePath, CHECKLIST_FILE);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        projectChecklist = JSON.parse(data);
    }
}

// Save checklist to project folder
function saveChecklist(workspacePath: string) {
    const filePath = path.join(workspacePath, CHECKLIST_FILE);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(projectChecklist, null, 2));
}

// Initialize OpenAI client (replace process.env.OPENAI_API_KEY with your key)
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
});

export async function getAIResponse(userPrompt: string, userContent?: string): Promise<{ text: string; checklist: ChecklistItem[] }> {
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    if (workspacePath) loadChecklist(workspacePath);

    // Auto-update checklist based on prompt
    projectChecklist = projectChecklist.map(item => {
        if (userPrompt.toLowerCase().includes(item.label.toLowerCase())) {
            return { ...item, done: true };
        }
        return item;
    });

    let responseText = '';

    if (!process.env.OPENAI_API_KEY) {
        responseText = `[Placeholder AI response] You asked: ${userPrompt}`;
        if (userContent) responseText += '\n\n[Proofreading] Looks good. Minor suggestions.';
    } else {
        // Make actual OpenAI call
        const promptText = userContent ? `${userPrompt}\n\nPlease proofread the following:\n${userContent}` : userPrompt;

        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: promptText }],
        });

        responseText = completion.choices[0]?.message?.content || '[No response]';
    }

    if (workspacePath) saveChecklist(workspacePath);

    return { text: responseText, checklist: projectChecklist };
}
