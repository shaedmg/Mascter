import { ChatModel } from "./../schemes/models/chat.model";
import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChatProvider {
  constructor(private db: AngularFireDatabase) {}

  getAllData(): Observable<ChatModel[]> {
    return this.db.list<ChatModel>("chats").valueChanges();
  }

  getDataById(id: string): Observable<ChatModel> {
    return this.db.object<ChatModel>(`chats/${id}`).valueChanges();
  }

  createChat(pet: ChatModel): Promise<void> {
    console.log(pet);
    
    return this.db.object<ChatModel>(`chats/${pet.id}`).set(pet);
  }
  updateChat(pet: ChatModel): Promise<void> {
    return this.db.object<ChatModel>(`chats/${pet.id}`).update(pet);
  }
  deleteChat(chatId: string){
    return this.db.object<ChatModel>(`chats/${chatId}`).remove();
  }
}
