
export class ChatModel {
    id: string;
    members: string[];
    createdAt: number;
    updatedAt: number;
    totalMessages: number;
    readMessages: {[key:string]:number};
    lastMessage: string;
    
    constructor() {
        this.id = '';
        this.members = [];
        this.createdAt = new Date().getTime();
        this.updatedAt = 0;
        this.totalMessages = 0;
        this.readMessages = {};
    }

}
