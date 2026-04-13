import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  public toasts$ = this.toasts.asReadonly();

  private toastCounter = 0;
  private DEFAULT_DURATION = 5000;
  private destroyRef = inject(DestroyRef);

  success(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show('success', message, duration);
  }

  error(message: string, duration: number = 0): void {
    this.show('error', message, duration);
  }


  warning(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show('info', message, duration);
  }

  private show(type: Toast['type'], message: string, duration: number): void {
    const id = `toast-${++this.toastCounter}`;
    const toast: Toast = { id, type, message, duration };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      timer(duration)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.remove(id);
        });
    }
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
