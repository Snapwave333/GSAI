
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Agent, StudioStateService } from '../services/studio-state.service';
import { UiCardComponent } from './ui/ui-card.component';
import { UiButtonComponent } from './ui/ui-button.component';
import { UiBadgeComponent } from './ui/ui-badge.component';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent, UiBadgeComponent],
  template: `
    <app-ui-card>
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <div [class]="'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ' + agent().avatarColor">
            {{ agent().name.charAt(0) }}
          </div>
          <div>
            <h3 class="font-bold text-gray-200 leading-tight">{{ agent().name }}</h3>
            <div class="flex flex-col">
              <span class="text-[10px] text-blue-400 font-mono uppercase tracking-tight">{{ agent().role }}</span>
              <span class="text-[10px] text-gray-500 italic">{{ agent().specialization }}</span>
            </div>
          </div>
        </div>
        <app-ui-badge [variant]="badgeVariant()">
          {{ agent().status }}
        </app-ui-badge>
      </div>

      <div class="mb-4 flex-1">
        <p class="text-[10px] text-gray-500 mb-1 font-mono uppercase">CURRENT OPS</p>
        <div class="text-sm text-gray-300 font-mono bg-black/30 p-2 rounded border border-white/5 truncate relative overflow-hidden group/text">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#161616] group-hover/text:hidden"></div>
          {{ agent().currentTask }}
        </div>
      </div>

      <app-ui-button 
        variant="secondary" 
        size="md" 
        [fullWidth]="true"
        [disabled]="agent().status !== 'Idle'"
        (clicked)="triggerTask()">
        @if (agent().status === 'Thinking' || agent().status === 'Working') {
          <span class="flex items-center gap-2"><span class="animate-spin">⏳</span> Processing</span>
        } @else {
          <span class="flex items-center gap-2"><span>⚡</span> Assign Task</span>
        }
      </app-ui-button>
    </app-ui-card>
  `
})
export class AgentCardComponent {
  agent = input.required<Agent>();
  state = inject(StudioStateService);

  badgeVariant() {
    switch (this.agent().status) {
      case 'Idle': return 'default';
      case 'Thinking': return 'info';
      case 'Working': return 'warning';
      case 'Error': return 'error';
      default: return 'default';
    }
  }

  triggerTask() {
    this.state.triggerAgentTask(this.agent().id);
  }
}
