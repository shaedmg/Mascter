import { AngularFireDatabase } from '@angular/fire/database';
export class PostModel{
    id: string;
    text: string;
    userId: string;
    createdDate?: number;
    usersIdThatFavourited: string[];
    image?: string;

    constructor(db: AngularFireDatabase){
        this.id = db.createPushId();
        this.text = "";
        this.userId = "";
        this.usersIdThatFavourited = [];
    }
}