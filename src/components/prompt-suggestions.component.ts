
import { Component, inject } from '@angular/core';
import { StudioStateService } from '../services/studio-state.service';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from './ui/ui-card.component';
import { UiButtonComponent } from './ui/ui-button.component';

@Component({
  selector: 'app-prompt-suggestions',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent],
  template: `
    <app-ui-card>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <span class="text-blue-400">⚡</span> New Game Concept
        </h3>
        <span class="text-[10px] text-gray-600 mono">ONE-SHOT GENERATION</span>
      </div>
      
      <!-- Custom Input Section -->
      <div class="flex gap-2 mb-6">
        <input #customInput
          type="text"
          class="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all font-mono"
          placeholder="Describe your dream game idea..."
          (keydown.enter)="handleSubmit(customInput)"
        />
        <app-ui-button variant="primary" size="md" (clicked)="handleSubmit(customInput)">
          INIT
        </app-ui-button>
      </div>

      <!-- Suggestions List -->
      <div class="flex flex-col gap-2">
        <div class="text-[10px] text-gray-600 uppercase font-bold tracking-wider mb-1 ml-1">Or choose a template</div>
        @for (prompt of state.suggestedPrompts(); track prompt) {
          <button 
            (click)="assignRandomAgent(prompt)"
            class="text-left w-full group px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-lg transition-all flex items-start gap-3">
            <span class="mt-1 w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors flex-shrink-0"></span>
            <span class="text-xs text-gray-300 group-hover:text-white leading-relaxed">{{ prompt }}</span>
          </button>
        }
      </div>
    </app-ui-card>
  `
})
export class PromptSuggestionsComponent {
  state = inject(StudioStateService);

  handleSubmit(input: HTMLInputElement) {
    const value = input.value.trim();
    if (!value) return;
    
    this.assignRandomAgent(value);
    input.value = '';
  }

  assignRandomAgent(prompt: string) {
    // For a full game generation, we typically want the Orchestrator to start.
    const orchestrator = this.state.agents().find(a => a.role === 'Orchestrator');
    const target = orchestrator && orchestrator.status === 'Idle' ? orchestrator : this.state.agents().find(a => a.status === 'Idle');
    
    if (target) {
      this.state.triggerAgentTask(target.id, prompt);
    } else {
      this.state.addLog('System', 'Orchestrator busy. Queuing game generation...', 'warning');
    }
  }
}
