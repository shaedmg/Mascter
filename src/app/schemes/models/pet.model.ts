import { AngularFireDatabase } from '@angular/fire/database';

export class PetModel{

    id: string;
    email: string;
    name: string;
    age: number;
    type: string;
    genre: string;
    contactInfo: string;
    profileImg: string;
    usersIdThatAreInterested: string[];
    usersIdsInWhichIsInterested: string[];
    petsViewed: string[];
    chatsIds: string[];
    ubication?: {latitude: number, longitude: number};
    description: string;

    constructor(){
        this.id = '';
        this.email = '';
        this.name = '';
        this.age = 0;
        this.type = '';
        this.genre = '';
        this.contactInfo = '';
        this.profileImg = '';
        this.usersIdThatAreInterested = []
        this.usersIdsInWhichIsInterested = []
        this.chatsIds = [];
    }

}