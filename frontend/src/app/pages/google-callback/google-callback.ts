import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  template: '<p>Processing Google login...</p>'
})
export class GoogleCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Get the hash fragment from the URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');

    console.log('Google ID Token:', idToken);
    console.log('Access Token (Calendar):', accessToken);

    // TODO: Send tokens to your backend to create account / store token

    // Redirect user to home page or dashboard
    this.router.navigate(['/']);
  }
}
