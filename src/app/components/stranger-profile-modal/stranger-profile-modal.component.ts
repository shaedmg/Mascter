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
  constructor(private utilsService: UtilsService,
    private navController: NavController,
    private modalController: ModalController) { }

  ngOnInit() {
    this.pet = this.utilsService.getDataFromNavigation();
  }

  async goBack(){
    await this.modalController.dismiss();
  }
}
