import { NavController } from '@ionic/angular';
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

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
    private petProvider: PetProvider,
    private navController: NavController,
  ) { }

  async onLogout() {
    await this.authService.logout();
    this.navController.navigateBack('login');
  }

  async ionViewWillEnter() {
    this.edit = false;
    const userId = await this.authService.getCurrentUserUid();
    this.pet = await this.petProvider.getDataById(userId).pipe(take(1)).toPromise();
    console.log(this.pet);
    console.log(userId);
    
    this.editForm = this.createForm();
    this.editForm.get('petType').setValue(this.pet.type);
    this.editForm.get('petGenre').setValue(this.pet.genre);
    console.log(this.pet.type);
    
    this.editForm.disable();
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      email: [this.pet.email || ''],
      petName: [this.pet.name || '', [Validators.required]],
      petAge: [this.pet.age || 0, [Validators.required]],
      petType: [this.pet.type , [Validators.required]],
      petGenre: [this.pet.genre || '', [Validators.required]],
      contactInfo: [this.pet.contactInfo || '', [Validators.required]]
    })
  }

  async onSave(): Promise<void> {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }
    await this.utilsService.presentLoading();
    Object.keys(this.editForm.controls).forEach(control => {
      if (control !== "passwords") {
        this.pet[control] = this.editForm.get(`${control}`).value;
      }
    });
    if(this.imagePreview){

      await this.uploadPhoto(this.pet.id).catch(err => {
      });
      this.pet.profileImg = this.uploadedImage;
    }
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
    this.pet = await this.petProvider.getDataById(userId).pipe(take(1)).toPromise();
    this.editForm = this.createForm();
    setTimeout(_ => {
      this.editForm.get('petType').setValue(this.pet.type);
      this.editForm.get('petGenre').setValue(this.pet.genre);
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
    (this.uploadedImage) ? this.utilsService.showToast(`Se ha modificado tu foto correctamente, ¡recuerda guardar los cambios!`) : null;
  }


}
