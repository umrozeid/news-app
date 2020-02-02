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

    NEWS_PREFIX = "news-";
    CATEGORY_PREFIX="category-";
    storage = localStorage;
    BASE_URL='https://newsapi.org/v2/top-headlines?apiKey=ac02c2ebd080434a9e7b38863c747a6e&language=en';

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
                    if (key.indexOf(model.NEWS_PREFIX) > -1) {
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

    async getNewsBasedOnKeywords() {
        let keywords = await this.getKeywords();
        if (keywords.length === 0)
            return this.getNews(this.BASE_URL);
        return new Promise(async resolve => {
            let newsArray = [];
            let url;
            let tempArray;
            for (let i = 0; i < keywords.length; i++) {
                url = this.BASE_URL + '&q=' + encodeURIComponent(keywords[i]);
                tempArray = await this.getNews(url);
                for (let i = 0; i < tempArray.length; i++)
                    for (let j = 0; j < newsArray.length; j++)
                        if (tempArray[i].title === newsArray[j].title)
                            tempArray.splice(i, 1);
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
         let categoryID = this.CATEGORY_PREFIX + keyword;
         this.storage.setItem(categoryID,keyword);
    }

    deleteKeyword(keyword) {
        let categoryID = this.CATEGORY_PREFIX + keyword;
        this.storage.removeItem(categoryID);
    }

    getKeywords(){
         let model = this;
         return new Promise(resolve => {
             let keywords=[];
             for (let i = 0; i < model.storage.length; i++) {
                 let key = model.storage.key(i);
                 if (key.indexOf(model.CATEGORY_PREFIX) > -1) {
                     keywords.push(model.storage.getItem(key));
                 }
             }
             resolve(keywords);
         });
    }

    likeNews(news) {
        let newsID=this.NEWS_PREFIX + news.publishedAt + news.title;
        this.storage.setItem(newsID,JSON.stringify(news));
    }

    unlikeNews(news) {
        let newsID=this.NEWS_PREFIX + news.publishedAt + news.title;
        this.storage.removeItem(newsID);
    }

    setScrollPosition(){
        this.storage.setItem("newsScrollPosition",$(document).scrollTop());
    }

    getScrollPosition(){
         let scrollTop = this.storage.newsScrollPosition;
         if (scrollTop !== null)
             return scrollTop;
         else
             return 0;
     }

}

//The View

class Page{

    constructor(elementID) {
        this.elementID = elementID;
    }

    showPage() {
        $(this.elementID).removeClass("d-none");
    }

    hidePage() {
        $(this.elementID).addClass("d-none");
    }
}
//This class takes care of rendering news
class NewsView{

    constructor(viewDetailsClick, likeNewsClick, unlikeNewsClick, goBackClick) {
        this.viewDetailsClick = viewDetailsClick;
        this.likeNewsClick = likeNewsClick;
        this.unlikeNewsClick = unlikeNewsClick;
        this.goBackClick = goBackClick;
    }

    //This method renders single news tile
    renderNewsTile(news) {

        let $element = $("#news-tile-template").clone().contents();
        $(".tile-title", $element).text(news.title);
        $(".tile-text", $element).text(news.description);
        $(".tile-publishing-time", $element).text(moment(news.publishedAt).fromNow());
        setInterval(function (){
            $(".tile-publishing-time", $element).text(moment(news.publishedAt).fromNow());
        },1000);
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
    updateNewsDetails(news) {
        $(document).scrollTop(0);
        $("#details-title").text(news.title);
        $("#details-image").attr("src",news.urlToImage);
        $("#details-image-lightbox").attr("href",news.urlToImage);
        $("#details-content").text(news.content);
        $("#details-publishing-time").text(moment(news.publishedAt).format("DD MMMM YYYY"));
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
            this.goBackClick();
            // $("#details-container").addClass("d-none");
            // $("#main-container").removeClass("d-none");
            //Unbinding event handlers from elements in details page
            $("#go-back-button").off();
            $like.off();
            $unlike.off();
        }.bind(this));
        // $("#main-container").addClass("d-none");
        // $("#details-container").removeClass("d-none");
    }
}

//This class takes care of viewing the keywords
class KeyWordView {

    constructor(deleteKeywordClick) {
        this.deleteKeywordClick=deleteKeywordClick;
    }

    renderKeyword(keyword) {
        let $element = $("#keyword-template").clone().contents();
        $(".keyword-text", $element).text(keyword);
        $(".keyword-delete", $element).on("click",function () {
            this.deleteKeywordClick(keyword);
        }.bind(this));
        return $element;
    }

    renderKeywordsList(keywordsArray) {
        let $container = $("#keywords-container");
        $container.html("");
        for (let i = 0; i < keywordsArray.length; i++){
            $container.append(this.renderKeyword(keywordsArray[i]));
        }
    }

}

//The Controller

class Router{

    constructor(controller) {
        this.controller = controller;
        this.mainPage = new Page("#main-container");
        this.detailsPage = new Page("#details-container");
        let router = this;
        this.routes = {
            '/' : router.showMainPage.bind(router)
            ,'/details': router.showDetailsPage.bind(router)
        };
        this.attachURLListener();
    }

    router() {
        // Getting the part after the # if there is none we assign / to url  get to main
        let url = location.hash.slice(1).toLowerCase() || '/';
        if (this.routes[url] !== undefined)
            this.routes[url] ();
    }

    attachURLListener(){
        $(window).on("hashchange", () => {
            this.router();
        });
        $(window).on("load", () => {
            this.router();
        });
    }

    showMainPage(){
        this.mainPage.showPage();
        this.detailsPage.hidePage();
        $(document).scrollTop(this.controller.model.getScrollPosition());
        this.controller.attachScrollPositionSaveToWindow();
    }

    showDetailsPage(){
        this.detailsPage.showPage();
        this.mainPage.hidePage();
    }
}

class Controller{
    constructor() {
        this.model = new Model();
        this.newsView = new NewsView(this.viewDetails.bind(this), this.likeNews.bind(this), this.unlikeNews.bind(this), this.goBack.bind(this));
        this.keywordView = new KeyWordView(this.deleteKeyword.bind(this));
        this.Router = new Router(this);
        this.setMomentLibrarySettings();
    }

    async loadNews() {
        this.attachScrollPositionSaveToWindow();
        let news = await this.model.getNewsBasedOnKeywords();
        let keywords = await this.model.getKeywords();
        this.newsView.renderNewsList(news);
        this.keywordView.renderKeywordsList(keywords);
    }

    async loadKeywords() {
        let keywords = await this.model.getKeywords();
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
        $(window).off("scroll");
        this.newsView.updateNewsDetails(news);
        window.location.hash = "#/details";
    }

    initializeDetails() {
        this.newsView.updateNewsDetails(new News("Press Go Back Button to Get to Main Page","","",new Date(),"","",false));
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

    attachScrollPositionSaveToWindow(){
        $(window).on("scroll",function () {
            this.model.setScrollPosition();
        }.bind(this));
    }

    goBack(){
        window.location.hash = "#";
        this.attachScrollPositionSaveToWindow();
        $(document).scrollTop(this.model.getScrollPosition());
    }

    setMomentLibrarySettings(){
        //Updating moment js format for relative time
        moment.updateLocale('en', {
            relativeTime : {
                future: "in %s",
                past:   "%s",
                s  : '1s',
                ss : '%ds',
                m:  "1m",
                mm: "%dm",
                h:  "1h",
                hh: "%dh",
                d:  "1d",
                dd: "%dd",
                M:  "1m",
                MM: "%dmo",
                y:  "1y",
                yy: "%d y"
            }
        });
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

    /*
    //Code to set fixed div width as parent width if I used position:fixed instead of sticky
    let width = $(".left-fixed-part").parent().width();
    $(".left-fixed-part").width(width);

    $(window).on("resize", function () {
        let width = $(".left-fixed-part").parent().width();
        $(".left-fixed-part").width(width);
    });
    */

    controller.loadNews();
    controller.initializeDetails();
});