
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioStateService } from '../services/studio-state.service';

@Component({
  selector: 'app-console-log',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-[#050505] rounded-xl border border-white/10 overflow-hidden">
      <div class="px-4 py-2 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <span class="text-xs font-mono text-gray-400">TERMINAL OUTPUT</span>
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-2 mono text-xs">
        @for (log of state.logs(); track log.timestamp) {
          <div class="flex gap-2">
            <span class="text-gray-600">[{{log.timestamp}}]</span>
            <span [class]="sourceColor(log.source)">{{log.source}}:</span>
            <span [class]="typeColor(log.type)" class="break-words flex-1">{{log.message}}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class ConsoleLogComponent {
  state = inject(StudioStateService);

  sourceColor(source: string) {
    switch (source) {
      case 'System': return 'text-purple-400';
      case 'Nexus': return 'text-indigo-400';
      case 'Vanguard': return 'text-orange-400';
      case 'Vector': return 'text-blue-500';
      case 'Pixel': return 'text-pink-400';
      case 'Cipher': return 'text-emerald-400';
      case 'Ralph': return 'text-yellow-500';
      // New Agents
      case 'Helix': return 'text-teal-400';
      case 'Atlas': return 'text-lime-400';
      case 'Echo': return 'text-cyan-400';
      case 'Canvas': return 'text-violet-400';
      case 'Fable': return 'text-amber-400';
      case 'Rig': return 'text-rose-400';
      case 'Bugsy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  }

  typeColor(type: string) {
    if (type === 'error') return 'text-red-400';
    if (type === 'success') return 'text-green-400';
    if (type === 'warning') return 'text-yellow-400';
    return 'text-gray-300';
  }
}
