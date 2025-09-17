import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PROMPTS, ExerciseKey, Exercise } from '../../data/prompts';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {
  ejercicioKey: ExerciseKey = 'jalon-al-pecho';
  perfil = 1;
  serieIndex = 0;
  started = false;
  prompts: readonly string[] = [];

  // Lista de ejercicios disponibles
  ejercicios: { key: ExerciseKey; data: Exercise }[] = [];

  // Controles de voz mejorados
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice = '';
  rate = 1;
  pitch = 1;

  ngOnInit() {
    console.log('Iniciando componente...');
    this.loadExercises();
    this.updatePrompts();
    this.initTTS();
    
    console.log('Ejercicios cargados:', this.ejercicios.length);
    console.log('Ejercicio actual:', this.currentExercise);
    console.log('Prompts para perfil', this.perfil + ':', this.prompts);
  }

  // ====== Gestión de ejercicios ======
  loadExercises() {
    try {
      this.ejercicios = Object.entries(PROMPTS).map(([key, data]) => ({
        key: key as ExerciseKey,
        data: data as Exercise
      }));
      console.log('Ejercicios procesados:', this.ejercicios.map(e => e.data.name));
    } catch (error) {
      console.error('Error cargando ejercicios:', error);
    }
  }

  get currentExercise(): Exercise | null {
    try {
      const exercise = PROMPTS[this.ejercicioKey] as Exercise;
      return exercise || null;
    } catch (error) {
      console.error('Error obteniendo ejercicio actual:', error);
      return null;
    }
  }

  cambiarEjercicio(newKey: ExerciseKey) {
    console.log('Cambiando ejercicio a:', newKey);
    this.ejercicioKey = newKey;
    this.updatePrompts();
    this.serieIndex = 0;
    this.started = false;
    
    const exercise = this.currentExercise;
    if (exercise) {
      console.log('Nuevo ejercicio:', exercise.name);
      this.speak(`Cambiando a ${exercise.name}. ${exercise.description}`);
    }
  }

  // ====== Mensajes ======
  updatePrompts() {
    try {
      const exercise = PROMPTS[this.ejercicioKey] as any;
      this.prompts = exercise?.[this.perfil] ?? [];
      console.log(`Prompts actualizados para ${this.ejercicioKey}, perfil ${this.perfil}:`, this.prompts.length, 'mensajes');
      console.log('Mensajes:', this.prompts);
    } catch (error) {
      console.error('Error actualizando prompts:', error);
      this.prompts = [];
    }
  }

  get mensajeActual() { 
    const mensaje = this.prompts[this.serieIndex] ?? 'No hay mensaje disponible';
    console.log('Mensaje actual (serie', this.serieIndex + 1 + '):', mensaje);
    return mensaje;
  }

  empezar() {
    console.log('Empezando entrenamiento...');
    this.started = true;
    this.serieIndex = 0;
    
    const exercise = this.currentExercise;
    const introMessage = exercise 
      ? `Comenzando ${exercise.name}. ${this.mensajeActual}`
      : this.mensajeActual;
    
    this.speak(introMessage);
  }

  siguienteSerie() {
    if (this.serieIndex < this.prompts.length - 1) {
      this.serieIndex++;
      this.speak(this.mensajeActual);
    } else {
      const exercise = this.currentExercise;
      const completionMessage = exercise
        ? `¡Entrenamiento de ${exercise.name} completado! Excelente trabajo.`
        : 'Entrenamiento completado. ¡Buen trabajo!';
      
      this.speak(completionMessage);
      this.started = false;
      this.serieIndex = 0;
    }
  }

  // Función para reiniciar
  reiniciar() {
    this.serieIndex = 0;
    this.started = false;
    
    const exercise = this.currentExercise;
    const message = exercise
      ? `Reiniciando ${exercise.name}. Listo para empezar de nuevo.`
      : 'Reiniciado. Listo para empezar de nuevo.';
    
    this.speak(message);
  }

  // Función para saltar a una serie específica
  irASerie(index: number) {
    if (index >= 0 && index < this.prompts.length) {
      this.serieIndex = index;
      if (this.started) {
        this.speak(`Serie ${index + 1}: ${this.mensajeActual}`);
      }
    }
  }

  onPerfilChange() {
    console.log('Cambiando perfil de', this.perfil - 1, 'a', this.perfil);
    this.updatePrompts();
    this.serieIndex = 0;
    
    const profileNames = {
      1: 'principiante',
      2: 'intermedio', 
      3: 'avanzado'
    };
    
    const profileName = profileNames[this.perfil as keyof typeof profileNames];
    const message = `Perfil cambiado a ${profileName}. `;
    
    if (this.started) {
      this.speak(message + this.mensajeActual);
    } else {
      this.speak(message + 'Listo para comenzar cuando quieras.');
    }
  }

  // ====== TTS mejorado ======
  private initTTS() {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      console.log('Todas las voces disponibles:', allVoices.length);
      
      // Filtrar voces en español y priorizar las de Google
      const spanishVoices = allVoices.filter(v => 
        v.lang?.toLowerCase().startsWith('es')
      );
      
      // Priorizar voces de Google
      const googleVoices = spanishVoices.filter(v => 
        v.name.toLowerCase().includes('google')
      );
      
      // Usar voces de Google si están disponibles, sino usar todas las españolas
      this.voices = googleVoices.length > 0 ? 
        [...googleVoices, ...spanishVoices.filter(v => !v.name.toLowerCase().includes('google'))] : 
        spanishVoices.length > 0 ? spanishVoices : allVoices;

      console.log('Voces filtradas:', this.voices.map(v => `${v.name} (${v.lang})`));

      // Configurar voz por defecto
      const savedVoice = localStorage.getItem('tts.voice');
      if (savedVoice && this.voices.find(v => v.name === savedVoice)) {
        this.selectedVoice = savedVoice;
        console.log('Voz cargada desde localStorage:', savedVoice);
      } else if (this.voices.length > 0) {
        // Priorizar Google Spanish si está disponible
        const googleSpanish = this.voices.find(v => 
          v.name.toLowerCase().includes('google') && 
          v.lang.toLowerCase().includes('es')
        );
        
        this.selectedVoice = googleSpanish ? googleSpanish.name : this.voices[0].name;
        console.log('Voz por defecto seleccionada:', this.selectedVoice);
      }

      // Cargar configuraciones guardadas
      const savedRate = localStorage.getItem('tts.rate');
      if (savedRate) {
        this.rate = Number(savedRate);
        console.log('Velocidad cargada:', this.rate);
      }
      
      const savedPitch = localStorage.getItem('tts.pitch');
      if (savedPitch) {
        this.pitch = Number(savedPitch);
        console.log('Tono cargado:', this.pitch);
      }
    };

    // Cargar voces inmediatamente si están disponibles
    loadVoices();
    
    // También escuchar el evento onvoiceschanged para navegadores que cargan voces de forma asíncrona
    speechSynthesis.onvoiceschanged = loadVoices;
    
    // Timeout de seguridad para asegurar que las voces se cargan
    setTimeout(() => {
      if (this.voices.length === 0) {
        console.warn('No se pudieron cargar las voces, reintentando...');
        loadVoices();
      }
    }, 1000);
  }

  onVoiceChange() {
    console.log('Voz cambiada a:', this.selectedVoice);
    localStorage.setItem('tts.voice', this.selectedVoice);
    
    // Test de la nueva voz
    if (this.started) {
      this.speak("Voz cambiada. " + this.mensajeActual);
    } else {
      this.speak("Voz configurada correctamente.");
    }
  }

  onRateChange(val: number) {
    this.rate = val;
    localStorage.setItem('tts.rate', String(val));
    console.log('Velocidad cambiada a:', this.rate);
    
    if (this.started) {
      this.speak("Nueva velocidad configurada.");
    }
  }

  onPitchChange(val: number) {
    this.pitch = val;
    localStorage.setItem('tts.pitch', String(val));
    console.log('Tono cambiado a:', this.pitch);
    
    if (this.started) {
      this.speak("Nuevo tono configurado.");
    }
  }

  public speak(text: string) {
    try {
      // Cancelar cualquier síntesis anterior
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurar la voz seleccionada
      const voice = this.voices.find(v => v.name === this.selectedVoice);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'es-ES';
        console.log('Usando voz:', voice.name, '(' + voice.lang + ')');
      } else {
        utterance.lang = 'es-ES';
        console.log('Usando voz por defecto del sistema');
      }

      // Configurar parámetros
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = 1;

      // Callbacks para debug
      utterance.onstart = () => {
        console.log('Comenzando síntesis de:', text);
      };

      utterance.onend = () => {
        console.log('Síntesis completada');
      };

      utterance.onerror = (error) => {
        console.error('Error en síntesis de voz:', error);
      };

      // Iniciar síntesis
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error en función speak:', error);
    }
  }

  // ====== Utilidades ======
  get progressPercentage() {
    if (this.prompts.length === 0) return 0;
    return ((this.serieIndex + (this.started ? 1 : 0)) / this.prompts.length) * 100;
  }

  getProfileName(profile: number): string {
    const names = {
      1: 'Principiante',
      2: 'Intermedio',
      3: 'Avanzado'
    };
    return names[profile as keyof typeof names] || 'Desconocido';
  }
}