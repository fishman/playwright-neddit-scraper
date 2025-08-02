import logger from '../src/utils/logger';

function checkEnvVars() {
  const requiredVars = [
    'REDDIT_USERNAME',
    'REDDIT_PASSWORD',
    'REDDIT_OTP_SECRET',
    'REDIS_HOST'
  ];

  let missingVars = false;

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      logger.error(`Missing required environment variable: ${varName}`);
      missingVars = true;
    }
  });

  if (missingVars) {
    process.exit(1);
  }

  logger.info('All required environment variables are present');
}

checkEnvVars();
