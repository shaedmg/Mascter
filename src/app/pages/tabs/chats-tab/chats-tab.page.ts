import { ChatComponent } from './../../../components/chat/chat.component';
import { ModalController } from '@ionic/angular';
import { ChatModel } from "./../../../schemes/models/chat.model";
import { AuthService } from "./../../../services/auth.service";
import { PetModel } from "src/app/schemes/models/pet.model";
import { PetProvider } from "./../../../providers/pet.provider";
import { ChatProvider } from "src/app/providers/chat.provider";
import { Component, OnInit } from "@angular/core";
import { switchMap, take } from "rxjs/operators";
import { combineLatest, Subscription, of } from "rxjs";

@Component({
  selector: "app-chats-tab",
  templateUrl: "./chats-tab.page.html",
  styleUrls: ["./chats-tab.page.scss"],
})
export class ChatsTabPage implements OnInit {

  currentPet: PetModel;
  chats: ChatModel[];
  petSubscription: Subscription;
  pets: {[key: string]: PetModel} = {};
  currentUserId: string;
  
  constructor(
    private chatProvider: ChatProvider,
    private petProvider: PetProvider,
    private authService: AuthService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.currentUserId = await this.authService.getCurrentUserUid();
    (await this.petProvider.getAllData().pipe(take(1)).toPromise()).forEach(
      pet => {
        this.pets[pet.id] = pet;
      }
    );
    this.petSubscription = this.petProvider
      .getDataById(this.currentUserId)
      .pipe(
        switchMap((res) => {
          this.currentPet = res;
          if (this.currentPet.chatsIds) {
            const observablesArr = this.currentPet.chatsIds.map((chatId) =>
              this.chatProvider.getDataById(chatId)
            );
            return combineLatest(observablesArr);
          }else{
            return of([]);
          }
        })
      )
      .subscribe((chats) => {
        this.chats = chats;
      });
  }
  
  ionViewWillLeave(){
    if ( this.petSubscription ) this.petSubscription.unsubscribe();
  }

  
  trackByItems( chat: ChatModel): string { return chat.id; }

  isToday(chatTimestamp: number): boolean{
    const chatDate = new Date(chatTimestamp);
    const nowDate = new Date();
    return (chatDate.getDate() == nowDate.getDate() && chatDate.getMonth() == nowDate.getMonth() &&
    chatDate.getFullYear() == nowDate.getFullYear())
  }

  async goToChat(chatId: string, imageProfile: string, userName: string ){
    console.log(chatId);
    
    const modal = await this.modalController.create({
      component: ChatComponent,
      componentProps: {
        chatId,
        imageProfile,
        userName
      }
    });
    await modal.present();
  }
}
