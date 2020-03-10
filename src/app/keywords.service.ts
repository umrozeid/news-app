import { Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeywordsService {
  private CATEGORY_PREFIX = 'category-';
  private storage = localStorage;
  private keywordsSubject: BehaviorSubject<string []> = new BehaviorSubject<string[]>([]);
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
    const keywordsArr = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.indexOf(this.CATEGORY_PREFIX) > -1) {
        keywordsArr.push(this.storage.getItem(key));
      }
    }
    this.keywordsSubject.next(keywordsArr);
  }
  public keywordsObservable(): Observable<string[]> {
    return this.keywordsSubject.asObservable();
  }
}
