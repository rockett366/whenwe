import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/user/dashboard/dashboard';
import { GoogleCallbackComponent } from './pages/google-callback/google-callback';
import { SignupForm } from './pages/signup-form/signup-form';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'google-callback', component: GoogleCallbackComponent},
  { path: 'home', component: Home },
  { path: 'user_dashboard', component: Dashboard },
  { path: 'signup-form', component: SignupForm },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];
