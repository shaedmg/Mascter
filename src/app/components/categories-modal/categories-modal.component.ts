import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Categories, getCategoriesImgs } from 'src/app/schemes/enums/categories';

@Component({
  selector: 'app-categories-modal',
  templateUrl: './categories-modal.component.html',
  styleUrls: ['./categories-modal.component.scss'],
})
export class CategoriesModalComponent implements OnInit {


  categorySelected: string = '';
  multiSelection: boolean = false;
  categories: string[];
  categoriesSelected: string[] = [];
  categoriesImgs: string[] = ["../../../assets/icon/cleaning.png", "../../../assets/icon/food.png",
  "../../../assets/icon/tennis.png", "../../../assets/icon/ubication-icon.png",
  "../../../assets/icon/curiosity.png", "../../../assets/icon/tips.png" ]

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.categories = Object.values(Categories);
  }

  async selectCategory(category: string) {
    await this.modalController.dismiss(category); 
  }

  toogleCategories(category: string){
    this.categoriesSelected.includes(category)
    ? this.categoriesSelected.splice(this.categoriesSelected.findIndex(categorySelected => categorySelected == category), 1)
    : this.categoriesSelected.push(category);
  }

  async dismissModal(){
    await this.modalController.dismiss(this.multiSelection ? this.categoriesSelected : this.categorySelected);
  }

}
