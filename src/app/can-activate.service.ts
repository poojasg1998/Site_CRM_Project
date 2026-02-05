  import { Injectable } from '@angular/core';
  import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
  import { AuthServiceService } from './auth-service.service';

   @Injectable({
     providedIn: 'root'
   })

    export class CanActivateGuard implements CanActivate {
      constructor(private router: Router, private authService: AuthServiceService) {}
      canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (this.authService.isAuthenticated()) {
        // User is logged in, allow navigation
        return true;
      } else {
        // User is not logged in, redirect to login
        this.router.navigate(['/']);
        return false;
      }
    }
  }