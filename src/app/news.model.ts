export class News {
    title: string;
    description: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
    sourceName: string;
    isLiked: boolean;
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
