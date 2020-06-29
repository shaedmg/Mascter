import { MessageProvider } from 'src/app/providers/message.provider';
import { AngularFireDatabase } from "@angular/fire/database";
import { ChatModel } from "./../../schemes/models/chat.model";
import { PetProvider } from "./../../providers/pet.provider";
import { AuthService } from "./../../services/auth.service";
import { Component, OnInit } from "@angular/core";
import { PetModel } from "src/app/schemes/models/pet.model";
import { UtilsService } from "src/app/services/utils.service";
import {
  NavController,
  ModalController,
  AlertController,
} from "@ionic/angular";
import { take } from "rxjs/operators";
import { ChatProvider } from "src/app/providers/chat.provider";
import { PromiseType } from 'protractor/built/plugins';

@Component({
  selector: "app-stranger-profile-modal",
  templateUrl: "./stranger-profile-modal.component.html",
  styleUrls: ["./stranger-profile-modal.component.scss"],
})
export class StrangerProfileModalComponent {
  pet: PetModel;
  currentUserId: string;
  currentPet: PetModel;
  chats: ChatModel[];

  constructor(
    private utilsService: UtilsService,
    private navController: NavController,
    private modalController: ModalController,
    private authService: AuthService,
    private petProvider: PetProvider,
    private alertController: AlertController,
    private db: AngularFireDatabase,
    private chatProvider: ChatProvider,
    private messageProvider: MessageProvider,
  ) {}

  async ionViewWillEnter() {
    this.chats = await this.chatProvider.getAllData().pipe(take(1)).toPromise();
    this.currentUserId = await this.authService.getCurrentUserUid();
    this.currentPet = await this.petProvider
      .getDataById(this.currentUserId)
      .pipe(take(1))
      .toPromise();
    this.pet = this.utilsService.getDataFromNavigation();
  }

  async goBack() {
    await this.modalController.dismiss();
  }

  async toogleFavourite(pet: PetModel) {
    if (
      !pet.usersIdThatAreInterested ||
      !pet.usersIdThatAreInterested.find(
        (userId) => userId === this.currentUserId
      )
    ) {
      // pet.usersIdThatAreInterested = [this.currentUserId];
      this.pet.usersIdThatAreInterested
        ? this.pet.usersIdThatAreInterested.push(this.currentPet.id)
        : (this.pet.usersIdThatAreInterested = [this.currentPet.id]);
      this.currentPet.usersIdsInWhichIsInterested
        ? this.currentPet.usersIdsInWhichIsInterested.push(this.pet.id)
        : (this.currentPet.usersIdsInWhichIsInterested = [this.pet.id]);
      if (
        pet.usersIdsInWhichIsInterested &&
        pet.usersIdsInWhichIsInterested.find((r) => {
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
        await this.petProvider.updatePet(pet);
        await this.petProvider.updatePet(this.currentPet);
        const alert2 = await this.alertController.create({
          cssClass: "my-custom-class",
          message: "Se ha producido un match!.",
          buttons: ["OK"],
        });

        await alert2.present();
      } else {
        await this.petProvider.updatePet(pet);
        await this.petProvider.updatePet(this.currentPet);
      }
    } else {
      if (
        this.pet.usersIdsInWhichIsInterested &&
        this.pet.usersIdsInWhichIsInterested.find(
          (userId) => userId == this.currentPet.id
        )
      ) {
        const alert = await this.alertController.create({
          cssClass: "my-custom-class",
          message: "Ya hay creado un match, está seguro de querer cancelarlo?",
          buttons: [
            {
              text: "No",
              role: "cancel",
              cssClass: "secondary",
              handler: (blah) => {
                console.log("Confirm Cancel: blah");
              },
            },
            {
              text: "Si",
              handler: async () => {
                this.pet.usersIdThatAreInterested = this.pet
                  .usersIdThatAreInterested
                  ? this.pet.usersIdThatAreInterested.filter(
                      (userId) => userId !== this.currentUserId
                    )
                  : [];
                this.currentPet.usersIdsInWhichIsInterested = this.currentPet
                  .usersIdsInWhichIsInterested
                  ? this.currentPet.usersIdsInWhichIsInterested.filter((id) => {
                      return id !== this.pet.id;
                    })
                  : [];
                  let chatId;
                if (
                  this.chats[this.chats.length - 1].members.includes(
                    this.pet.id
                  ) &&
                  this.chats[this.chats.length - 1].members.includes(
                    this.currentPet.id
                  )
                ) {
                  chatId = this.chats[this.chats.length - 1].id;
                  await this.chatProvider.deleteChat(
                    chatId
                  );
                  this.pet.chatsIds = this.pet.chatsIds.filter(
                    (r) => r !== this.chats[this.chats.length - 1].id
                  );
                  this.currentPet.chatsIds = this.currentPet.chatsIds.filter(
                    (r) => r !== this.chats[this.chats.length - 1].id
                  );
                  this.chats.pop();
                } else {
                  chatId = this.chats.find((chat) => {
                    return (
                      chat.members.includes(this.currentPet.id) &&
                      chat.members.includes(this.pet.id)
                    );
                  }).id;
                  this.pet.chatsIds = this.pet.chatsIds.filter(
                    (r) => r !== chatId
                  );
                  this.currentPet.chatsIds = this.currentPet.chatsIds.filter(
                    (r) => r !== chatId
                  );
                }
                await this.petProvider.updatePet(pet);
                await this.petProvider.updatePet(this.currentPet);
                this.messageProvider.getmessageByChatId(chatId).pipe(take(1)).toPromise().then(res => {
                  const promisesArr = res.map(r => this.messageProvider.deleteMessage(r.id));
                  Promise.all(promisesArr).then();
                })
              },
            },
          ],
        });

        await alert.present();
      } else {
        this.pet.usersIdThatAreInterested = this.pet.usersIdThatAreInterested
          ? this.pet.usersIdThatAreInterested.filter(
              (userId) => userId !== this.currentUserId
            )
          : [];
        this.currentPet.usersIdsInWhichIsInterested = this.currentPet
          .usersIdsInWhichIsInterested
          ? this.currentPet.usersIdsInWhichIsInterested.filter((id) => {
              return id !== this.pet.id;
            })
          : [];
        await this.petProvider.updatePet(pet);
        await this.petProvider.updatePet(this.currentPet);
      }
    }
  }

  petIsFavourited() {
    if (!this.currentPet.usersIdsInWhichIsInterested) return false;
    return !!this.currentPet.usersIdsInWhichIsInterested.find(
      (petId) => petId == this.pet.id
    );
  }
}
