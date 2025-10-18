import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router'; //

interface Rating{
  value: number;
  viewValue: number;
}

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [RouterLink, MatInputModule, MatSelectModule, MatFormFieldModule, MatButtonModule, FormsModule],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.css'
})
export class SignupForm {
  friends: number = 0;
  family: number = 0;
  school: number = 0;
  work: number = 0;
  self: number = 0;
  preferences: string = "";

  ratings: Rating[] = [
    {value: 1, viewValue: 1},
    {value: 2, viewValue: 2},
    {value: 3, viewValue: 3},
    {value: 4, viewValue: 4},
    {value: 5, viewValue: 5}
  ]

}
