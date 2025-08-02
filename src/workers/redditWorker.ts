import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { redditQueue } from '../queues/reddit';
import { postScrapeTask } from '../tasks/reddit/postScraper';
import { commentScrapeTask } from '../tasks/reddit/commentScraper';
import { createSession, closeSession } from '../utils/sessionManager';
import { RedditAuth } from '../auth/reddit';
import logger from '../utils/logger';
import { BrowserContext } from 'playwright';

interface WorkerSession {
  contextId: string;
  context: BrowserContext;
  isAuthenticated: boolean;
  lastUsed: number;
  usageCount: number;
}

const workers: Worker[] = [];
const workerSessions: WorkerSession[] = [];
const MAX_SESSION_USAGE = 50; // Rotate sessions after N uses
const SESSION_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

async function createAuthenticatedSession(): Promise<WorkerSession> {
  const context = await createSession();
  const page = await context.newPage();

  try {
    await RedditAuth.login(page, {
      username: process.env.REDDIT_USERNAME!,
      password: process.env.REDDIT_PASSWORD!,
      twoFactorSecret: process.env.REDDIT_OTP_SECRET
    });

    return {
      contextId: Math.random().toString(36).substring(2, 9),
      context,
      isAuthenticated: true,
      lastUsed: Date.now(),
      usageCount: 0
    };
  } finally {
    await page.close();
  }
}

function cleanupOldSessions() {
  const now = Date.now();
  workerSessions.forEach(async (session, index) => {
    if (now - session.lastUsed > SESSION_MAX_AGE_MS ||
      session.usageCount >= MAX_SESSION_USAGE) {
      await session.context.close();
      workerSessions.splice(index, 1);
      logger.debug(`Rotated old session ${session.contextId}`);
    }
  });
}

export async function startRedditWorkers() {
  // Pre-warm with initial session
  workerSessions.push(await createAuthenticatedSession());

  const worker = new Worker(
    redditQueue.name,
    async (job) => {
      cleanupOldSessions();

      // Get least recently used authenticated session
      let session = workerSessions
        .filter(s => s.isAuthenticated)
        .sort((a, b) => a.lastUsed - b.lastUsed)[0];

      if (!session) {
        session = await createAuthenticatedSession();
        workerSessions.push(session);
        logger.info(`Created new authenticated session ${session.contextId}`);
      }

      const page = await session.context.newPage();
      session.lastUsed = Date.now();
      session.usageCount++;
      try {
        let result;

        switch (job.name) {
          case postScrapeTask.name:
            result = await postScrapeTask.processor(job, page);
            break;
          case commentScrapeTask.name:
            result = await commentScrapeTask.processor(job, page);
            break;
          default:
            throw new Error(`Unknown job type: ${job.name}`);
        }

        return result;
      } finally {
        await page.close();
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60 * 1000, // 10 jobs per minute
      },
    }
  );

  workers.push(worker);
  logger.info('Reddit workers started');
}

export async function stopRedditWorkers() {
  await Promise.all(workers.map(worker => worker.close()));
  logger.info('Reddit workers stopped');
}
