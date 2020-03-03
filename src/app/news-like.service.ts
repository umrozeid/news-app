import {EventEmitter, Injectable} from '@angular/core';
import {News} from './news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsLikeService {
  private NEWS_PREFIX = 'news-';
  private storage = localStorage;
  likedNews: News[] = [];
  likedNewsUpdated = new EventEmitter();
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
    this.likedNews.length = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.indexOf(this.NEWS_PREFIX) > -1) {
        this.likedNews.push(JSON.parse(this.storage.getItem(key)));
      }
    }
    this.likedNewsUpdated.emit(null);
  }
}
