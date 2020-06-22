import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { UtilsService } from './utils.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private afAuth: AngularFireAuth,
        private utils: UtilsService,

    ) { }

    login(email: string, password: string): Promise<firebase.auth.UserCredential> {
        return this.afAuth.signInWithEmailAndPassword(email, password);
    }

    async getCurrentUserUid(): Promise<string>{
        return (await this.afAuth.currentUser).uid;
    }

    logout(): Promise<void> {
        return this.afAuth.signOut();
    }

    createUser(email: string, password: string): Promise<firebase.auth.UserCredential> {
        return this.afAuth.createUserWithEmailAndPassword(email, password);
    }
    
}
