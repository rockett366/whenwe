import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  template: '<p>Processing Google login...</p>'
})
export class GoogleCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in'); // seconds

  if (accessToken){
    sessionStorage.setItem('google_access_token', accessToken);
    if (expiresIn) {
      const expiresAt = Date.now() + Number(expiresIn) * 1000;
      sessionStorage.setItem('google_access_token_expires_at', String(expiresAt));
    }
  }

  this.router.navigate(['/signup-form']);
}

}
