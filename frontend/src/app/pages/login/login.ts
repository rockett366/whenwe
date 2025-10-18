import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '865258892929-bc8naucktsurjnokm21clsgnirb5t2ij.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
    });
    google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
      theme: 'outline',
      size: 'large',
      width: '100%',
    });
  }

  handleCredentialResponse(response: any) {
    console.log('Google JWT Token: ' + response.credential);
  }

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    const payload = {
      email: this.email.toLowerCase(),
      password: this.password,
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post('http://localhost:8000/auth/login', payload, { headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Login successful:', res);

        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          console.log('Token saved:', res.access_token);
        }

        this.router.navigate(['/user_dashboard']);
      },
      error: (err) => {
        console.error('❌ Login failed:', err);
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      },
    });
  }
}
