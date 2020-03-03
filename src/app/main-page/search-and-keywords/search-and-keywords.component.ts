import { Component, OnInit } from '@angular/core';
import {KeywordsService} from '../../keywords.service';

@Component({
  selector: 'app-search-and-keywords',
  templateUrl: './search-and-keywords.component.html',
  styleUrls: ['./search-and-keywords.component.css']
})
export class SearchAndKeywordsComponent implements OnInit {
  keywords: string[] = [];
  constructor(private keywordsService: KeywordsService) { }

  ngOnInit(): void {
    this.keywords = this.keywordsService.keywordsArr;
  }

}
