import { Injectable } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/firestore';
import { MiModeloModel } from '../schemes/models/mi-model.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserProvider {

    constructor(
        // private db: AngularFirestore,
    ) { }

    getAllData() : any {
        // return this.db.collection<MiModeloModel>('items').valueChanges();
    }
    
    getDataById(id : string) :any {
        // return this.db.doc<MiModeloModel>(`items/${id}`).valueChanges();
    }    
}
