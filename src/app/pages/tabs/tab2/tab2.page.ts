import { AuthService } from './../../../services/auth.service';
import { UtilsService } from './../../../services/utils.service';
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
import { StrangerProfileModalComponent } from 'src/app/components/stranger-profile-modal/stranger-profile-modal.component';
import { Subscription } from 'rxjs';
import { CategoriesModalComponent } from 'src/app/components/categories-modal/categories-modal.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  posts: PostModel[];
  users: {[key: string]: PetModel} = {};
  dataLoaded: boolean = false;
  currentUserId: string;
  postSubscription: Subscription;
  categoriesActiveFilters: string[] = [];
  filteredPosts: PostModel[];

  constructor(private postProvider: PostProvider,
    private navController: NavController,
    private router: Router,
    private petProvider: PetProvider,
    private modalController: ModalController,
    private utilsService: UtilsService,
    private authService: AuthService) { }

  async ngOnInit() {
    console.log("init");

  }

  async ionViewWillEnter() {
    this.initPostAndUsersData();
  }

  ionViewWillLEave(){
    this.postSubscription.unsubscribe();
  }

  async initPostAndUsersData(){
    this.dataLoaded = false;
    this.categoriesActiveFilters = [];
    this.currentUserId = await this.authService.getCurrentUserUid()
    this.postSubscription = this.postProvider.getAllPosts().subscribe(res => {
      this.posts = res.reverse();
      this.filterPostsByCategory();
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

  async goToProfile(pet: PetModel){
    this.utilsService.setDataForNavigation(pet);
    const modal = await this.modalController.create({
      component: StrangerProfileModalComponent
    });
    return await modal.present();
  }

  toogleFavourite(post: PostModel){
    if(!post.usersIdThatFavourited || !post.usersIdThatFavourited.find(userId => userId === this.currentUserId ) ){
      if(!post.usersIdThatFavourited ){
        post.usersIdThatFavourited =  [this.currentUserId]
      }else{
        post.usersIdThatFavourited.push(this.currentUserId);
      }
    }else{
      post.usersIdThatFavourited = post.usersIdThatFavourited.filter(userId => userId !== this.currentUserId);
    }
    this.postProvider.updatePost(post);
  }

  postIsFavourited(post: PostModel){
    if(!post.usersIdThatFavourited)return false;
    return !!(post.usersIdThatFavourited.find(userId => userId == this.currentUserId ));
  }

  trackByFunction(item) {
    return item.id;
  }

  async goToPreviewImg(image: string){
    await this.utilsService.goToImgPreview(image);
  }

  async openCategoriesModal(){
    const modal = await this.modalController.create({
      component: CategoriesModalComponent,
      componentProps: { categoriesSelected: JSON.parse(JSON.stringify(this.categoriesActiveFilters)), multiSelection: true}
    });
    modal.onDidDismiss().then(res => {
      if ( res ) {
        this.categoriesActiveFilters = res.data;
        this.filterPostsByCategory();
      }
    }) 
    await modal.present();
  }

  filterPostsByCategory(){
    if(this.categoriesActiveFilters.length === 0){
      this.filteredPosts = JSON.parse(JSON.stringify(this.posts));
    }else{
      this.filteredPosts = this.posts.filter(post => (post.category && this.categoriesActiveFilters.includes(post.category)));
    }
  }
  

}
