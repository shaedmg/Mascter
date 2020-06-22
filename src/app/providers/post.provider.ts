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

    getAllPostByUserId(userId: string): Observable<PostModel[]> {
        return this.db.list<PostModel>('posts', ref => ref.orderByChild('userId').equalTo(userId)).valueChanges();
    }

    updatePost(post: PostModel){
        return this.db.object<PostModel>(`posts/${post.id}`).update(post);
    }
    deletePost(postId: string){
        return this.db.object<PostModel>(`posts/${postId}`).remove();
    }
}