import { AuthService } from './../../services/auth.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MessageProvider } from './../../providers/message.provider';
import { AlertController, ModalController } from '@ionic/angular';
import { AngularFireDatabase } from '@angular/fire/database';
import { ChatProvider } from './../../providers/chat.provider';
import { PetProvider } from './../../providers/pet.provider';
import { Component, OnInit } from '@angular/core';
import { ChatModel } from 'src/app/schemes/models/chat.model';
import { PetModel } from 'src/app/schemes/models/pet.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-random-matcher-modal',
  templateUrl: './random-matcher-modal.component.html',
  styleUrls: ['./random-matcher-modal.component.scss'],
})
export class RandomMatcherModalComponent {
  currentUserId: string;
  pet: PetModel;
  currentPet: PetModel;
  chats: any;
  petsToView: PetModel[];

  constructor(private petProvider: PetProvider,
      private chatProvider: ChatProvider,
      private db: AngularFireDatabase,
      private alertController: AlertController,
      private utilsService: UtilsService,
      private authService: AuthService,
      private modalController: ModalController) { }

  async ionViewWillEnter() {
    this.currentUserId = await this.authService.getCurrentUserUid();
    this.currentPet = await this.petProvider.getDataById(this.currentUserId).pipe(take(1)).toPromise();
    const pets = await this.petProvider.getAllData().pipe(take(1)).toPromise();
    this.petsToView = this.shufflePets(this.filterPetsToView(pets));
    this.goNextPet();
  }

  async favourite() {
      this.pet.usersIdThatAreInterested
        ? this.pet.usersIdThatAreInterested.push(this.currentPet.id)
        : (this.pet.usersIdThatAreInterested = [this.currentPet.id]);
      this.currentPet.usersIdsInWhichIsInterested
        ? this.currentPet.usersIdsInWhichIsInterested.push(this.pet.id)
        : (this.currentPet.usersIdsInWhichIsInterested = [this.pet.id]);
      if (
        this.pet.usersIdsInWhichIsInterested &&
        this.pet.usersIdsInWhichIsInterested.find((r) => {
          return r == this.currentPet.id;
        })
      ) {
        const chat = new ChatModel();
        chat.id = this.db.createPushId();
        chat.members.push(this.pet.id);
        chat.members.push(this.currentPet.id);
        chat.createdAt = new Date().getTime();
        chat.readMessages[this.pet.id] = 0;
        chat.readMessages[this.currentPet.id] = 0;
        chat.totalMessages = 0;
        chat.updatedAt = new Date().getTime();
        await this.chatProvider.createChat(chat);
        this.chats.push(chat);
        this.pet.chatsIds
          ? this.pet.chatsIds.push(chat.id)
          : (this.pet.chatsIds = [chat.id]);
        this.currentPet.chatsIds
          ? this.currentPet.chatsIds.push(chat.id)
          : (this.currentPet.chatsIds = [chat.id]);
        await this.petProvider.updatePet(this.pet);
        await this.petProvider.updatePet(this.currentPet);
        const alert2 = await this.alertController.create({
          cssClass: "my-custom-class",
          message: "Se ha producido un match!.",
          buttons: ["OK"],
        });

        await alert2.present();
      } else {
        await this.petProvider.updatePet(this.pet);
        await this.petProvider.updatePet(this.currentPet);
      }
      this.goNextPet();
  }

  async unfavourite(){
    await this.utilsService.presentLoading();
    !this.currentPet.petsViewed 
      ? this.currentPet.petsViewed = [this.pet.id]
      : this.currentPet.petsViewed.push(this.pet.id);
      await this.petProvider.updatePet(this.currentPet).catch(_ => {});
      this.goNextPet();
      this.utilsService.dissmissLoading();
  }

  async goNextPet(){
    if(this.petsToView.length == 0) {
      const alert2 = await this.alertController.create({
        cssClass: "my-custom-class",
        message: "No quedan mas mascotas disponibles, vuelva a intentarlo mas tarde.",
        buttons: ["OK"],
      });
      await alert2.present();
      await this.modalController.dismiss();
    }else this.pet = this.petsToView.shift();
  }

  filterPetsToView(pets: PetModel[]){
    return pets.filter(pet => 
      (!this.isCurrentUser(pet) && !this.petIsViewed(pet) && !this.petIsAlreadyFavourited(pet))
    )
  }

  isCurrentUser(pet: PetModel): boolean {
    return pet.id === this.currentPet.id;
  }

  petIsViewed(pet: PetModel): boolean {
    if( !this.currentPet.petsViewed ) return false;
    return this.currentPet.petsViewed.some(petViewed => petViewed == pet.id);
  }

  petIsAlreadyFavourited(pet: PetModel) : boolean {
    if( !this.currentPet.usersIdsInWhichIsInterested ) return false;
    return this.currentPet.usersIdsInWhichIsInterested.some(petFavourited => petFavourited == pet.id)
  }

  async goBack() {
    await this.modalController.dismiss();
  }
  shufflePets(pets: PetModel[]): PetModel[] {
    let i: number, randomNumber: number, aux: PetModel;
    let petsCopy: PetModel[] = JSON.parse(JSON.stringify(pets));
    for (i = petsCopy.length - 1; i > 0; i--) {
        randomNumber = Math.floor(Math.random() * (i + 1));
        aux = petsCopy[i];
        petsCopy[i] = petsCopy[randomNumber];
        petsCopy[randomNumber] = aux;
    }
    return petsCopy;
}

}
