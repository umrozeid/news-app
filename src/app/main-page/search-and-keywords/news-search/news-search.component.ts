import { Component, OnInit } from '@angular/core';
import {KeywordsService} from '../../../keywords.service';

@Component({
  selector: 'app-news-search',
  templateUrl: './news-search.component.html',
  styleUrls: ['./news-search.component.css']
})
export class NewsSearchComponent implements OnInit {

  constructor(private keywordsService: KeywordsService) { }

  ngOnInit(): void {
  }
  addKeyword(event: Event) {
    const keywordInput = event.target as HTMLInputElement;
    if ( keywordInput.value ) {
      this.keywordsService.addKeyword(keywordInput.value);
      keywordInput.value = '';
    }
  }
}
