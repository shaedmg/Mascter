import { MessageModel } from './../schemes/models/message.model';
import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MessageProvider {

  constructor(private db: AngularFireDatabase) {}

  getAllData(): Observable<MessageModel[]> {
    return this.db.list<MessageModel>("messages").valueChanges();
  }
  getMessageById(id: string): Observable<MessageModel> {
    return this.db.object<MessageModel>(`messages/${id}`).valueChanges();
  }
  createMessage(message: MessageModel): Promise<void> {
    return this.db.object<MessageModel>(`messages/${message.id}`).set(message);
  }
  updateMessage(message: MessageModel): Promise<void> {
    return this.db.object<MessageModel>(`messages/${message.id}`).update(message);
  }
  deleteMessage(messageId: string){
    return this.db.object<MessageModel>(`messages/${messageId}`).remove();
  }

  getmessageByChatId(chatId: string): Observable<MessageModel[]> {
      return this.db.list<MessageModel>('messages', ref => ref.orderByChild('chatId').equalTo(chatId)).valueChanges();
  }

}