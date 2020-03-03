import {Component, Input, OnInit} from '@angular/core';
import {KeywordsService} from '../../../keywords.service';

@Component({
  selector: 'app-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.css']
})
export class KeywordsComponent implements OnInit {
  @Input() keyword: string;
  constructor(private keywordsService: KeywordsService) { }

  ngOnInit(): void {
  }
  deleteKeyword() {
    this.keywordsService.deleteKeyword(this.keyword);
  }
}
