import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  constructor(private ngZone: NgZone) {}

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Lance l'écoute et émet une seule transcription (finale), puis complete.
   * En cas d'erreur (non supporté, permission refusée, etc.), émet error.
   */
  listen(options?: {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    debug?: boolean;
  }): Observable<string> {
    return new Observable<string>((subscriber) => {
      if (!this.isSupported()) {
        subscriber.error(new Error('Speech recognition not supported by this browser.'));
        return;
      }

      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new Ctor();

      const debug = options?.debug ?? false;
      const log = (...args: unknown[]) => {
        if (!debug) return;
        // eslint-disable-next-line no-console
        console.debug('[SpeechRecognition]', ...args);
      };

      recognition.continuous = options?.continuous ?? false;
      recognition.interimResults = options?.interimResults ?? false;
      recognition.maxAlternatives = 1;
      recognition.lang =
        options?.lang ?? ((typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'fr-FR');

      let settled = false;

      const settleNextComplete = (text: string) => {
        this.ngZone.run(() => {
          if (settled) return;
          settled = true;
          subscriber.next(text);
          subscriber.complete();
        });
      };

      const settleError = (err: unknown) => {
        this.ngZone.run(() => {
          if (settled) return;
          settled = true;

          // WebSpeech errors often come as events: { error: 'no-speech' | 'not-allowed' | ... }
          const any = err as any;
          const message =
            typeof err === 'string'
              ? err
              : any?.message || any?.error || any?.name || 'Speech recognition error';

          subscriber.error(Object.assign(new Error(String(message)), { raw: err }));
        });
      };

      // Diagnostics hooks (useful for no-speech/audio-capture issues)
      recognition.onstart = () => log('onstart');
      recognition.onaudiostart = () => log('onaudiostart');
      recognition.onsoundstart = () => log('onsoundstart');
      recognition.onspeechstart = () => log('onspeechstart');
      recognition.onspeechend = () => log('onspeechend');
      recognition.onsoundend = () => log('onsoundend');
      recognition.onaudioend = () => log('onaudioend');

      recognition.onresult = (event: any) => {
        try {
          log('onresult', event);
          const first = event?.results?.[0]?.[0];
          const transcript = (first?.transcript ?? '').toString().trim();
          if (transcript) {
            settleNextComplete(transcript);
          }
        } catch (e) {
          settleError(e);
        }
      };

      recognition.onerror = (event: any) => {
        // event.error: 'not-allowed' | 'no-speech' | 'audio-capture' | ...
        log('onerror', event);
        settleError(event);
      };

      recognition.onend = () => {
        log('onend');
        // Si rien n'a été reconnu, on termine simplement.
        this.ngZone.run(() => {
          if (settled) return;
          settled = true;
          subscriber.complete();
        });
      };

      try {
        recognition.start();
      } catch (e) {
        settleError(e);
      }

      return () => {
        try {
          recognition.abort();
        } catch {
          // ignore
        }
      };
    });
  }
}
