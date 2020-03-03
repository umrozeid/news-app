import { Component, OnInit } from '@angular/core';
import {NewsFetchService} from '../news-fetch.service';
import {KeywordsService} from '../keywords.service';
import {Observable, Subscription} from 'rxjs';
import {News} from '../news.model';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  newsArr: News[];
  fetchError = false;
  constructor(private newsFetchService: NewsFetchService, private router: Router) { }
  ngOnInit(): void {
    this.newsArr = this.newsFetchService.newsArr;
    this.newsFetchService.fetchErrorObservable
      .subscribe((err: HttpErrorResponse) => {
        this.fetchError = true;
      });
  }
  reloadPage() {
    this.router.navigate(['']);
  }
}
