import {Injectable, OnDestroy} from '@angular/core';
import {News} from './news.model';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {forkJoin, Observable, ReplaySubject, Subject, Subscription} from 'rxjs';
import {KeywordsService} from './keywords.service';

@Injectable({
  providedIn: 'root'
})
export class NewsFetchService implements OnDestroy {
  private BASE_URL = 'https://newsapi.org/v2/top-headlines?apiKey=ac02c2ebd080434a9e7b38863c747a6e&language=en';
  private keywordsSubscription: Subscription;
  private NEWS_PREFIX = 'news-';
  private storage = localStorage;
  private keywordsArr: string[] = [];
  private likedNews: News[] = [];
  private newsArr: News[] = [];
  private errorSubject: Subject<HttpErrorResponse> = new Subject<HttpErrorResponse>();
  private newsSubject: ReplaySubject<News[]> = new ReplaySubject<News[]>(1);
  constructor(private http: HttpClient, private keywordsService: KeywordsService) {
    this.newsSubject.next([]);
    this.keywordsSubscription = this.keywordsService.keywordsObservable().subscribe((keywordsArr: string[]) => {
      this.keywordsArr = keywordsArr;
      this.updateNewsArray();
    });
    this.updateNewsArray();
  }
  public newsObservable(): Observable<News[]> {
    return this.newsSubject.asObservable();
  }
  public  newsFetchErrorObservable(): Observable<HttpErrorResponse> {
    return this.errorSubject.asObservable();
  }
  private fetchNews(url: string): Observable<any> {
    return this.http.get(url)
      .pipe(map(responseData => {
        const newsArr: News[] = [];
        for (const news of responseData['articles']) {
          newsArr.push(new News(news.title, news.description, news.urlToImage, news.publishedAt, news.content, news.source.name, false));
        }
        for (const news of newsArr) {
          for (const liked of this.likedNews) {
            if (news.title === liked.title && news.sourceName === liked.sourceName && news.publishedAt === liked.publishedAt) {
              news.isLiked = true;
            }
          }
        }
        return newsArr;
      }), catchError( err => {
        this.errorSubject.next(err);
        return [];
      }));
  }
  private getNewsBasedOnKeywords(): Observable<any> {
    if (this.keywordsArr.length === 0) {
      return this.fetchNews(this.BASE_URL);
    }
    const observablesArr: Observable<any>[] = [];
    let url;
    for (const keyword of this.keywordsArr) {
      url = this.BASE_URL + '&q=' + encodeURIComponent(keyword);
      observablesArr.push(this.fetchNews(url));
    }
    return forkJoin(observablesArr)
      .pipe(map((responseData: News[][]) => {
        const newsArr: News[] = [];
        for (const arr of responseData) {
          for (let i = 0; i < arr.length; i++) {
            for (const item of newsArr) {
              if (arr[i].title === item.title) {
                arr.splice(i, 1);
              }
            }
            newsArr.push(...arr);
          }
        }
        return newsArr.sort(function compare(newsA, newsB) {
          if (newsA.publishedAt > newsB.publishedAt) { return -1; }
          if (newsB.publishedAt > newsA.publishedAt) { return 1; }
          return 0;
        });
    }));
  }
  private updateNewsArray() {
    this.getNewsBasedOnKeywords().subscribe((responseArr: News[]) => {
      this.newsArr = responseArr;
      this.newsSubject.next(responseArr);
    });
  }
  likeNews(news: News) {
    const newsID = this.NEWS_PREFIX + news.publishedAt + news.title + news.sourceName;
    this.storage.setItem(newsID, JSON.stringify(news));
    this.getLikedNews();
  }
  unlikeNews(news: News) {
    const newsID = this.NEWS_PREFIX + news.publishedAt + news.title + news.sourceName;
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
    this.likedNews = likedNews;
    for (const news of this.newsArr) {
      news.isLiked = false;
    }
    for (const news of this.newsArr) {
      for (const liked of this.likedNews) {
        if (news.title === liked.title && news.sourceName === liked.sourceName && news.publishedAt === liked.publishedAt) {
          news.isLiked = true;
        }
      }
    }
    this.newsSubject.next(this.newsArr);
  }
  ngOnDestroy(): void {
    this.keywordsSubscription.unsubscribe();
  }
}
