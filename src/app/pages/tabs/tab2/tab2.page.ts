import { CreatePostComponent } from './../../../components/create-post/create-post.component';
import { PetProvider } from './../../../providers/pet.provider';
import { PetModel } from './../../../schemes/models/pet.model';
import { Router } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { PostModel } from './../../../schemes/models/post.model';
import { PostProvider } from './../../../providers/post.provider';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  posts: PostModel[];
  users: {[key: string]: PetModel} = {};
  dataLoaded: boolean = false;
  constructor(private postProvider: PostProvider,
    private navController: NavController,
    private router: Router,
    private petProvider: PetProvider,
    private modalController: ModalController) { }

  async ngOnInit() {
    console.log("init");

  }

  async ionViewWillEnter() {
    this.initPostAndUsersData();
  }

  async initPostAndUsersData(){
    this.dataLoaded = false;
    this.posts = (await this.postProvider.getAllPosts().pipe(take(1)).toPromise()).reverse();
    /* tslint:disable-next-line */
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
  }

  ionViewWillLeave() {
    console.log("leave");

  }

  ngOnDestroy(): void {
    console.log("destroy");
  }

  ionViewDidLeave() {
    console.log("lv");
  }

  async goToCreate() {
    const modal = await this.modalController.create({
      component: CreatePostComponent
    });
    modal.onDidDismiss().then(async (dataReturned: OverlayEventDetail<any>) => {
      if (dataReturned && dataReturned.data) {
        this.initPostAndUsersData();
      }
    });
    return await modal.present();
  }

  isToday(chatTimestamp: number): boolean {
    const chatDate = new Date(chatTimestamp);
    const nowDate = new Date();
    return (chatDate.getDate() === nowDate.getDate() && chatDate.getMonth() === nowDate.getMonth() &&
      chatDate.getFullYear() === nowDate.getFullYear())
  }

}
