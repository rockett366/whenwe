import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  template: '<p>Processing Google login...</p>',
})
export class GoogleCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in'); // seconds

    if (accessToken) {
      sessionStorage.setItem('google_access_token', accessToken);

      const backendUrl = 'http://localhost:8000/users/me/google-token';
      const jwt = localStorage.getItem('access_token');

      if (jwt) {
        fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ access_token: accessToken }),
        })
          .then((res) => res.json())
          .then((data) => console.log('✅ Token saved to backend:', data))
          .catch((err) => console.error('❌ Error saving token:', err));
      }

      this.router.navigate(['/signup-form']);
    }
  }
}
