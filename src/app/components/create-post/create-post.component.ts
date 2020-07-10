import { CategoriesModalComponent } from './../categories-modal/categories-modal.component';
import { ImagePreviewComponent } from './../image-preview/image-preview.component';
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
import { Plugins, CameraOptions, CameraPhoto } from '@capacitor/core';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {

  pet: PetModel;
  post: PostModel;
  imagePreview: CameraPhoto;

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

  async onCreatePost(){
    this.post.userId = this.pet.id;
    console.log(this.post);
    if(this.imagePreview){
      this.post.image = await this.uploadPhoto(this.pet.id)
    }
    this.postProvider.createPost(this.post).then(async res => {
      await this.modalController.dismiss(true);
    }).catch(err => {
      this.utilsService.showToast("Ha sucedido u nerror, vuelva a intentarlo");
    });

  }
  async goBack(){
    await this.modalController.dismiss();
  }
  
  async takePhoto(){
    const { Camera } = Plugins;
    const cameraOptions: CameraOptions = await this.utilsService.actionSheetCameraOptions();
    const image = await Camera.getPhoto(cameraOptions);
    this.imagePreview = image;
  }

  async uploadPhoto(userId: string){
    return await this.utilsService.uploadToStorage(this.imagePreview.dataUrl, `posts/${userId}/${Date.now()}.jpeg`, 'jpeg');
  }

  async goToImgPreview(img: string){
    await this.utilsService.goToImgPreview(img);
    // let modal = await this.modalController.create({component: ImagePreviewComponent, componentProps: {image: img}});
    // return await modal.present();
  }

  async openCategoriesModal(){
    const modal = await this.modalController.create({
      component: CategoriesModalComponent,
      componentProps: { categorySelected: this.post.category, multiSelection: false}
    });
    modal.onDidDismiss().then(res => {
      if ( res ) {
        this.post.category = res.data;
      }
    }) 
    await modal.present();
  }

}
