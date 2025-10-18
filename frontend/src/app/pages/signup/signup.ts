import { Component } from '@angular/core';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';

declare const google: any;

@Component({
  selector: 'app-signup',
  imports: [MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup{
  username: string = '';
  password: string = ''
  email: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';

  redirectToGoogleAuth() {
    const clientId = '865258892929-bc8naucktsurjnokm21clsgnirb5t2ij.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent('http://localhost:4200/google-callback');
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent&include_granted_scopes=true`;

    window.location.href = authUrl;
  }
}

