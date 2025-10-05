import "cheerio";
import type { Document } from "@langchain/core/documents";

import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { z } from "zod";

export class DocumentChat {
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;
  private graphWithMemory: any;
  private userId: string | undefined;

  constructor(
    private embeddingNameSpace: string,
    private summary?: string,
  ) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });

    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      dimensions: 1536,
    });
  }

  async initializeChat(userId: string) {
    this.userId = userId;

    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex: pinecone.Index(process.env.PINECONE_INDEX!),
      namespace: this.embeddingNameSpace,
    });

    const retrieveSchema = z.object({ query: z.string() });

    const retrieve = tool(
      async ({ query }: { query: string }): Promise<[string, Document[]]> => {
        const retrievedDocs: Document[] = await vectorStore.similaritySearch(
          query,
          3,
        );
        const serialized: string = retrievedDocs
          .map(
            (doc: Document) =>
              `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`,
          )
          .join("\n");
        return [serialized, retrievedDocs];
      },
      {
        name: "retrieve",
        description: "Retrieve information related to a query.",
        schema: retrieveSchema,
        responseFormat: "content_and_artifact",
      },
    );

    const tools = new ToolNode([retrieve]);

    const queryOrRespond = async (state: typeof MessagesAnnotation.State) => {
      const llmWithTools = this.llm.bindTools([retrieve]);
      const response = await llmWithTools.invoke(state.messages);
      // MessagesState appends messages to state instead of overwriting
      return { messages: [response] };
    };

    // Step 3: Generate a response using the retrieved content.
    const generate = async (state: typeof MessagesAnnotation.State) => {
      // Get generated ToolMessages
      const recentToolMessages: ToolMessage[] = [];
      for (let i = state["messages"].length - 1; i >= 0; i--) {
        const message = state["messages"][i];
        if (message instanceof ToolMessage) {
          recentToolMessages.push(message);
        } else {
          break;
        }
      }
      const toolMessages = recentToolMessages.reverse();

      // Format into prompt
      const docsContent = toolMessages.map((doc) => doc.content).join("\n");
      const systemMessageContent =
        "You are an assistant for question-answering tasks. " +
        "Use the following pieces of retrieved context to answer " +
        "the question. If you don't know the answer, say that you " +
        "don't know. Use three sentences maximum and keep the " +
        "answer concise." +
        "\n\n" +
        `${docsContent}`;

      const conversationMessages = state.messages.filter(
        (message: BaseMessage) =>
          message instanceof HumanMessage ||
          message instanceof SystemMessage ||
          (message instanceof AIMessage && message?.tool_calls?.length == 0),
      );
      const prompt = [
        new SystemMessage(systemMessageContent),
        ...conversationMessages,
      ];

      // Run
      const response = await this.llm.invoke(prompt);
      return { messages: [response] };
    };

    const classifyQuery = async (state: typeof MessagesAnnotation.State) => {
      const lastUserMsg = state.messages[state.messages.length - 1];
      const classificationPrompt = [
        new SystemMessage(
          "Classify the user query as 'global' if it asks about the overall document (summary, topics, what it's about), otherwise 'local'. Respond with only one word: 'global' or 'local'.",
        ),
        lastUserMsg,
      ];
      const response = await this.llm.invoke(classificationPrompt);
      const content = response.content.toString().toLowerCase();

      return content.includes("global")
        ? { decision: "global" }
        : { decision: "local" };
    };

    const useSummary = async (state: typeof MessagesAnnotation.State) => {
      const lastMessage = state.messages[state.messages.length - 1];
      const summaryText = this.summary ?? "No Summary Data";
      const systemMessage = new SystemMessage(
        "You are a helpful assistant. Use the provided summary to answer concisely.",
      );
      const summaryMessage = new SystemMessage(
        `Document Summary:\n${summaryText}`,
      );

      const response = await this.llm.invoke([
        systemMessage,
        lastMessage,
        summaryMessage,
      ]);

      return { messages: [response] };
    };

    // Extend MessagesAnnotation.State to include 'decision' property for type safety
    type StateWithDecision = typeof MessagesAnnotation.State & {
      decision?: string;
    };

    const graphBuilder = new StateGraph(MessagesAnnotation)
      .addNode("classifyQuery", classifyQuery)
      .addNode("queryOrRespond", queryOrRespond)
      .addNode("tools", tools)
      .addNode("generate", generate)
      .addNode("useSummary", useSummary)

      .addEdge("__start__", "classifyQuery")
      .addConditionalEdges("classifyQuery", (state: StateWithDecision) => {
        return state.decision === "local" ? "queryOrRespond" : "useSummary";
      })
      .addEdge("useSummary", "__end__")

      .addConditionalEdges("queryOrRespond", toolsCondition, {
        __end__: "__end__",
        tools: "tools",
      })
      .addEdge("tools", "generate")
      .addEdge("generate", "__end__");

    const checkPointer = PostgresSaver.fromConnString(
      process.env.DATABASE_URL!,
    );

    await checkPointer.setup();

    this.graphWithMemory = graphBuilder.compile({
      checkpointer: checkPointer as any,
    });
  }

  async sendMessage(threadId: string, message: string): Promise<BaseMessage[]> {
    const input = { messages: [new HumanMessage(message)] };
    const config = {
      configurable: { thread_id: threadId, user_id: this.userId! },
      streamMode: "values" as const,
    };

    const messages: BaseMessage[] = [];

    for await (const step of await this.graphWithMemory.stream(input, config)) {
      const lastMessage = step.messages[step.messages.length - 1];
      if (
        lastMessage instanceof HumanMessage ||
        lastMessage instanceof AIMessage
      ) {
        if (
          !messages.find((item) => item.id === lastMessage.id) &&
          lastMessage.content.length > 0
        ) {
          messages.push(lastMessage);
        }
      }
    }

    return messages;
  }
}
