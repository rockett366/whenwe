<<<<<<< HEAD
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ add this
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
=======
import { Component, AfterViewInit } from '@angular/core';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
>>>>>>> tobey_branch

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule], // ✅ add CommonModule here
  templateUrl: './login.html',
  styleUrl: './login.css',
})
<<<<<<< HEAD
export class Login {
  email: string = '';
=======
export class Login implements AfterViewInit {
  username: string = '';
>>>>>>> tobey_branch
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

<<<<<<< HEAD
  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.http
      .post<any>('http://127.0.0.1:8000/auth/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.access_token);
          console.log('✅ Logged in successfully');
          this.router.navigate(['/signup']); // or '/signup'
        },
        error: (err) => {
          console.error('❌ Login failed:', err);
          this.errorMessage = err.error?.detail || 'Invalid email or password';
        },
      });
=======
  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '865258892929-bc8naucktsurjnokm21clsgnirb5t2ij.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });
    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large', 'width': '100%' }
    );
  }

  handleCredentialResponse(response: any) {
    console.log('Google JWT Token: ' + response.credential);
    // Handle the response, e.g., send it to your backend for verification
>>>>>>> tobey_branch
  }
}
