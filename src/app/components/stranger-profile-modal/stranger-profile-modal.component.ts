import { PetProvider } from './../../providers/pet.provider';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { PetModel } from 'src/app/schemes/models/pet.model';
import { UtilsService } from 'src/app/services/utils.service';
import { NavController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-stranger-profile-modal',
  templateUrl: './stranger-profile-modal.component.html',
  styleUrls: ['./stranger-profile-modal.component.scss'],
})
export class StrangerProfileModalComponent implements OnInit {

  pet: PetModel;
  currentUserId: string;
  constructor(private utilsService: UtilsService,
    private navController: NavController,
    private modalController: ModalController,
    private authService: AuthService,
    private petProvider: PetProvider,
    ) { }

  async ngOnInit() {
    this.currentUserId = await this.authService.getCurrentUserUid();
    this.pet = this.utilsService.getDataFromNavigation();
  }

  async goBack(){
    await this.modalController.dismiss();
  }

  toogleFavourite(pet: PetModel){
    if(!pet.usersIdThatAreInterested || !pet.usersIdThatAreInterested.find(userId => userId === this.currentUserId ) ){
      pet.usersIdThatAreInterested = [this.currentUserId];
    }else{
      pet.usersIdThatAreInterested = pet.usersIdThatAreInterested.filter(userId => userId !== this.currentUserId);
    }
    this.petProvider.updatePet(pet);
  }

  petIsFavourited(pet: PetModel){
    if(!pet.usersIdThatAreInterested)return false;
    console.log("salta el if");
    
    return !!(pet.usersIdThatAreInterested.find(petId => petId == this.currentUserId ));
  }
}
