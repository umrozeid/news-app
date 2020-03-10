import { Component, OnInit } from '@angular/core';
import {KeywordsService} from '../../keywords.service';

@Component({
  selector: 'app-search-and-keywords',
  templateUrl: './search-and-keywords.component.html',
  styleUrls: ['./search-and-keywords.component.css']
})
export class SearchAndKeywordsComponent implements OnInit {
  constructor(public keywordsService: KeywordsService) { }

  ngOnInit(): void {
  }

}
