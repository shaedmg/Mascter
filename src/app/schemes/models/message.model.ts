export class MessageModel {
    id: string;
    chatId: string;
    senderId: string;
    createdAt: number;
    text: string;

    constructor() {
        this.id = '';
        this.chatId = '';
        this.senderId = '';
        this.createdAt = 0;
        this.text = '';
    }
}