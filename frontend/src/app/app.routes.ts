import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/user/dashboard/dashboard';
import { GoogleCallbackComponent } from './pages/google-callback/google-callback';


export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'google-callback', component: GoogleCallbackComponent},
  { path: 'home', component: Home },
  { path: 'user_dashboard', component: Dashboard },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'signup', component: Signup },
];
