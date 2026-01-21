
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar.component';
import { GlslViewComponent } from './components/glsl-view.component';
import { AgentCardComponent } from './components/agent-card.component';
import { ConsoleLogComponent } from './components/console-log.component';
import { PromptSuggestionsComponent } from './components/prompt-suggestions.component';
import { UiCardComponent } from './components/ui/ui-card.component';
import { UiBadgeComponent } from './components/ui/ui-badge.component';
import { MetricsChartComponent } from './components/charts/metrics-chart.component';
import { StudioStateService } from './services/studio-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    SidebarComponent, 
    GlslViewComponent, 
    AgentCardComponent, 
    ConsoleLogComponent,
    PromptSuggestionsComponent,
    UiCardComponent,
    UiBadgeComponent,
    MetricsChartComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  state = inject(StudioStateService);
}
