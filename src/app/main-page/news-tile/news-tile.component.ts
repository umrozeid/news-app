import {Component, Input, OnInit} from '@angular/core';
import {News} from '../../news.model';
import * as moment from 'moment';
import {NewsLikeService} from '../../news-like.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-news-tile',
  templateUrl: './news-tile.component.html',
  styleUrls: ['./news-tile.component.css']
})
export class NewsTileComponent implements OnInit {
  @Input() news: News = null;
  @Input() index: number;
  timeFromNow;
  constructor(private newsLikeService: NewsLikeService, private router: Router) { }

  ngOnInit(): void {
    this.setMomentLibrarySettings();
    this.timeFromNow = moment(this.news.publishedAt).fromNow();
    setInterval(() => {
      this.timeFromNow = moment(this.news.publishedAt).fromNow();
    }, 1000);
  }
  private setMomentLibrarySettings() {
    // Updating moment js format for relative time
    moment.updateLocale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s',
        s: '1s',
        ss: '%ds',
        m: '1m',
        mm: '%dm',
        h: '1h',
        hh: '%dh',
        d: '1d',
        dd: '%dd',
        M: '1m',
        MM: '%dmo',
        y: '1y',
        yy: '%d y'
      }
    });
  }
  likeNews() {
    this.newsLikeService.likeNews(this.news);
  }
  unlikeNews() {
    this.newsLikeService.unlikeNews(this.news);
  }
  showDetails() {
    this.router.navigate(['news', this.index]);
  }
}