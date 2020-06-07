import { trigger, transition } from '@angular/animations';
import { OverlayEventDetail } from '@ionic/core';
import { StrangerProfileModalComponent } from '../../../components/stranger-profile-modal/stranger-profile-modal.component';
import { UtilsService } from './../../../services/utils.service';
import { NavController, ModalController } from '@ionic/angular';
import { PetModel } from './../../../schemes/models/pet.model';
import { PetProvider } from './../../../providers/pet.provider';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  pets: PetModel[];

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
    this.pets = (await this.petProvider.getAllData().pipe(take(1)).toPromise()).filter( pet => pet.id !== currentUserUid );
  }

  async goToProfile(pet: PetModel){
    this.utilsServe.setDataForNavigation(pet);
    const modal = await this.modalController.create({
      component: StrangerProfileModalComponent
    });
    return await modal.present();
  }
}
