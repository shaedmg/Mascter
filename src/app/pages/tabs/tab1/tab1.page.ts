import { UsersFiltersModalComponent } from './../../../components/users-filters-modal/users-filters-modal.component';
import { RandomMatcherModalComponent } from './../../../components/random-matcher-modal/random-matcher-modal.component';
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
  filters: {
    age: {
      min: number,
      max: number
    },
    genre: string,
    type: string
  };
  filteredPets: PetModel[];

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
    this.filters = {
      age: {
        min: 0,
        max: 99
      },
      genre: '',
      type: ''
    };
    this.pet = await this.petProvider.getDataById(currentUserUid).pipe(take(1)).toPromise();
    if ( this.pet.ubication ){
      this.petSubscription = this.petProvider.getDataById(currentUserUid).subscribe(res => {
        this.pet = res;
        if(this.pet.ubication) this.updatePets();
      });
      this.petsSubscription = this.petProvider.getAllData().subscribe(res => {
        this.pets = this.sortUsersByDistance(res.filter( pet => pet.id !== currentUserUid && pet.ubication));
        this.updatePets();
      });
    }
  }
  ionViewWillLeave(){
    if ( this.petSubscription ) this.petSubscription.unsubscribe();
    if ( this.petsSubscription ) this.petsSubscription.unsubscribe();
  }
  
  updatePets(){
    this.filteredPets = this.filterByFilters(this.sortUsersByDistance(this.pets));
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
    if(!pets || pets.length == 0) return [];
    return JSON.parse(JSON.stringify(pets)).filter((r: PetModel) => r && r.ubication)
    .sort((r: PetModel, s: PetModel) => 
      this.getDistanceFromLatLonInKm(this.pet.ubication.latitude, this.pet.ubication.longitude,
        r.ubication.latitude, r.ubication.longitude) - this.getDistanceFromLatLonInKm(
          this.pet.ubication.latitude, this.pet.ubication.longitude,
          s.ubication.latitude, s.ubication.longitude)
    );
  }

  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2): number {
    const earthRadius: number = 6371;
    var dLat: number = this.degreesToRad(lat2 - lat1); 
    var dLon: number = this.degreesToRad(lon2 - lon1);
    const latA = this.degreesToRad(lat1) ;
    const latB = this.degreesToRad(lat2);
    return (2 * earthRadius * Math.asin(Math.sqrt(Math.pow(Math.sin(dLat / 2), 2) +
      Math.cos(latA) * Math.cos(latB) *
      Math.pow(Math.sin(dLon / 2), 2))));
  }

  degreesToRad(deg): number {
    return deg * (Math.PI / 180)
  }

  async goToRandomMatcher(){
    const modal = await this.modalController.create({
      component: RandomMatcherModalComponent
    });
    await modal.present();
  }

  filterByFilters(pets: PetModel[]): PetModel[]{
    const petsCopy = JSON.parse(JSON.stringify(pets));
    return petsCopy.filter((pet: PetModel) => (this.sortByAge(pet) && this.sortByGenre(pet) && this.sortByType(pet)));
  }

  sortByAge(pet: PetModel): boolean {
    return pet.age >= this.filters.age.min && pet.age <= this.filters.age.max;
  }
  
  sortByType(pet: PetModel): boolean {
    return this.filters.type ? pet.type === this.filters.type : true;
  }

  sortByGenre(pet: PetModel): boolean {
    return this.filters.genre ? pet.genre === this.filters.genre : true;
  }

  async goToFilters(){
    const modal = await this.modalController.create({
      component: UsersFiltersModalComponent,
      componentProps: { filters: JSON.parse(JSON.stringify(this.filters))}
    });
    modal.onDidDismiss().then(res => {
       if ( res && res.data) {
         this.filters = res.data;
        this.updatePets();
       }
    });
    await modal.present();
  }
}
