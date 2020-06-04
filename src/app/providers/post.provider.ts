import { Observable } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { PostModel } from '../schemes/models/post.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PostProvider{

    constructor(private db: AngularFireDatabase){

    }

    getAllPosts() : Observable<PostModel[]> {
        return this.db.list<PostModel>('posts').valueChanges();
    }

    createPost(post: PostModel): Promise<void>{
        post.createdDate = Date.now();
        return this.db.object<PostModel>(`posts/${post.id}`).set(post);
    }
}