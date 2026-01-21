
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OllamaService {
  // standard local Ollama port
  private readonly API_URL = 'http://localhost:11434/api/generate';
  
  // Defaulting to 'llama3'. The user must have this pulled via `ollama pull llama3`
  // or change this string to a model they have (e.g., 'mistral', 'gemma:2b').
  private readonly MODEL = 'llama3';
  
  // 30 second timeout for agent responses
  private readonly TIMEOUT_MS = 30000;

  async promptAgent(role: string, specialization: string, context: string): Promise<string> {
    const systemPrompt = `You are an AI Subagent in a high-performance autonomous Game Studio.
    The studio builds complete AA-quality games from single user prompts.
    
    Identity:
    - Role: ${role}
    - Specialization: ${specialization}

    Guidelines:
    1. Keep responses concise, technical, and relevant to professional game development.
    2. Focus your output heavily on your specialization (${specialization}).
    3. If you are a coder, provide specific architectural decisions or code snippets related to your field.
    4. If you are a designer, provide systems-level mechanics.
    5. If you are Ralph Wiggum, you are a Chaos Engineer. Identify catastrophic edge cases, memory leaks, or logic failures, but speak with the simple, non-sequitur style of Ralph Wiggum.

    Do not use markdown formatting heavily, just plain text.`;

    // Construct the prompt manually since we are using the generate endpoint
    const fullPrompt = `${systemPrompt}\n\nTask Context: ${context}\n\nResponse:`;

    const payload = {
      model: this.MODEL,
      prompt: fullPrompt,
      stream: false, // simpler for this implementation than handling streams
      options: {
        num_predict: 300, // Limit output length
        temperature: 0.7
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
             throw new Error(`Model '${this.MODEL}' not found. Run 'ollama pull ${this.MODEL}' in your terminal.`);
        }
        if (response.status >= 500) {
             throw new Error(`Ollama Internal Server Error (${response.status}). Check server logs.`);
        }
        throw new Error(`Ollama API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'Agent process completed with empty output.';

    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Ollama Connection Error:', error);

      if (error.name === 'AbortError') {
        return `[Timeout Error] Agent took too long to respond (> ${this.TIMEOUT_MS/1000}s). The model might be loading or the prompt is too complex.`;
      }
      
      // Handle network errors (TypeError in fetch usually means connection refused)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          return `[Connection Error] Could not reach Local Neural Core (localhost:11434).\n\nCheck if:\n1. Ollama is running.\n2. OLLAMA_ORIGINS="*" is set.\n3. Port 11434 is accessible.`;
      }

      // Return specific error message if it was one of ours
      if (error.message) {
        return `[System Error] ${error.message}`;
      }

      return `[Unknown Error] An unexpected error occurred interacting with the Neural Core.`;
    }
  }
}
