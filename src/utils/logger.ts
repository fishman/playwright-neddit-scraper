import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    job: (job: { id: string; name: string }) => ({
      id: job.id,
      name: job.name,
    }),
  },
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: process.env.LOG_LEVEL || 'info',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        }
      },
      {
        target: 'pino/file',
        level: 'trace',
        options: { destination: 'logs/app.log', mkdir: true },
      }
    ]
  }
});

export default logger;
