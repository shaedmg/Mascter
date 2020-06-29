import { Plugins } from "@capacitor/core";
import { ModalController, IonContent, Platform } from "@ionic/angular";
import { ChatModel } from "./../../schemes/models/chat.model";
import { ChatProvider } from "./../../providers/chat.provider";
import { AngularFireDatabase } from "@angular/fire/database";
import { PetModel } from "./../../schemes/models/pet.model";
import { PetProvider } from "./../../providers/pet.provider";
import { AuthService } from "./../../services/auth.service";
import { MessageModel } from "./../../schemes/models/message.model";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { MessageProvider } from "src/app/providers/message.provider";
import { take } from "rxjs/operators";
const { Keyboard } = Plugins;

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit, OnDestroy {
  chatId: string;
  imageProfile: string;
  userName: string;
  messages: MessageModel[] = [];
  currentUser: PetModel;
  messageToSend: string;
  chat: ChatModel;
  strangerId: string;
  @ViewChild("content") private content: IonContent;
  firstPetitionFlag: boolean = true;
  animationsFlag: boolean = false;
  offset = 0;
  pauseSubscription: Subscription;
  keyboardShown: boolean = false;
  ionContentHeight: number = 0;
  messagesToRead: number = 0;
  showScrollBtn: boolean = false;
  scrolling: boolean = false;
  chatSubscription: Subscription;
  messageSubscription: Subscription;

  constructor(
    private messageProvider: MessageProvider,
    private authService: AuthService,
    private petProvider: PetProvider,
    private db: AngularFireDatabase,
    private chatProvider: ChatProvider,
    private modalController: ModalController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    this.currentUser = await this.petProvider
      .getDataById(await this.authService.getCurrentUserUid())
      .pipe(take(1))
      .toPromise();
    this.chatSubscription = this.chatProvider.getDataById(this.chatId).subscribe((res) => {
      this.chat = res;
      this.strangerId = this.chat.members.find((r) => r != this.currentUser.id);
    });
    this.messageSubscription = this.messageProvider.getmessageByChatId(this.chatId).subscribe((res) => {
      this.scrolling = true;
      this.messages = res;
      if (!this.isVisible())this.messagesToRead++;
      if (this.firstPetitionFlag) {
        this.scrollToBottomOnInit(0);
      } else if (this.isVisible()) {
        this.scrollToBottomOnInit();
      }
      this.scrolling = false;
    });
    this.pauseSubscription = this.platform.pause.subscribe((res) => {
      this.updateMessagesRead();
    });
    this.ionContentHeight = document.getElementById("content").offsetHeight;
    Keyboard.addListener("keyboardWillShow", () => {
      if (this.isVisible()) this.scrollToBottomOnInit(100);
    });
    Keyboard.addListener("keyboardWillHide", () => {});
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log("aiuda");
  }
  async ionViewWillLeave() {
    this.pauseSubscription.unsubscribe();
    this.chatSubscription.unsubscribe();
    this.messageSubscription.unsubscribe();
    this.updateMessagesRead();
    Keyboard.removeAllListeners();
  }
  async updateMessagesRead() {
    const chat: ChatModel = {
      readMessages: {
        [this.currentUser.id]: this.chat.totalMessages || 0,
        [this.strangerId]: this.chat.readMessages[this.strangerId] || 0,
      },
      id: this.chatId,
    };
    await this.chatProvider.updateChat(chat);
  }

  async dismissModal() {
    await this.modalController.dismiss();
  }

  async sendMessage() {
    if (!this.messageToSend) return;
    const message = {
      id: this.db.createPushId(),
      chatId: this.chatId,
      senderId: this.currentUser.id,
      createdAt: Date.now(),
      text: this.messageToSend,
    };
    this.messageToSend = "";
    this.messageProvider.createMessage(message).then(async (_) => {
      const chat = {
        updatedAt: message.createdAt,
        totalMessages: this.chat.totalMessages + 1,
        lastMessage: message.text,
        id: this.chatId,
      };
      this.scrollToBottomOnInit();
      await this.chatProvider.updateChat(chat);
    });
  }

  isVisible() {
    return (
      document.getElementById("hidden-mark").getBoundingClientRect().bottom <
      this.ionContentHeight + 62
    );
  }

  checkIfBottom() {
    if (!this.isVisible()) this.showScrollBtn = true;
    else{
      this.showScrollBtn = false;
    this.messagesToRead = 0;
    }
  }

  scrollToBottomOnInit(time: number = 300) {
    this.content.scrollToBottom(time);
    if (time == 0) this.firstPetitionFlag = false;
  }

  trackByFunction(item) {
    return item.id;
  }
}
