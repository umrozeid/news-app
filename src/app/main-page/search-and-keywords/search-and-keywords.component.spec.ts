import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAndKeywordsComponent } from './search-and-keywords.component';

describe('SearchAndKeywordsComponent', () => {
  let component: SearchAndKeywordsComponent;
  let fixture: ComponentFixture<SearchAndKeywordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchAndKeywordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchAndKeywordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
