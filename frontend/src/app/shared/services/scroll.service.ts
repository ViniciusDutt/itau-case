import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollToElement(element: HTMLElement | null): void {
    if (element && typeof window !== 'undefined') {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollTo(top: number = 0, behavior: ScrollBehavior = 'smooth'): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top, behavior });
    }
  }
}
