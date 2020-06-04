import { NavController } from '@ionic/angular';
import { UtilsService } from './../../services/utils.service';
import { PetProvider } from '../../providers/pet.provider';
// import { Camera } from '@ionic-native/camera/ngx';
import { PetModel } from './../../schemes/models/pet.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Plugins, CameraResultType, CameraSource, CameraOptions, CameraPhoto } from '@capacitor/core';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  imagePreview: CameraPhoto;
  uploadedImage: string;
  emailRepeated: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private petProvider: PetProvider,
    private utilsService: UtilsService,
    private navController: NavController,
  ) { }

  ngOnInit() {
    this.registerForm = this.createForm();
  }
  ionViewWillEnter(){
    this.emailRepeated = false;
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      passwords: this.formBuilder.group({
        password: ['', [Validators.minLength(6), Validators.required]],
        password_confirmation: ['']
      }, { validator: this.passwordConfirming }),
      name: ['', [Validators.required]],
      age: ['', [Validators.required]],
      type: ['', [Validators.required]],
      genre: ['', [Validators.required]],
      contactInfo: ['', [Validators.required]]
    });
  }

  // Custom validator que valida que ambas contraseñas son iguales.
  passwordConfirming(c: AbstractControl): { invalidMatch: boolean } {
    if (c.get('password').value !== c.get('password_confirmation').value) {
      return { invalidMatch: true };
    }
  }

  async onRegister(): Promise<void> {
    if(!this.registerForm.valid){
      console.log("no es valido");
      this.registerForm.markAllAsTouched();
      return;
    }
    await this.utilsService.presentLoading();
    const pet = await this.petProvider.getPetByEmail(this.registerForm.get('email').value).pipe(take(1)).toPromise();
    console.log(pet);
    
    if(pet.length > 0){
      this.emailRepeated = true;
      this.utilsService.dissmissLoading();
      return;
    }
    this.authService.createUser(this.registerForm.value.email, this.registerForm.value.passwords.password).then(
      async (userCredential: firebase.auth.UserCredential) => {
        const pet: PetModel = new PetModel();
        Object.keys(this.registerForm.controls).forEach(control => {
          if(control !== "passwords"){
            pet[control] = this.registerForm.get(`${control}`).value;
          }
        });
        pet.id = userCredential.user.uid;
        if(this.imagePreview){

          await this.uploadPhoto(pet.id).catch(err => {
            console.log(err);
            
            console.log("ha sucedido un error, vuelva a intentarlo");
            
          });
          pet.profileImg = this.uploadedImage;
        }
        pet.email = userCredential.user.email;
        this.petProvider.createPet(pet).catch(err => {
          console.log(err);
          
          this.utilsService.showToast("Algo ha salido mal, vuelva a intentarlo");
          this.utilsService.dissmissLoading();
        }).then(_ => {
          this.utilsService.dissmissLoading();
          this.navController.navigateForward("/tabs");
        });
      }
    ).catch(err => {
      this.utilsService.showToast("Algo ha salido mal, vuelva a intentarlo");
      console.log(err);
      
      this.utilsService.dissmissLoading();
    });
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
    (this.uploadedImage) ? this.utilsService.showToast(`Se ha modificado tu foto correctamente, ¡recuerda guardar los cambios!`) : null;
  }

  goBack(){
    this.navController.back();
  }

  // async onUserPhoto() {
  //   const cameraOptions = await this.utilsService.actionSheetCameraOptions();
  //   const imagePreview = await this.camera.getPicture(cameraOptions);
  //   const uploadedImage = await this.utilsService.uploadToStorage('data:image/jpeg;base64,' + imagePreview, `users/${this.user.id}/profile.jpeg`, 'jpeg');
  //   (uploadedImage) ? this.utilsService.showToast(`Se ha modificado tu foto correctamente, ¡recuerda guardar los cambios!`) : null;
  //   this.user.photoUrl = (uploadedImage) ? uploadedImage : this.user.photoUrl;
  // }
}
