import { Component } from '@angular/core';
import { WorkoutComponent } from './components/workout/workout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorkoutComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
