import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivateChild {
  constructor(
    private auth: AngularFireAuth,
    private router: Router
  ) { }
  canActivateChild(): Observable<boolean> {
    console.log("CanActivateChild");
    
    return this.auth.authState.pipe(
      take(1),
      map((authState) => !!authState),
      tap(authenticated => {
        console.log(authenticated);
        
        if (!authenticated) this.router.navigate(['login']);
      }));
  }

}