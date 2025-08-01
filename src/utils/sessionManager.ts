import { chromium, type BrowserContext } from 'playwright';
import ProxyChain from 'proxy-chain';
import logger from './logger';

interface Session {
  context: BrowserContext;
  createdAt: number;
  proxyUrl: string | undefined;
}

const SESSION_EXPIRY_MS = 3 * 60 * 60 * 1000; // 3 hours
const MAX_SESSIONS = 500;
const activeSessions: Record<string, Session> = {};

export async function createSession(proxyUrl?: string): Promise<BrowserContext> {
  cleanupExpiredSessions();

  if (Object.keys(activeSessions).length >= MAX_SESSIONS) {
    throw new Error('Maximum session limit reached');
  }

  const browserOptions: Parameters<typeof chromium.launch>[0] = {
    headless: process.env.HEADLESS !== 'false',
    proxy: proxyUrl ? {
      server: proxyUrl,
      bypass: undefined,
      username: undefined,
      password: undefined
    } : undefined
  };

  if (proxyUrl && process.env.PROXY_CHAIN_ENABLED === 'true') {
    const newProxyUrl = await ProxyChain.anonymizeProxy(proxyUrl);
    browserOptions.proxy = { server: newProxyUrl };
  }

  import { DEVICE_PROFILES, DEFAULT_PROFILE } from '../const/deviceProfiles';
  
  const browser = await chromium.launch(browserOptions);
  
  // Select random device profile or use specified one
  const deviceProfile = process.env.DEVICE_PROFILE 
    ? DEVICE_PROFILES.find(p => p.name === process.env.DEVICE_PROFILE) || DEFAULT_PROFILE
    : DEVICE_PROFILES[Math.floor(Math.random() * DEVICE_PROFILES.length)];

  const context = await browser.newContext({
    viewport: deviceProfile.viewport,
    userAgent: deviceProfile.userAgent,
    locale: 'en-US'
  });

  const sessionId = Math.random().toString(36).substring(2, 15);
  activeSessions[sessionId] = {
    context,
    createdAt: Date.now(),
    proxyUrl: proxyUrl || undefined
  };

  logger.debug(`Created new session ${sessionId} with proxy ${proxyUrl || 'none'}`);
  return context;
}

export function getSession(sessionId: string): BrowserContext | null {
  const session = activeSessions[sessionId];
  if (!session) return null;

  session.createdAt = Date.now();
  return session.context;
}

export async function closeSession(sessionId: string): Promise<void> {
  const session = activeSessions[sessionId];
  if (!session) return;

  await session.context.close();
  if (session.proxyUrl && process.env.PROXY_CHAIN_ENABLED === 'true') {
    await ProxyChain.closeAnonymizedProxy(session.proxyUrl, true);
  }
  delete activeSessions[sessionId];
  logger.debug(`Closed session ${sessionId}`);
}

function cleanupExpiredSessions(): void {
  const now = Date.now();
  Object.entries(activeSessions).forEach(async ([id, session]) => {
    if (now - session.createdAt > SESSION_EXPIRY_MS) {
      await closeSession(id);
    }
  });
}

export function getActiveSessionCount(): number {
  return Object.keys(activeSessions).length;
}
