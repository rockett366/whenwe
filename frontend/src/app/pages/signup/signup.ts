import { Component } from '@angular/core';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-signup',
  imports: [MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  constructor(private http: HttpClient, private router: Router) {}

  username: string = '';
  password: string = '';
  email: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';

  submitSignup() {
    const payload = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      username: this.username,
      password: this.password,
    };

    this.http.post<any>('http://localhost:8000/auth/signup', payload).subscribe({
      next: (res) => {
        console.log('Signed Up:', res);
        localStorage.setItem('access_token', res.access_token);
        this.router.navigate(['/connect']);
      },
      error: (err) => console.error('Signup error:', err),
    });
  }
}
