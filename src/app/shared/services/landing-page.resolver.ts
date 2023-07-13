import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes } from '@angular/router';
import { Observable } from 'rxjs';
import { WelcomeComponent } from './welcome/welcome.component';

@Injectable({ providedIn: 'root' })
export class LandingPageResolver implements Resolve<string> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> | Promise<string> | string {
    // Perform any necessary actions
    
    // Return the desired route
    return '/welcome';
  }
}
