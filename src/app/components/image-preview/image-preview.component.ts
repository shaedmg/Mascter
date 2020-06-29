import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss'],
})
export class ImagePreviewComponent implements OnInit {


  image: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  async goBack(){
    await this.modalController.dismiss();
  }

}
