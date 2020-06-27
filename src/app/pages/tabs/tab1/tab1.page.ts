import { Plugins } from '@capacitor/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { OverlayEventDetail } from '@ionic/core';
import { StrangerProfileModalComponent } from '../../../components/stranger-profile-modal/stranger-profile-modal.component';
import { UtilsService } from './../../../services/utils.service';
import { NavController, ModalController } from '@ionic/angular';
import { PetModel } from './../../../schemes/models/pet.model';
import { PetProvider } from './../../../providers/pet.provider';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  animations: [
    trigger('ajam', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
      ])
    ])
  ]
})
export class Tab1Page {

  pets: PetModel[];
  petsSubscription: Subscription;
  pet: PetModel;
  petSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private petProvider: PetProvider,
    private navController: NavController,
    private utilsServe: UtilsService,
    private modalController: ModalController,
  ) {}

  onLogout(): void{
    this.authService.logout();
  }
  async ionViewWillEnter(){
    const currentUserUid = await  this.authService.getCurrentUserUid();
    this.pet = await this.petProvider.getDataById(currentUserUid).pipe(take(1)).toPromise();
    if ( this.pet.ubication ){
      this.petSubscription = this.petProvider.getDataById(currentUserUid).subscribe(res => {
        this.pet = res;
        if(this.pet.ubication) this.sortUsersByDistance(this.pets);
      });
      this.petsSubscription = this.petProvider.getAllData().subscribe(res => {
        this.pets = this.sortUsersByDistance(res.filter( pet => pet.id !== currentUserUid && pet.ubication));
      });
    }
  }
  ionViewWillLeave(){
    if(this.petSubscription) this.petSubscription.unsubscribe();
    if ( this.petsSubscription ) this.petsSubscription.unsubscribe();
  }

  async goToProfile(pet: PetModel){
    this.utilsServe.setDataForNavigation(pet);
    const modal = await this.modalController.create({
      component: StrangerProfileModalComponent
    });
    return await modal.present();
  }
  trackByFunction(item) {
    return item.id;
  }

  sortUsersByDistance(pets: PetModel[]) {
    //console.log(this.filteredUsers);
    return JSON.parse(JSON.stringify(pets)).filter((r: PetModel) => r && r.ubication).sort((r: PetModel, s: PetModel) => 
      this.getDistanceFromLatLonInKm(this.pet.ubication.latitude, this.pet.ubication.longitude,
        r.ubication.latitude, r.ubication.longitude) - this.getDistanceFromLatLonInKm(
          this.pet.ubication.latitude, this.pet.ubication.longitude,
          s.ubication.latitude, s.ubication.longitude)
    );
  }

  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2): number {
    var R: number = 6371; // Radius of the earth in km
    var dLat: number = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon: number = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d: number = R * c; // Distance in km
    // console.log(d);

    return d;
  }


  deg2rad(deg): number {
    return deg * (Math.PI / 180)
  }
}
