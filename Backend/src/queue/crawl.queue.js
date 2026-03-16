import { Queue } from "bullmq";
import { createRedisConnection } from "./connection.js";

const connection = createRedisConnection();

export const crawlQueue = new Queue("crawl-queue", {
  connection
});
