import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NewsTileComponent } from './main-page/news-tile/news-tile.component';
import { NewsSearchComponent } from './main-page/search-and-keywords/news-search/news-search.component';
import { KeywordsComponent } from './main-page/search-and-keywords/keywords/keywords.component';
import { SearchAndKeywordsComponent } from './main-page/search-and-keywords/search-and-keywords.component';
import { MainPageComponent } from './main-page/main-page.component';
import { DetailsPageComponent } from './details-page/details-page.component';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    NewsTileComponent,
    NewsSearchComponent,
    KeywordsComponent,
    SearchAndKeywordsComponent,
    MainPageComponent,
    DetailsPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
