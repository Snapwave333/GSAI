
import { Injectable, signal } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, retry, EMPTY, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private socket$: WebSocketSubject<any> | null = null;
  
  // Expose connection status signal
  readonly status = signal<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  // Subject for incoming messages
  readonly messages$ = new Subject<any>();

  constructor() {
    this.connect();
  }

  connect() {
    this.status.set('connecting');

    // In a real environment, this would point to the backend
    const WS_URL = 'wss://api.gamestudio-subagents.internal/ws';

    this.socket$ = webSocket({
      url: WS_URL,
      openObserver: {
        next: () => {
          this.status.set('connected');
          console.log('[Realtime] WebSocket connected');
        }
      },
      closeObserver: {
        next: () => {
          this.status.set('disconnected');
          console.log('[Realtime] WebSocket disconnected');
        }
      }
    });

    this.socket$.pipe(
      catchError(err => {
        // No simulation fallback. Just disconnect.
        this.status.set('disconnected');
        return EMPTY;
      })
    ).subscribe({
      next: (msg) => this.messages$.next(msg),
      error: (err) => console.error(err)
    });
  }

  send(msg: any) {
    if (this.socket$ && this.status() === 'connected') {
      this.socket$.next(msg);
    } else {
      console.warn('[Realtime] Cannot send, socket offline:', msg);
    }
  }
}
