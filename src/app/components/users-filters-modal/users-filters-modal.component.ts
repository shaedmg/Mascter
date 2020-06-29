import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Agent } from 'http';

@Component({
  selector: 'app-users-filters-modal',
  templateUrl: './users-filters-modal.component.html',
  styleUrls: ['./users-filters-modal.component.scss'],
})
export class UsersFiltersModalComponent implements OnInit {

  filters: {
    age: {
      min: number,
      max: number
    },
    genre: string,
    type: string
  };

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  async cleanAllFilters(){
    this.filters = {
      age: {
        min: 0,
        max: 99
      },
      genre: '',
      type: ''
    };
  }

  async applyFilters() {
    if(!(this.filters.age.min >= 0)) this.filters.age.min = 0; 
    if(!(this.filters.age.max >= 0)) this.filters.age.max = 99; 
    await this.modalController.dismiss(this.filters);
  }
  
  async dismissModal() {
    await this.modalController.dismiss();
  }

}
