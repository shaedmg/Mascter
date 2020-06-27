import { GeolocationService } from './../services/geolocation.service';
import { AuthService } from './../services/auth.service';
import { PetProvider } from './../providers/pet.provider';
import { Plugins } from '@capacitor/core';
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
    private router: Router,
    private petProvider: PetProvider,
    private authService: AuthService,
    private geolocationService: GeolocationService
  ) { }
  canActivateChild(): Observable<boolean> {
    console.log("CanActivateChild");
    
    return this.auth.authState.pipe(
      take(1),
      map((authState) => !!authState),
      tap(authenticated => {
        console.log(authenticated);
        
        if (!authenticated) this.router.navigate(['login']);
        else {
          this.authService.getCurrentUserUid().then(res => {
            this.petProvider.getDataById(res).pipe(take(1)).toPromise().then(pet => {
              if ( pet.ubication && !this.geolocationService.getTrackingState()) {
                this.geolocationService.startTrackingLocation();
              }
            })
          })
        }
      }));
  }

}