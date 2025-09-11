import { DocFlashCardQuestion } from "@/drizzle/types";
import { shuffleArray } from "@/lib/utils";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export type FlashCardFromAI = Pick<DocFlashCardQuestion, "question" | "answer">;

export class FlashCardService {
  private splitterDocs: Document<Record<string, any>>[] = [];
  private llm: ChatOpenAI;

  constructor(
    private docSummary: string,
    private url: string,
  ) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });
  }

  async initialize() {
    const pTagSelector = "article, main, .content, #main, #post";
    const cheerioLoader = new CheerioWebBaseLoader(this.url, {
      selector: pTagSelector,
    });

    const docs = await cheerioLoader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    this.splitterDocs = await splitter.splitDocuments(docs);
  }

  async generateFlashCards(numberOfFlashCards: number) {
    const flashCardsFromSummary = Math.ceil(numberOfFlashCards * 0.3);
    const flashCardsFromChunk = numberOfFlashCards - flashCardsFromSummary;
    let flashcards: FlashCardFromAI[] = [];

    const promptForSummary = PromptTemplate.fromTemplate(`
      You are an assistant that creates flashcards.
      Given the following context, generate ${flashCardsFromSummary} flashcards with question and answer.
      return json objects with properties question, answer. Return only the json and nothings else so that we can use JSON.parse the content
      doc_summary: {summary}
    `);

    const promptForChunk = PromptTemplate.fromTemplate(`
      You are an assistant that creates flashcards.
      Given the following context, generate {numberOfFlashCards} flashcards with question and answer.
      return json object list with each object having properties question, answer. Return only the json and nothings else so that we can use JSON.parse the content
      context: {context}
    `);

    const res = await this.llm.invoke(
      await promptForSummary.invoke({ summary: this.docSummary }),
    );

    flashcards = JSON.parse(res.content as string);

    const totalChunks = this.splitterDocs.length;
    const shuffledChunks = shuffleArray(this.splitterDocs);
    let maxAttempt = flashCardsFromChunk;

    if (totalChunks * 2 >= flashCardsFromChunk) {
      for (const chunk of shuffledChunks) {
        maxAttempt -= 1;
        const res = await this.llm.invoke(
          await promptForChunk.invoke({
            numberOfFlashCards: 2,
            context: chunk.pageContent,
          }),
        );
        const content = (res.content as string)
          .replace("```json", "")
          .replace("```", "");
        flashcards = [...flashcards, ...JSON.parse(content)];

        if (flashcards.length >= numberOfFlashCards || maxAttempt <= 0) break;
      }
    } else {
      const flashcardPerChunk = Math.round(flashCardsFromChunk / totalChunks);
      while (maxAttempt > 0 && flashcards.length < numberOfFlashCards) {
        for (const chunk of shuffledChunks) {
          maxAttempt -= 1;
          const res = await this.llm.invoke(
            await promptForChunk.invoke({
              numberOfFlashCards: flashcardPerChunk,
              context: chunk.pageContent,
            }),
          );

          const content = (res.content as string)
            .replace("```json", "")
            .replace("```", "");
          flashcards = [...flashcards, ...JSON.parse(content)];

          if (maxAttempt <= 0 || flashcards.length >= numberOfFlashCards) break;
        }
      }
    }
    return shuffleArray(flashcards.slice(0, numberOfFlashCards));
  }
}
