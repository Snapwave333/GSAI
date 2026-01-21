
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="computedClass()"
      [disabled]="disabled()"
      (click)="clicked.emit($event)">
      <ng-content></ng-content>
    </button>
  `
})
export class UiButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);
  fullWidth = input(false);
  
  clicked = output<MouseEvent>();

  computedClass() {
    const base = 'inline-flex items-center justify-center font-bold tracking-wider rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';
    
    let variantClass = '';
    switch (this.variant()) {
      case 'primary': variantClass = 'bg-white text-black hover:bg-gray-200 focus:ring-white'; break;
      case 'secondary': variantClass = 'bg-white/10 text-white hover:bg-white/20 focus:ring-gray-500'; break;
      case 'outline': variantClass = 'border border-white/20 text-gray-300 hover:text-white hover:border-white/40 focus:ring-gray-500'; break;
      case 'ghost': variantClass = 'text-gray-400 hover:text-white hover:bg-white/5'; break;
      case 'danger': variantClass = 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'; break;
    }

    let sizeClass = '';
    switch (this.size()) {
      case 'sm': sizeClass = 'px-3 py-1.5 text-xs'; break;
      case 'md': sizeClass = 'px-4 py-2 text-xs uppercase'; break;
      case 'lg': sizeClass = 'px-6 py-3 text-sm'; break;
    }

    return `${base} ${variantClass} ${sizeClass} ${this.fullWidth() ? 'w-full' : ''}`;
  }
}
