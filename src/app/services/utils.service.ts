import { CameraOptions, Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { Injectable } from '@angular/core';
import { LoadingController, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as firebase from 'firebase';
import { ImagePreviewComponent } from '../components/image-preview/image-preview.component';

const { Camera } = Plugins;

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    loading: HTMLIonLoadingElement;
    data: any;
    constructor(
        private loadingController: LoadingController,
        private toastCtrl: ToastController,
        // private camera: Camera,
        private actionSheetController: ActionSheetController,
        private modalController: ModalController,
    ) { }

    getArrayFromObject(object: any): any[] {
        if (object)
            return Object.keys(object).map((key: string) => object[key]);
        return [];
    }

    async presentLoading(): Promise<void> {
        this.loading = await this.loadingController.create({
            spinner: 'crescent'
        });
        this.loading.present();
    }

    dissmissLoading(): void {
        this.loading.dismiss();
    }

    async showToast(message: string, position: "top" | "bottom" | "middle" = "top", duration: number = 2000): Promise<void> {
        let toast = await this.toastCtrl.create({
            message: message,
            position: position,
            duration: duration
        });

        await toast.present();

    }

    async errorHandling(e) {

        let error = e;
        if (!e.code && e.error) error = e.error;

        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    //TODO: Cambiar este texto a translate.
                    await this.showToast("No se ha encontrado usuario con este email. Regístrate!", "top", 4000);
                    break;
                default:
                    await this.showToast(error.message, "top", 4000);
                    break;

            }
        } else {
            console.error("Error en el catch: ", e);
        }
        return null;
    }

    actionSheetCameraOptions(): Promise<CameraOptions>{
        return new Promise(async (resolve, reject) => {
          const actionSheet = await this.actionSheetController.create({
            header: 'Selecciona una de las siguientes opciones',
            buttons: [
                {
                    text: "Galería de fotos",
                    handler: () => {
                        let options: CameraOptions = {
                            quality: 50,
                            resultType: CameraResultType.DataUrl,
                            source: CameraSource.Photos,
                            correctOrientation: true,
                        };
                        // options.destinationType = this.platform.is('android') ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.NATIVE_URI
                        resolve(options);
                    }
                },
                {
                    text: "Cámara",
                    handler: () => {
                        const options: CameraOptions = {
                            quality: 50,
                            resultType: CameraResultType.DataUrl,
                            source: CameraSource.Camera,
                            correctOrientation: true,
                            // targetWidth: 200,
                        };
                        // options.destinationType = this.platform.is('android') ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.NATIVE_URI
  
                        resolve(options);
                    }
                },
                {
                    text: "Cancelar",
                    role: "cancel",
                    handler: () => {
                        reject(null);
                    }
                }
            ]
        });
        await actionSheet.present();
      });
    }
    async uploadToStorage(fileDataOrLocation: string, ref: string, type): Promise<string> {
        const fileRef = firebase.storage().ref(ref);
        // return fileRef.getDownloadURL();
        let task;
        switch (type) {
          case "photo":
            task = await fileRef.putString(fileDataOrLocation, 'data_url');
            break;
          case "camera":
            task = await fileRef.putString(fileDataOrLocation, 'data_url');
            break;
          case "jpeg":
            task = await fileRef.putString(fileDataOrLocation, 'data_url');
            break;
        }
        return task.ref.getDownloadURL();
      }

      setDataForNavigation(data: any){
          this.data = JSON.parse(JSON.stringify(data));
      }

      getDataFromNavigation(): any{
          return this.data;
      }

      async goToImgPreview(img: string){
        let modal = await this.modalController.create({component: ImagePreviewComponent, componentProps: {image: img}});
        return await modal.present();
      }
}
