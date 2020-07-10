import { GeolocationService } from './../../../services/geolocation.service';
import { PostProvider } from 'src/app/providers/post.provider';
import { PostModel } from 'src/app/schemes/models/post.model';
import { NavController, AlertController } from '@ionic/angular';
import { PetProvider } from '../../../providers/pet.provider';
import { UtilsService } from './../../../services/utils.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../../services/auth.service';
import { Component } from '@angular/core';
import { PetModel } from 'src/app/schemes/models/pet.model';
import { take } from 'rxjs/operators';
import { CameraOptions, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  editForm: FormGroup;
  edit: boolean = false;
  pet: PetModel;
  imagePreview: any;
  uploadedImage: string;
  section = "profile";
  dataLoaded: boolean;
  currentUserId: string;
  postSubscription: any;
  posts: PostModel[];
  users: {[key: string]: PetModel} = {};
  ubicationChecked: any;

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
    private petProvider: PetProvider,
    private navController: NavController,
    private postProvider: PostProvider,
    private alertController: AlertController,
    private geolocationService: GeolocationService,
  ) { }

  async onLogout() {
    await this.authService.logout();
    if (this.geolocationService.getTrackingState()) await this.geolocationService.stopTrackingWithoutNullValue();
    this.navController.navigateBack('login');
  }

  async ionViewWillEnter() {
    this.initPostAndUsersData();
    this.edit = false;
    const userId = await this.authService.getCurrentUserUid();
    this.pet = await this.petProvider.getDataById(userId).pipe(take(1)).toPromise();
    console.log(this.pet);
    console.log(userId);
    
    this.ubicationChecked = !!this.pet.ubication;
    this.editForm = this.createForm();
    this.editForm.get('type').setValue(this.pet.type);
    this.editForm.get('genre').setValue(this.pet.genre);
    console.log(this.pet.type);
    
    this.editForm.disable();
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      email: [this.pet.email || ''],
      name: [this.pet.name || '', [Validators.required]],
      age: [this.pet.age || 0, [Validators.required]],
      type: [this.pet.type , [Validators.required]],
      genre: [this.pet.genre || '', [Validators.required]],
      contactInfo: [this.pet.contactInfo || '', [Validators.required]],
      ubicationChecked: [!!this.pet.ubication],
      description: [this.pet.description || '']
    })
  }

  async onSave(): Promise<void> {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }
    await this.utilsService.presentLoading();
    Object.keys(this.editForm.controls).forEach(control => {
      if (control !== "passwords" && control !== "ubicationChecked") {
        this.pet[control] = this.editForm.get(`${control}`).value;
      }
    });
    if(this.imagePreview){

      await this.uploadPhoto(this.pet.id).catch(err => {
      });
      this.pet.profileImg = this.uploadedImage;
    }
    console.log(this.editForm.controls.ubicationChecked);
    console.log(this.geolocationService.getTrackingState());
    
    if(this.editForm.controls.ubicationChecked.value && !this.geolocationService.getTrackingState()){
      const geolocation = await this.geolocationService.getCurrentLocation().catch(_ => {});
      if(geolocation){
        this.pet.ubication = {latitude: geolocation.coords.latitude, longitude: geolocation.coords.longitude};
      }else{
        this.utilsService.showToast("Profavor, active la ubicación de su dispositivo");
      }
      await this.geolocationService.startTrackingLocation();
    }
    else if(!this.editForm.controls.ubicationChecked.value && this.geolocationService.getTrackingState())
       this.geolocationService.stopTrackingLocation();
       console.log("esperando para update");
       
    this.petProvider.updatePet(this.pet).catch(err => {
      this.utilsService.showToast("Algo ha salido mal, vuelva a intentarlo");
      this.utilsService.dissmissLoading();
    }).then(_ => {
      this.utilsService.dissmissLoading();
      this.goToViewProfile();
    });
  }

  async goToViewProfile() {
    const userId = await this.authService.getCurrentUserUid();
    this.imagePreview = null;
    this.pet = await this.petProvider.getDataById(userId).pipe(take(1)).toPromise();
    this.editForm = this.createForm();
    setTimeout(_ => {
      this.editForm.get('type').setValue(this.pet.type);
      this.editForm.get('genre').setValue(this.pet.genre);
      this.editForm.disable();
      this.edit = false;
    });
  }

  goToEdit() {
    this.editForm.enable();
    this.editForm.get('email').disable();
    this.edit = true;
  }
  async takePhoto(){
    const { Camera } = Plugins;
    const cameraOptions: CameraOptions = await this.utilsService.actionSheetCameraOptions();
    const image = await Camera.getPhoto(cameraOptions);
    this.imagePreview = image;
    console.log(image);
    console.log(image.webPath);
  }

  async uploadPhoto(userId: string){
    this.uploadedImage = await this.utilsService.uploadToStorage(this.imagePreview.dataUrl, `users/${userId}/profile.jpeg`, 'jpeg');
    // (this.uploadedImage) ? this.utilsService.showToast(`Se ha modificado tu foto correctamente, ¡recuerda guardar los cambios!`) : null;
  }
  goTo(view: string): void{
    this.section = view;
  }

  trackByFunction(item) {
    return item.id;
  }

  async initPostAndUsersData(){
    this.dataLoaded = false;
    this.currentUserId = await this.authService.getCurrentUserUid()
    this.postSubscription = this.postProvider.getAllPostByUserId(this.currentUserId).subscribe(res => {
      this.posts = res.reverse();
      const users = [...new Set(this.posts.map(post => post.userId))];     
      const promisesArr = users.map(async user =>
        await this.petProvider.getDataById(user).pipe(take(1)).toPromise()
      );
      Promise.all(promisesArr).then(res => {
        res.forEach(pet => {
          this.users[pet.id] = pet;
        });
        this.dataLoaded = true;
      });
    });
    /* tslint:disable-next-line */
  }

  isToday(chatTimestamp: number): boolean {
    const chatDate = new Date(chatTimestamp);
    const nowDate = new Date();
    return (chatDate.getDate() === nowDate.getDate() && chatDate.getMonth() === nowDate.getMonth() &&
      chatDate.getFullYear() === nowDate.getFullYear())
  }

  async deletePost(postId: string){
    const alert = await this.alertController.create({
      cssClass: "my-custom-class",
      message: "Desea borrar permanentemente esta publicación?",
      buttons: [
        {
          text: "No",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            console.log("Confirm Cancel: blah");
          },
        },
        {
          text: "Si",
          handler: async () => {
            await this.utilsService.presentLoading();
            this.postProvider.deletePost(postId).then(async _ => {
              this.utilsService.dissmissLoading();
            }).catch(async _ => {
              this.utilsService.dissmissLoading();
              this.utilsService.showToast("Un error ha ocurrido, vuelva a intentarlo mas tarde");
            })
          },
        },
      ],
    });
    await alert.present();
  }

  ubicationToggled(){
    console.log(this.ubicationChecked);
    
  }

  async goToPreviewImg(image: string){
    await this.utilsService.goToImgPreview(image);
  }

}
