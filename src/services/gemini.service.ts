
import { Injectable } from '@angular/core';

// Service deprecated in favor of local OllamaService.
// Kept as a shell to avoid breaking existing file references if any remain cached, 
// but functionally disabled.

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  constructor() {}
  async promptAgent(role: string, specialization: string, context: string): Promise<string> {
    return "Gemini Service is disabled. Please use OllamaService.";
  }
}
