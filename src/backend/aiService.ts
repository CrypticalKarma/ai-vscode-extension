import * as vscode from 'vscode';
import OpenAI from 'openai';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load .env if present
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Local chat history format
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'; // Matches OpenAI roles now
  content: string;
  timestamp: number;
}

interface ChecklistItem {
  text: string;
  status: '✅' | '⚠️' | '⬜';
}

interface AIResponse {
  text: string;
  checklist: ChecklistItem[];
}

const chatHistory: Record<string, ChatMessage[]> = {};
const checklistStorage: Record<string, ChecklistItem[]> = {};

function getChecklistFilePath(): string | null {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return null;
  return path.join(folders[0].uri.fsPath, '.vscode', 'aiChecklist.json');
}

export async function getAIResponse(prompt: string, userContent?: string): Promise<AIResponse> {
  const workspaceKey = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'default';

  if (!chatHistory[workspaceKey]) chatHistory[workspaceKey] = [];
  if (!checklistStorage[workspaceKey]) checklistStorage[workspaceKey] = loadChecklist();

  // Push user message into history
  chatHistory[workspaceKey].push({ role: 'user', content: prompt, timestamp: Date.now() });

  const combinedPrompt = userContent
    ? `${prompt}\n\nPlease proofread the following content:\n${userContent}`
    : prompt;

  let aiText = '';

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // faster + cheaper than plain gpt-4
      messages: [
        { role: 'system', content: 'You are a helpful coding assistant tracking project checklist progress.' },
        ...chatHistory[workspaceKey].map(m => ({
          role: m.role, // now strictly 'system' | 'user' | 'assistant'
          content: m.content,
        })),
        { role: 'user', content: combinedPrompt },
      ],
    });

    aiText = response.choices?.[0]?.message?.content || 'No response from AI';
  } catch (err) {
    console.error('Error fetching AI response:', err);
    aiText = 'Error fetching AI response.';
  }

  // Push assistant reply to history
  chatHistory[workspaceKey].push({ role: 'assistant', content: aiText, timestamp: Date.now() });

  updateChecklistFromAI(aiText, workspaceKey);
  saveChecklist(workspaceKey);

  return { text: aiText, checklist: checklistStorage[workspaceKey] };
}

function loadChecklist(): ChecklistItem[] {
  const filePath = getChecklistFilePath();
  if (!filePath) return [];
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as ChecklistItem[];
    }
  } catch (err) {
    console.error('Error loading checklist:', err);
  }
  return [];
}

function saveChecklist(workspaceKey: string) {
  const filePath = getChecklistFilePath();
  if (!filePath) return;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(checklistStorage[workspaceKey], null, 2));
  } catch (err) {
    console.error('Error saving checklist:', err);
  }
}

function updateChecklistFromAI(aiText: string, workspaceKey: string) {
  const items = checklistStorage[workspaceKey];
  items.forEach(item => {
    if (aiText.toLowerCase().includes(item.text.toLowerCase())) {
      item.status = '✅';
    }
  });
  checklistStorage[workspaceKey] = items;
}
