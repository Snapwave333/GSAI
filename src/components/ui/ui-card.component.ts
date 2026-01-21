
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-[#111] border border-white/5 rounded-xl p-4 h-full relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col"
      [class]="customClass">
      <ng-content></ng-content>
    </div>
  `
})
export class UiCardComponent {
  @Input() customClass: string = '';
}
