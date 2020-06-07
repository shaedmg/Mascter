import { Component, OnInit } from '@angular/core';
import { PetModel } from 'src/app/schemes/models/pet.model';
import { PostModel } from 'src/app/schemes/models/post.model';
import { AuthService } from 'src/app/services/auth.service';
import { PetProvider } from 'src/app/providers/pet.provider';
import { PostProvider } from 'src/app/providers/post.provider';
import { AngularFireDatabase } from '@angular/fire/database';
import { NavController, ModalController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {

  pet: PetModel;
  post: PostModel;

  constructor(private authService: AuthService,
              private petProvider: PetProvider,
              private postProvider: PostProvider,
              private db: AngularFireDatabase,
              private navController: NavController,
              private utilsService: UtilsService,
              private modalController: ModalController,
  ) { }

  async ngOnInit() {
    this.post = new PostModel(this.db);
    const userUid = await this.authService.getCurrentUserUid();
    this.pet = await this.petProvider.getDataById(userUid).pipe(take(1)).toPromise();
  }

  onCreatePost(){
    this.post.userId = this.pet.id;
    console.log(this.post);
    
    this.postProvider.createPost(this.post).then(async res => {
      await this.modalController.dismiss(true);
    }).catch(err => {
      this.utilsService.showToast("Ha sucedido u nerror, vuelva a intentarlo");
    });

  }
  async goBack(){
    await this.modalController.dismiss();
  }

}
