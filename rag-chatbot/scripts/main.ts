import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { Page, Browser } from "puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import dotenv from "dotenv";
import { Collection, DataAPIClient } from "@datastax/astra-db-ts";

dotenv.config();

const animeData = [
  "https://ja.wikipedia.org/wiki/Category:2024%E5%B9%B4%E3%81%AE%E3%83%86%E3%83%AC%E3%83%93%E3%82%A2%E3%83%8B%E3%83%A1",
  "https://ja.wikipedia.org/wiki/%E3%80%90%E6%8E%A8%E3%81%97%E3%81%AE%E5%AD%90%E3%80%91_(%E3%82%A2%E3%83%8B%E3%83%A1)",
];

const scrapePage = async () => {
  const pageData = [];
  for await (const url of animeData) {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async (page: Page, browser: Browser) => {
        const result = await page.evaluate(() => document.body.innerHTML);
        await browser.close();
        return result;
      },
    });

    const data = await loader.scrape();
    pageData.push(data);
  }

  return pageData;
};

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const convertVectorAndSave = async (pageData: string[]) => {
  for (const page of pageData) {
    const pageChunks = await splitter.splitText(page);
    const collection = await db.collection(ASTRA_DB_COLLECTION!);

    for await (const chunk of pageChunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;
      await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
    }
  }
};


const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });
const createCollection = async () => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
    vector: {
      dimension: 1536,
      metric: "cosine",
    },
  });

  console.log(res);
};

const main = async () => {
  const pageData = await scrapePage();
  await createCollection();
  await convertVectorAndSave(pageData);
};

main();
