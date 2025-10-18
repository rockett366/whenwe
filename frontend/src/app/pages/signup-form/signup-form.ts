import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, MatButtonModule, FormsModule],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.css'
})
export class SignupForm {
  friends: number | null = null;
  family: number | null = null;
  school: number | null = null;
  work: number | null = null;
  self: number | null = null;

  numbers = [1, 2, 3, 4, 5];

  submitPriorities() {
    const userPriorities = {
      friends: this.friends,
      family: this.family,
      school: this.school,
      work: this.work,
      self: this.self
    };
    console.log('User priorities:', userPriorities);

    // TODO: send to backend or navigate to dashboard
  }


}
