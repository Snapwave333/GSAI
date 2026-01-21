
import { Component, inject } from '@angular/core';
import { StudioStateService } from '../services/studio-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-64 h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col">
      <div class="p-6 border-b border-white/5">
        <h1 class="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          GAMESTUDIO
        </h1>
        <p class="text-xs text-gray-500 mono mt-1">SUBAGENT CONTROLLER</p>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        @for (item of menuItems; track item.label) {
          <button 
            (click)="setActive(item.label)"
            [class.bg-white-10]="state.activeView() === item.label"
            class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-200 hover:bg-white/5 text-gray-300 hover:text-white group">
            <span class="text-lg opacity-70 group-hover:opacity-100 transition-opacity">{{item.icon}}</span>
            {{item.label}}
            @if(item.badge) {
              <span class="ml-auto text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full mono">{{item.badge}}</span>
            }
          </button>
        }
      </nav>

      <div class="p-4 border-t border-white/5">
        <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
          <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500"></div>
          <div>
            <div class="text-sm font-medium text-white">Lead Dev</div>
            <div class="text-xs text-gray-500">Online</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .bg-white-10 { background-color: rgba(255,255,255,0.08); color: white; border-left: 3px solid #60a5fa; }
  `]
})
export class SidebarComponent {
  state = inject(StudioStateService);

  menuItems = [
    { label: 'Dashboard', icon: '⚡', badge: null },
    { label: 'Code', icon: '💻', badge: '12' },
    { label: 'Assets', icon: '🎨', badge: 'NEW' },
    { label: 'QA', icon: '🛡️', badge: null },
    { label: 'Analytics', icon: '📊', badge: null },
    { label: 'Settings', icon: '⚙️', badge: null }
  ];

  setActive(label: string) {
    // Cast string to union type if valid, else ignore for demo
    if (['Dashboard', 'Code', 'Assets', 'Settings'].includes(label)) {
      this.state.activeView.set(label as any);
    }
  }
}
