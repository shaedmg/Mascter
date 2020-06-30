import { AngularFireDatabase } from '@angular/fire/database';
import { Categories } from '../enums/categories';
export class PostModel{
    id: string;
    text: string;
    userId: string;
    createdDate?: number;
    usersIdThatFavourited: string[];
    image?: string;
    category?: string;

    constructor(db: AngularFireDatabase){
        this.id = db.createPushId();
        this.text = "";
        this.userId = "";
        this.usersIdThatFavourited = [];
    }
}