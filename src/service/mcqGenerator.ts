import { DocQuizQuestion, DocumentMeta } from "@/drizzle/types";
import { shuffleArray } from "@/lib/utils";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DocumentLoader } from "./documentLoader";

export type QuizQuestionFromAI = Omit<
  DocQuizQuestion,
  "id" | "createdAt" | "updatedAt" | "quizId"
>;

export class MCQGenerator {
  private splitterDocs: Document<Record<string, any>>[] = [];
  private llm: ChatOpenAI;

  constructor(private docSummary: string) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });
  }

  async initialize(loader: BaseDocumentLoader) {
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    this.splitterDocs = await splitter.splitDocuments(docs);
  }

  async generateMcq(numberOfMCQ: number) {
    const mcqFromSummary = Math.ceil(numberOfMCQ * 0.3);
    const mcqFromChunk = numberOfMCQ - mcqFromSummary;
    let mcq: DocQuizQuestion[] = [];

    const promptForSummary = PromptTemplate.fromTemplate(`
      You are an assistant that creates multiple-choice questions.
      Given the following context, generate ${mcqFromSummary} multiple choice questions with 4 options each.
      return json objects with properties question, a, b, c, d, answer. Return only the json and nothings else so that we can use JSON.parse the content
      doc_summary: {summary}
    `);

    const promptForChunk = PromptTemplate.fromTemplate(`
      You are an assistant that creates multiple-choice questions.
      Given the following context, generate {numberOfMcq} multiple choice questions with 4 options each.
      return json object list with each object having properties question, a, b, c, d, answer. Return only the json and nothings else so that we can use JSON.parse the content
      context: {context}
    `);

    const res = await this.llm.invoke(
      await promptForSummary.invoke({ summary: this.docSummary }),
    );

    mcq = JSON.parse(res.content as string);

    const totalChunks = this.splitterDocs.length;
    const shuffledChunks = shuffleArray(this.splitterDocs);
    let maxAttempt = mcqFromChunk;

    if (totalChunks * 2 >= mcqFromChunk) {
      for (const chunk of shuffledChunks) {
        maxAttempt -= 1;
        const res = await this.llm.invoke(
          await promptForChunk.invoke({
            numberOfMcq: 2,
            context: chunk.pageContent,
          }),
        );
        const content = (res.content as string)
          .replace("```json", "")
          .replace("```", "");
        mcq = [...mcq, ...JSON.parse(content)];

        if (mcq.length >= numberOfMCQ || maxAttempt <= 0) break;
      }
    } else {
      const mcqPerChunk = Math.round(mcqFromChunk / totalChunks);
      while (maxAttempt > 0 && mcq.length < numberOfMCQ) {
        for (const chunk of shuffledChunks) {
          maxAttempt -= 1;
          const res = await this.llm.invoke(
            await promptForChunk.invoke({
              numberOfMcq: mcqPerChunk,
              context: chunk.pageContent,
            }),
          );

          const content = (res.content as string)
            .replace("```json", "")
            .replace("```", "");
          mcq = [...mcq, ...JSON.parse(content)];

          if (maxAttempt <= 0 || mcq.length >= numberOfMCQ) break;
        }
      }
    }
    return shuffleArray(mcq.slice(0, numberOfMCQ));
  }
}

export async function generateMCQFromWebUrl(
  url: string,
  docSummary: string,
  numberOfMCQ: number,
): Promise<QuizQuestionFromAI[]> {
  const mcqGen = new MCQGenerator(docSummary);
  await mcqGen.initialize(DocumentLoader.fromUrl(url));
  const mcq: QuizQuestionFromAI[] = await mcqGen.generateMcq(numberOfMCQ);

  return mcq;
}

export async function generateMCQFromYoutubeUrl(
  url: string,
  docSummary: string,
  numberOfMCQ: number,
): Promise<QuizQuestionFromAI[]> {
  const loader = DocumentLoader.fromYoutubeTranscript(url);
  const mcqGen = new MCQGenerator(docSummary);
  await mcqGen.initialize(loader);
  const mcq: QuizQuestionFromAI[] = await mcqGen.generateMcq(numberOfMCQ);

  return mcq;
}

export async function generateMCQ(
  documentMeta: DocumentMeta,
  docSummary: string,
  numberOfMCQ: number,
): Promise<QuizQuestionFromAI[]> {
  if (documentMeta.type === "webUrl") {
    return await generateMCQFromWebUrl(
      documentMeta.url,
      docSummary,
      numberOfMCQ,
    );
  } else if (documentMeta.type === "youtube") {
    return await generateMCQFromYoutubeUrl(
      documentMeta.url,
      docSummary,
      numberOfMCQ,
    );
  } else {
    throw new Error(
      "MCQ generation is only supported for webUrl and youtube document types.",
    );
  }
}
