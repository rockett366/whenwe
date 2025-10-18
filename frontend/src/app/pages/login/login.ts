import { Component, AfterViewInit } from '@angular/core';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule], // ✅ add CommonModule here
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';


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
  }
}
