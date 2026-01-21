
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { OllamaService } from './ollama.service';
import { RealtimeService } from './realtime.service';

export interface Agent {
  id: string;
  name: string;
  role: 'Orchestrator' | 'Producer' | 'Market Analyst' | 'Data Scientist' | 'Engineer' | 'Artist' | 'QA' | 'Ralph Wiggum' | 'Level Designer' | 'Sound Engineer' | 'UI/UX' | 'Narrative' | 'Animator';
  specialization: string;
  status: 'Idle' | 'Thinking' | 'Working' | 'Error';
  currentTask: string;
  avatarColor: string;
}

export interface LogEntry {
  timestamp: string;
  source: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface MetricPoint {
  time: number;
  codeGen: number;
  assets: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudioStateService {
  private ai = inject(OllamaService);
  private realtime = inject(RealtimeService);

  // --- Project Phases ---
  readonly projectPhase = signal<'Market Validation' | 'Team Assembly' | 'Parallel Dev' | 'Optimization' | 'Launch'>('Market Validation');

  // --- Agents (Expanded to 13) ---
  readonly agents = signal<Agent[]>([
    { id: 'm1', name: 'Nexus', role: 'Orchestrator', specialization: 'Systems Architecture', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-indigo-600' },
    { id: 'p1', name: 'Vanguard', role: 'Producer', specialization: 'Agile & Milestone Mgmt', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-orange-600' },
    { id: 'e1', name: 'Vector', role: 'Engineer', specialization: 'Graphics Pipeline & Shaders', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-blue-600' },
    { id: 'a1', name: 'Pixel', role: 'Artist', specialization: 'Concept & Color Theory', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-pink-600' },
    { id: 'ma1', name: 'Cipher', role: 'Market Analyst', specialization: 'Retention Mechanics', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-emerald-600' },
    { id: 'ds1', name: 'Helix', role: 'Data Scientist', specialization: 'Telemetry & Economy Balancing', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-teal-600' },
    { id: 'ld1', name: 'Atlas', role: 'Level Designer', specialization: 'Spatial Flow & Pacing', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-lime-600' },
    { id: 'se1', name: 'Echo', role: 'Sound Engineer', specialization: 'Adaptive Audio Systems', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-cyan-600' },
    { id: 'ui1', name: 'Canvas', role: 'UI/UX', specialization: 'Diegetic Interface Design', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-violet-600' },
    { id: 'nd1', name: 'Fable', role: 'Narrative', specialization: 'Branching Dialogue Trees', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-amber-600' },
    { id: 'an1', name: 'Rig', role: 'Animator', specialization: 'Procedural Animation', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-rose-600' },
    { id: 'qa1', name: 'Bugsy', role: 'QA', specialization: 'Automated Regression Testing', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-red-600' },
    { id: 'rw1', name: 'Ralph', role: 'Ralph Wiggum', specialization: 'Chaos Engineering', status: 'Idle', currentTask: 'Standby', avatarColor: 'bg-yellow-500' },
  ]);

  readonly logs = signal<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), source: 'System', message: 'Day Zero: Studio initialized. Local Neural Core (Ollama) standby.', type: 'info' }
  ]);

  readonly metrics = signal({
    codeGen: 1240,
    assetsBuilt: 45,
    bugRatio: 2.4,
    computeLoad: 35
  });

  // Historical data for charts (last 20 points)
  readonly history = signal<MetricPoint[]>(this.generateInitialHistory());

  // Updated prompts for full AA game creation
  readonly suggestedPrompts = signal<string[]>([
    "Create a Soulslike set in a dying brutalist megastructure where the currency is memories.",
    "Build a cozy farming simulator combined with a competitive tower defense mechanic.",
    "Develop a high-fidelity cyberpunk extraction shooter with a player-driven economy.",
    "Generate a AA horror game about a recursive office building that learns from player fear.",
    "Make an open-world racing game where the cars are powered by music synthesis."
  ]);

  readonly activeView = signal<'Dashboard' | 'Code' | 'Assets' | 'Settings'>('Dashboard');
  readonly projectProgress = signal(0); // Day Zero: 0% Progress

  // Computed
  readonly activeAgentsCount = computed(() => this.agents().filter(a => a.status !== 'Idle').length);
  readonly connectionState = this.realtime.status;

  constructor() {
    // React to connection status
    effect(() => {
      if (this.realtime.status() === 'connected') {
        this.addLog('Realtime', 'Connected to Subagent Backend.', 'success');
      } else if (this.realtime.status() === 'disconnected') {
        // Silent or single log, no simulation loop
      }
    });

    // Subscribe to incoming realtime messages
    this.realtime.messages$.subscribe(msg => {
      this.handleRealtimeMessage(msg);
    });

    // Simulate metrics updates
    setInterval(() => this.simulateMetrics(), 3000);
  }

  private generateInitialHistory(): MetricPoint[] {
    const data: MetricPoint[] = [];
    const now = Date.now();
    for (let i = 20; i > 0; i--) {
      data.push({
        time: now - i * 3000,
        codeGen: 1000 + Math.random() * 200,
        assets: 30 + Math.random() * 10
      });
    }
    return data;
  }

  private simulateMetrics() {
    this.metrics.update(m => {
      // Random walk
      const newCode = m.codeGen + Math.floor(Math.random() * 50) - 10;
      const newAssets = m.assetsBuilt + (Math.random() > 0.7 ? 1 : 0);
      const newLoad = Math.min(100, Math.max(10, m.computeLoad + Math.floor(Math.random() * 10) - 5));
      
      const newMetrics = {
        codeGen: newCode,
        assetsBuilt: newAssets,
        bugRatio: Math.max(0, m.bugRatio + (Math.random() * 0.2 - 0.1)),
        computeLoad: newLoad
      };

      // Update history
      this.history.update(h => {
        const newHistory = [...h, { time: Date.now(), codeGen: newCode, assets: newAssets }];
        return newHistory.length > 20 ? newHistory.slice(newHistory.length - 20) : newHistory;
      });

      return newMetrics;
    });
  }

  addLog(source: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    this.logs.update(logs => [
      { timestamp: new Date().toLocaleTimeString(), source, message, type },
      ...logs.slice(0, 99)
    ]);
  }

  async triggerAgentTask(agentId: string, customPrompt?: string) {
    const agent = this.agents().find(a => a.id === agentId);
    if (!agent || agent.status === 'Working') return;

    this.updateAgentStatus(agentId, 'Thinking', 'Processing request...');

    // Contexts specific to new roles
    const contexts: Record<string, string> = {
      'Orchestrator': 'Deconstruct the user prompt into a full AA game design document, listing key pillars and technical requirements.',
      'Producer': 'Create a high-level roadmap and resource allocation plan for this AA title.',
      'Market Analyst': 'Analyze the commercial viability of this game concept against current Steam charts.',
      'Data Scientist': 'Predict player retention curves based on the proposed core loop.',
      'Engineer': 'Architect the core engine systems required to support this game type (e.g., netcode, physics).',
      'Artist': 'Define the art direction, color palette, and key visual benchmarks for the game.',
      'QA': 'Identify critical path risks and edge cases in the proposed design.',
      'Ralph Wiggum': 'Execute Chaos Engineering protocol: Identify a catastrophic failure mode in the current design (e.g., infinite loops, memory leaks, or physics explosions) and describe it with your unique perspective.',
      'Level Designer': 'Draft a blockout of the main level, emphasizing verticality and player flow.',
      'Sound Engineer': 'Outline the adaptive audio requirements and list key foley assets for player movement.',
      'UI/UX': 'Design the wireframes for the HUD and main menu system, focusing on user accessibility.',
      'Narrative': 'Write character bios and a synopsis of the main plot conflict.',
      'Animator': 'Define the animation state machine (Locomotion, Combat, Interaction) for the protagonist.'
    };

    // If a custom prompt (full game idea) is passed, we prepend it to the context
    let context = customPrompt 
      ? `The user wants to build this game: "${customPrompt}". \n\n Task: ${contexts[agent.role]}`
      : contexts[agent.role] || 'Do your job.';

    try {
      // Pass specialization to the AI service
      const result = await this.ai.promptAgent(agent.role, agent.specialization, context);
      
      this.updateAgentStatus(agentId, 'Working', 'Executing output...');
      
      // We keep a small delay just to allow the 'Working' state to be visible for a moment before 'Idle'
      setTimeout(() => {
        this.addLog(agent.name, result, 'success');
        this.updateAgentStatus(agentId, 'Idle', 'Task complete');
      }, 500);

    } catch (e) {
      this.updateAgentStatus(agentId, 'Error', 'Task failed');
      this.addLog(agent.name, 'Failed to connect to Local Neural Core.', 'error');
    }
  }

  private updateAgentStatus(id: string, status: Agent['status'], task: string) {
    this.agents.update(agents => agents.map(a => 
      a.id === id ? { ...a, status, currentTask: task } : a
    ));
  }

  private handleRealtimeMessage(msg: any) {
    // Handle actual websocket messages here
    if (msg.type === 'METRICS_UPDATE') {
      this.metrics.set(msg.payload);
    }
    if (msg.type === 'AGENT_UPDATE') {
      this.updateAgentStatus(msg.agentId, msg.status, msg.task);
    }
  }
}
