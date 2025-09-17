import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TtsService {
  private voice: SpeechSynthesisVoice | null = null;
  private rate = 1;
  private pitch = 1;
  private volume = 1;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  listVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices().filter(v => v.lang?.startsWith('es'));
  }

  getAllVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  setVoiceByName(name: string): boolean {
    const voices = this.getAllVoices();
    const voice = voices.find(v => v.name === name);
    if (voice) {
      this.voice = voice;
      localStorage.setItem('tts.voice', voice.name);
      return true;
    }
    return false;
  }

  setRate(val: number) { 
    this.rate = Math.max(0.1, Math.min(10, val));
    localStorage.setItem('tts.rate', String(this.rate));
  }

  setPitch(val: number) { 
    this.pitch = Math.max(0, Math.min(2, val));
    localStorage.setItem('tts.pitch', String(this.pitch));
  }

  setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('tts.volume', String(this.volume));
  }

  getSettings() {
    return {
      voice: this.voice,
      rate: this.rate,
      pitch: this.pitch,
      volume: this.volume,
      isInitialized: this.isInitialized
    };
  }

  init(preferredLangs = ['es-ES', 'es-419', 'es-MX', 'es-AR', 'es-CO']) {
    const setupVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      if (voices.length === 0) return;
      
      // Intentar recuperar voz guardada
      const savedVoiceName = localStorage.getItem('tts.voice');
      if (savedVoiceName) {
        const savedVoice = voices.find(v => v.name === savedVoiceName);
        if (savedVoice) {
          this.voice = savedVoice;
        }
      }

      // Si no hay voz guardada o no se encontró, buscar la mejor opción
      if (!this.voice) {
        // Priorizar voces en español según preferencias
        for (const lang of preferredLangs) {
          const preferredVoice = voices.find(v => v.lang === lang);
          if (preferredVoice) {
            this.voice = preferredVoice;
            break;
          }
        }

        // Si no se encontró ninguna preferida, usar cualquier voz en español
        if (!this.voice) {
          this.voice = voices.find(v => v.lang?.startsWith('es')) || null;
        }

        // Guardar la voz seleccionada
        if (this.voice) {
          localStorage.setItem('tts.voice', this.voice.name);
        }
      }

      // Cargar configuraciones guardadas
      const savedRate = localStorage.getItem('tts.rate');
      if (savedRate) this.rate = Number(savedRate);

      const savedPitch = localStorage.getItem('tts.pitch');
      if (savedPitch) this.pitch = Number(savedPitch);

      const savedVolume = localStorage.getItem('tts.volume');
      if (savedVolume) this.volume = Number(savedVolume);

      this.isInitialized = true;
    };

    // Configurar inmediatamente si las voces ya están cargadas
    setupVoices();

    // También configurar cuando las voces se carguen (para algunos navegadores)
    if (!this.isInitialized) {
      speechSynthesis.onvoiceschanged = setupVoices;
    }
  }

  speak(text: string, options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: SpeechSynthesisErrorEvent) => void;
    onPause?: () => void;
    onResume?: () => void;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancelar cualquier síntesis anterior
      speechSynthesis.cancel();

      if (!text.trim()) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurar voz
      if (this.voice) {
        utterance.voice = this.voice;
        utterance.lang = this.voice.lang || 'es-ES';
      } else {
        utterance.lang = 'es-ES';
      }

      // Configurar parámetros
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = this.volume;

      // Configurar callbacks
      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (error) => {
        options?.onError?.(error);
        reject(error);
      };

      utterance.onpause = () => {
        options?.onPause?.();
      };

      utterance.onresume = () => {
        options?.onResume?.();
      };

      // Iniciar síntesis
      speechSynthesis.speak(utterance);
    });
  }

  speakWithMotivation(text: string, exerciseType: string = ''): Promise<void> {
    // Agregar elementos motivacionales según el contexto
    const motivationalPrefixes = [
      '¡Vamos!', '¡Perfecto!', '¡Excelente!', '¡Dale que puedes!', 
      '¡Mantén el ritmo!', '¡Así se hace!', '¡Sigue así!'
    ];

    const motivationalSuffixes = [
      '¡Tú puedes!', '¡No pares!', '¡Sigue fuerte!', '¡Excelente trabajo!',
      '¡Vamos por más!', '¡Así se entrena!', '¡Increíble!'
    ];

    // Solo agregar motivación ocasionalmente para no saturar
    const shouldAddMotivation = Math.random() > 0.7;
    
    if (shouldAddMotivation) {
      const prefix = motivationalPrefixes[Math.floor(Math.random() * motivationalPrefixes.length)];
      const suffix = motivationalSuffixes[Math.floor(Math.random() * motivationalSuffixes.length)];
      text = `${prefix} ${text} ${suffix}`;
    }

    return this.speak(text);
  }

  pause() {
    speechSynthesis.pause();
  }

  resume() {
    speechSynthesis.resume();
  }

  stop() {
    speechSynthesis.cancel();
  }

  isPaused(): boolean {
    return speechSynthesis.paused;
  }

  isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }

  // Utilidad para probar una voz
  testVoice(voiceName: string, testText = 'Hola, esta es una prueba de voz.'): Promise<void> {
    const originalVoice = this.voice;
    
    return new Promise((resolve, reject) => {
      if (this.setVoiceByName(voiceName)) {
        this.speak(testText)
          .then(() => {
            this.voice = originalVoice; // Restaurar voz original
            resolve();
          })
          .catch((error) => {
            this.voice = originalVoice; // Restaurar voz original
            reject(error);
          });
      } else {
        reject(new Error('Voz no encontrada'));
      }
    });
  }

  // Obtener información de compatibilidad
  getCompatibilityInfo() {
    return {
      speechSynthesisSupported: 'speechSynthesis' in window,
      voicesAvailable: speechSynthesis.getVoices().length > 0,
      totalVoices: speechSynthesis.getVoices().length,
      spanishVoices: this.listVoices().length,
      currentVoice: this.voice?.name || 'Ninguna',
      currentLang: this.voice?.lang || 'es-ES'
    };
  }
}