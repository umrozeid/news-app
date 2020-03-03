import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeywordsService {
  private CATEGORY_PREFIX = 'category-';
  private storage = localStorage;
  keywordsArr: string[] = [];
  keywordsUpdated = new EventEmitter();
  constructor() {
    this.getKeywords();
  }
  addKeyword(keyword) {
    const categoryID = this.CATEGORY_PREFIX + keyword;
    this.storage.setItem(categoryID, keyword);
    this.getKeywords();
  }

  deleteKeyword(keyword) {
    const categoryID = this.CATEGORY_PREFIX + keyword;
    this.storage.removeItem(categoryID);
    this.getKeywords();
  }

  private getKeywords() {
    this.keywordsArr.length = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.indexOf(this.CATEGORY_PREFIX) > -1) {
        this.keywordsArr.push(this.storage.getItem(key));
      }
    }
    this.keywordsUpdated.emit(null);
  }
}
