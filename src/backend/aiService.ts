// src/backend/aiService.ts
export async function getAIResponse(prompt: string): Promise<string> {
    // For now, return a simple hardcoded response
    return `AI Response to: "${prompt}"`;
}
