import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";

export class DocumentLoader {
  static fromUrl(url: string): BaseDocumentLoader {
    return new CheerioWebBaseLoader(url, {
      selector: "article, main, .content, #main, #post",
    });
  }

  static fromYoutubeTranscript(
    url: string,
    language: string = "en",
  ): BaseDocumentLoader {
    return YoutubeLoader.createFromUrl(url, {
      language,
      addVideoInfo: true,
    });
  }
}
