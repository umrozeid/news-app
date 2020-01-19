//The Model

//This class is used to store info about every single news
class News {

    constructor(title, description, urlToImage, publishedAt, content, sourceName, isLiked) {
        this.title = title;
        this.description = description;
        this.urlToImage = urlToImage;
        this.publishedAt = publishedAt;
        this.content = content;
        this.sourceName = sourceName;
        this.isLiked = isLiked;
    }
}

//This class handles the process of getting  news from using the API, liking them and adding the tags
class Model {

    NEWS__PREFIX = "news-";
    storage = localStorage;
    keywords = [] ;

     getNews(url){

        let model=this;
        return new Promise(resolve => {
            let newsArray = [];
            $.getJSON(url, function (data) {
                for (let i = 0; i < data["articles"].length; i++) {
                    let news = data["articles"][i];
                    newsArray.push(new News(news.title, news.description, news.urlToImage, news.publishedAt, news.content, news.source.name, false));
                }
            }).then(function () {
                for (let i = 0; i < model.storage.length; i++) {
                    let key = model.storage.key(i);
                    if (key.indexOf(model.NEWS__PREFIX) > -1) {
                        let title = JSON.parse(model.storage.getItem(key)).title;
                        for (let i = 0; i < newsArray.length; i++) {
                            if (newsArray[i].title === title)
                                newsArray[i].isLiked = true;
                        }
                    }
                }
                resolve (newsArray);
            });
        });
    }

    getTopHeadLines() {

        let url = 'https://newsapi.org/v2/top-headlines?' +
            'country=us&' +
            'apiKey=ac02c2ebd080434a9e7b38863c747a6e';

        return this.getNews(url);
    }

    getNewsBasedOnKeywords() {

        if (this.keywords.length === 0)
            return this.getTopHeadLines();
        return new Promise( async resolve => {
            let newsArray = [];
            let url;
            let tempArray;
            for (let i = 0; i < this.keywords.length; i++) {
                url = 'https://newsapi.org/v2/top-headlines?q=';
                url += this.keywords[i];
                url += '&apiKey=ac02c2ebd080434a9e7b38863c747a6e';
                tempArray = await this.getNews(url);
                for (let i = 0; i < tempArray.length; i++)
                    for (let j = 0; j < newsArray.length; j++)
                        if (tempArray[i].title === newsArray[j].title)
                            tempArray.splice(i,1);
                newsArray.push(...tempArray);
            }

             newsArray = newsArray.sort(function compare(newsA, newsB) {
                    if (newsA.publishedAt > newsB.publishedAt) return -1;
                    if (newsB.publishedAt > newsA.publishedAt) return 1;
                    return 0;
                });
                resolve(newsArray);
        });
    }

    addKeyword(keyword) {
        this.keywords.push(keyword);
    }

    deleteKeyword(keyword) {
        this.keywords.splice(this.keywords.indexOf(keyword),1);
    }

    getKeywords(){
        return this.keywords;
    }

    likeNews(news) {
        let newsID=this.NEWS__PREFIX + news.publishedAt + news.title;
        this.storage.setItem(newsID,JSON.stringify(news));
    }

    unlikeNews(news) {
        let newsID=this.NEWS__PREFIX + news.publishedAt + news.title;
        this.storage.removeItem(newsID);
    }

}

//The View

//This class takes care of rendering news
class NewsView{

    constructor(viewDetailsClick, likeNewsClick, unlikeNewsClick) {
        this.viewDetailsClick = viewDetailsClick;
        this.likeNewsClick = likeNewsClick;
        this.unlikeNewsClick=unlikeNewsClick;
    }

    //This method renders single news tile
    renderNewsTile(news) {

        let $element = $("#news-tile-template").clone().contents();
        // $(".tile-image").attr("src",news.urlToImage);
        $(".tile-title", $element).text(news.title);
        $(".tile-text", $element).text(news.description);
        $(".tile-publishing-time", $element).text(this.timeSincePublishing(news.publishedAt));
        $(".tile-source", $element).text(news.sourceName);
        $(".tile-image", $element).attr("src",news.urlToImage);
        if (news.isLiked) {
            let $unlike = $(".unlike", $element);
            $unlike.on("click", function () {
                this.unlikeNewsClick(news);
            }.bind(this));
            $unlike.removeClass("d-none");
        }else {
            let $like = $(".like", $element);
            $like.on("click",function () {
                this.likeNewsClick(news);
            }.bind(this));
            $like.removeClass("d-none");
        }
        $(".click-to-show-details", $element).on("click", function () {
            this.viewDetailsClick(news);
        }.bind(this));
        return $element;
    }

    //This method renders all news list add add them to their container
    renderNewsList(newsArray){
        let $container = $("#news-tiles-container");
        $container.html("");
        for (let i = 0; i < newsArray.length; i++){
            $container.append(this.renderNewsTile(newsArray[i]));
        }
    }

    //This method takes care of showing the details of a specific news
    showNewsDetails(news){
        $("#details-title").text(news.title);
        $("#details-image").attr("src",news.urlToImage);
        $("#details-content").text(news.content);
        $("#details-publishing-time").text(this.formatPublishingTime(news.publishedAt));
        let $unlike = $("#details-container .unlike");
        let $like = $("#details-container .like");

        $unlike.on("click", function () {
            this.unlikeNewsClick(news);
            $like.removeClass("d-none");
            $unlike.addClass("d-none");
        }.bind(this));

        $like.on("click", function () {
            this.likeNewsClick(news);
            $unlike.removeClass("d-none");
            $like.addClass("d-none");
        }.bind(this));

        if (news.isLiked) {
            $unlike.removeClass("d-none");
            $like.addClass("d-none");
        }else {
            $like.removeClass("d-none");
            $unlike.addClass("d-none");
        }
        $("#go-back-button").on("click",function () {
            $("#details-container").addClass("d-none");
            $("#main-container").removeClass("d-none");
        });
        $("#main-container").addClass("d-none");
        $("#details-container").removeClass("d-none");
    }

    //Shows time since specific instance as 11h or 5m
    timeSincePublishing(newsPublishedAt) {
        const MILLISECONDS_IN_MINUTE = 60 * 1000;
        const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE;
        const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;
        const MILLISECONDS_IN_MONTH = 30 * MILLISECONDS_IN_DAY;
        const MILLISECONDS_IN_YEAR = 365 * MILLISECONDS_IN_MONTH;
        let publishingDate = new Date(newsPublishedAt);
        let currentDate = new Date();
        let timeDiff = currentDate.getTime()-publishingDate.getTime();
        if (timeDiff < MILLISECONDS_IN_MINUTE)
            return "now";
        else if (timeDiff < MILLISECONDS_IN_HOUR)
            return Math.round(timeDiff/MILLISECONDS_IN_MINUTE) + "m";
        else if (timeDiff < MILLISECONDS_IN_DAY)
            return Math.round(timeDiff/MILLISECONDS_IN_HOUR) + "h";
        else if (timeDiff < MILLISECONDS_IN_MONTH)
            return Math.round(timeDiff/MILLISECONDS_IN_DAY) + "d";
        else if (timeDiff < MILLISECONDS_IN_YEAR)
            return Math.round(timeDiff/MILLISECONDS_IN_MONTH) + " months";
        else
            return Math.round(timeDiff/MILLISECONDS_IN_YEAR) + " years";
    }

    //Shows date in a format as 25 January 2020
    formatPublishingTime(newsPublishedAt){
        const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let publishingDate = new Date(newsPublishedAt);
        return publishingDate.getDate() + " " + MONTHS [publishingDate.getMonth()] + " " + publishingDate.getFullYear();
    }
}

//This class takes care of viewing the keywords
class KeyWordView {

    constructor(deleteKeywordClick) {
        this.deleteKeywordClick=deleteKeywordClick;
    }

    renderKeyword(keyword){
        let $element = $("#keyword-template").clone().contents();
        $(".keyword-text", $element).text(keyword);
        $(".keyword-delete", $element).on("click",function () {
            this.deleteKeywordClick(keyword);
        }.bind(this));
        return $element;
    }

    renderKeywordsList(keywordsArray){
        let $container = $("#keywords-container");
        $container.html("");
        for (let i = 0; i < keywordsArray.length; i++){
            $container.append(this.renderKeyword(keywordsArray[i]));
        }
    }

}

//The Controller

class Controller{
    constructor() {
        this.model = new Model();
        this.newsView = new NewsView(this.viewDetails.bind(this), this.likeNews.bind(this), this.unlikeNews.bind(this));
        this.keywordView = new KeyWordView(this.deleteKeyword.bind(this));
    }

    loadNews() {
        let controller = this;
        controller.model.getNewsBasedOnKeywords().then( response => {
            controller.newsView.renderNewsList(response);
        });
    }

    loadKeywords() {
        let keywords = this.model.getKeywords();
        this.keywordView.renderKeywordsList(keywords);
    }

    likeNews(news) {
        this.model.likeNews(news);
        this.loadNews();
    }

    unlikeNews(news) {
        this.model.unlikeNews(news);
        this.loadNews();
    }

    viewDetails(news) {
        this.newsView.showNewsDetails(news);
    }

    deleteKeyword(keyword) {
        this.model.deleteKeyword(keyword);
        this.loadKeywords();
        this.loadNews();
    }

    addKeyword(keyword) {
        this.model.addKeyword(keyword);
        this.loadKeywords();
        this.loadNews();
    }

}

$(document).ready(function () {

    let controller = new Controller();

    $("#search-input").on("keypress", function (e) {
        let $inputField = $(this);
        if (e.key === "Enter" && $inputField.val()) {
            controller.addKeyword($inputField.val());
            $inputField.val("");
        }
    });

    controller.loadNews();
});