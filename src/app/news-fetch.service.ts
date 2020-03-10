import {Injectable, OnDestroy} from '@angular/core';
import {News} from './news.model';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, ReplaySubject, Subject, Subscription, throwError} from 'rxjs';
import {KeywordsService} from './keywords.service';
import {NewsLikeService} from './news-like.service';

@Injectable({
  providedIn: 'root'
})
export class NewsFetchService implements OnDestroy {
  private BASE_URL = 'https://newsapi.org/v2/top-headlines?apiKey=ac02c2ebd080434a9e7b38863c747a6e&language=en';
  private keywordsSubscription: Subscription;
  private likedNewsSubscription: Subscription;
  private keywordsArr: string[] = [];
  private likedNews: News[] = [];
  private newsArr: News[] = [];
  private errorSubject: Subject<HttpErrorResponse> = new Subject<HttpErrorResponse>();
  private newsSubject: ReplaySubject<News[]> = new ReplaySubject<News[]>(1);
  constructor(private http: HttpClient, private keywordsService: KeywordsService, private newsLikeService: NewsLikeService) {
    this.newsSubject.next([]);
    this.keywordsSubscription = this.keywordsService.keywordsObservable().subscribe((keywordsArr: string[]) => {
      this.keywordsArr = keywordsArr;
      this.updateNewsArray();
    });
    this.likedNewsSubscription = this.newsLikeService.likedNewsObservable().subscribe((likedNews: News[]) => {
      this.likedNews = likedNews;
      for (const news of this.newsArr) {
        news.isLiked = false;
      }
      for (const news of this.newsArr) {
        for (const liked of this.likedNews) {
          if (news.title === liked.title) {
            news.isLiked = true;
          }
        }
      }
      this.newsSubject.next(this.newsArr);
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
            if (news.title === liked.title) {
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
  ngOnDestroy(): void {
    this.keywordsSubscription.unsubscribe();
    this.likedNewsSubscription.unsubscribe();
  }
}
