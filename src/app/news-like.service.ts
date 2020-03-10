import {Injectable} from '@angular/core';
import {News} from './news.model';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsLikeService {
  private NEWS_PREFIX = 'news-';
  private storage = localStorage;
  private likedSubject: BehaviorSubject<News[]> = new BehaviorSubject<News[]>([]);
  constructor() {
    this.getLikedNews();
  }
  likeNews(news) {
    const newsID = this.NEWS_PREFIX + news.publishedAt + news.title;
    this.storage.setItem(newsID, JSON.stringify(news));
    this.getLikedNews();
  }
  unlikeNews(news) {
    const newsID = this.NEWS_PREFIX + news.publishedAt + news.title;
    this.storage.removeItem(newsID);
    this.getLikedNews();
  }
  private getLikedNews() {
   const likedNews = [];
   for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.indexOf(this.NEWS_PREFIX) > -1) {
        likedNews.push(JSON.parse(this.storage.getItem(key)));
      }
    }
   this.likedSubject.next(likedNews);
  }
  public likedNewsObservable(): Observable<News[]> {
    return  this.likedSubject.asObservable();
  }
}
