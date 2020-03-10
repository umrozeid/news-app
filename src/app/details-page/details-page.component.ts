import {Component, OnInit} from '@angular/core';
import {News} from '../news.model';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NewsFetchService} from '../news-fetch.service';
import {NewsLikeService} from '../news-like.service';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent implements OnInit {
   news: News = new News('', '', '', new Date().toISOString(), '', '', false);
   // news: News = null;
  newsArr: News[] = [];
  constructor(private router: Router,
              private route: ActivatedRoute,
              private newsFetchService: NewsFetchService,
              private newsLikeService: NewsLikeService) { }

  ngOnInit(): void {
    this.newsFetchService.newsObservable().subscribe((newsArray: News[]) => {
      this.newsArr = newsArray;
    });
    let id = +this.route.snapshot.params['id'];
    if (this.newsArr.length > id) {
      this.news = this.newsArr[id];
    } else {
      this.router.navigate(['not-found']);
    }
    this.route.params
      .subscribe((params: Params) => {
        id = +params['id'];
        if (this.newsArr.length > id) {
          this.news = this.newsArr[id];
        } else {
          this.router.navigate(['not-found']);
        }
      });
  }
  likeNews() {
    this.newsLikeService.likeNews(this.news);
  }
  unlikeNews() {
    this.newsLikeService.unlikeNews(this.news);
  }
}
