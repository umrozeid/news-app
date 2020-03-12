import {Component, OnInit} from '@angular/core';
import {NewsFetchService} from '../news-fetch.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  fetchError = false;
  constructor(public newsFetchService: NewsFetchService, private router: Router) { }
  ngOnInit(): void {
    this.newsFetchService.newsFetchErrorObservable()
      .subscribe((err: HttpErrorResponse) => {
        this.fetchError = true;
      });
  }
  reloadPage() {
    this.router.navigate(['']);
  }
}
