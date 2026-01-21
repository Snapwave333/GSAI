
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  template: `
    <span [class]="computedClass()">
      <ng-content></ng-content>
    </span>
  `
})
export class UiBadgeComponent {
  variant = input<'default' | 'success' | 'warning' | 'error' | 'info'>('default');
  
  computedClass() {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border';
    
    switch (this.variant()) {
      case 'success': return `${base} bg-green-500/10 border-green-500/20 text-green-400`;
      case 'warning': return `${base} bg-yellow-500/10 border-yellow-500/20 text-yellow-400`;
      case 'error': return `${base} bg-red-500/10 border-red-500/20 text-red-400`;
      case 'info': return `${base} bg-blue-500/10 border-blue-500/20 text-blue-400`;
      default: return `${base} bg-gray-800 border-gray-700 text-gray-400`;
    }
  }
}
