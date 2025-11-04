import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";

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

  static fromRawText(text: string): BaseDocumentLoader {
    return new StringDocumentLoader(text);
  }
}

class StringDocumentLoader extends BaseDocumentLoader {
  private text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  async load() {
    return [
      new Document({
        pageContent: this.text,
        metadata: { source: "raw_text" },
        // TODO: add supplied metadata
      }),
    ];
  }
}
