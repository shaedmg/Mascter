import { AngularFireDatabase } from '@angular/fire/database';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PetModel } from '../schemes/models/pet.model';


@Injectable({
    providedIn: 'root'
})
export class PetProvider {

    constructor(
        private db: AngularFireDatabase,
    ) { }

    getAllData() : Observable<PetModel[]> {
        return this.db.list<PetModel>('pets').valueChanges();
    }
    
    getDataById(id : string) : Observable<PetModel> {
        return this.db.object<PetModel>(`pets/${id}`).valueChanges();
    }    

    createPet(pet: PetModel): Promise<void>{
        return this.db.object<PetModel>(`pets/${pet.id}`).set(pet);
    }
    updatePet(pet: PetModel): Promise<void>{
        return this.db.object<PetModel>(`pets/${pet.id}`).update(pet);
    }
    
    getPetByEmail(email: string){
        return this.db.list<PetModel>('pets', ref => ref.orderByChild('email').equalTo(email)).valueChanges();
    }
}
