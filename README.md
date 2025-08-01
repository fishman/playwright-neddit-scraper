# Reddit Scraping

This project provides automated Reddit scraping using Playwright with proper error handling and logging.

## Installation

```bash
pnpm install
```

## Configuration

1. Create a `.env` file with your credentials and optional proxy settings:
```bash
echo "REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password" > .env
```

2. Export environment variables (alternative to .env file):
```bash
export REDDIT_USERNAME=your_username
export REDDIT_PASSWORD=your_password
export REDDIT_OTP_SECRET=your_base32_otp_secret # Optional if using 2FA
export PROXY_URL=http://proxy.example.com:8080 # Optional proxy
export PROXY_CHAIN_ENABLED=true # Set to true to enable proxy chaining
export DEVICE_PROFILE=macbook-pro-16 # Optional: macbook-pro-16, windows-fhd, windows-4k, macbook-air
```

## Running Tests

Run all Playwright tests:
```bash
pnpm test
```

Run tests in headed mode (visible browser):
```bash
pnpm test:headed
```

Debug tests (slower execution):
```bash
pnpm test:debug
```

## Running the Auth Script

Run the authentication script:
```bash
pnpm test
```

Debug mode (visible browser + slower execution):
```bash
DEBUG=true HEADLESS=false pnpm test
```

## Logging

Logs are written to `logs/app.log`

Set log level via environment variable:
```bash
LOG_LEVEL=debug pnpm test
```

## Screenshots on Failure

If authentication fails, a screenshot will be saved in test-failures

## Building the Project

Compile TypeScript to JavaScript:
```bash
pnpm build
```

## Device Profiles Configuration

The system uses realistic device profiles to make browser sessions appear more natural. These profiles are defined in `src/const/deviceProfiles.ts` and include:

- **macbook-pro-16**: 
  - Viewport: 1536x960 
  - User Agent: Safari on macOS
- **windows-fhd**:
  - Viewport: 1920x1080
  - User Agent: Edge on Windows  
- **windows-4k**:
  - Viewport: 3840x2160  
  - User Agent: Edge on Windows
- **macbook-air**:
  - Viewport: 1440x900
  - User Agent: Safari on macOS

### Usage:
1. Set a specific profile via environment variable:
```bash
export DEVICE_PROFILE=windows-fhd
```

2. Or let the system randomly select one (default behavior)

The profiles help avoid detection by:
- Matching viewport sizes to real devices  
- Using appropriate user agents
- Randomizing selection when not specified

## Dependencies

- Playwright for browser automation
- Pino for structured logging
- TypeScript for type safety

## Troubleshooting

Common issues:
1. **Authentication failures**:
   - Verify credentials are correct
   - Check for CAPTCHAs (may require manual intervention)

2. **Browser issues**:
   - Install Playwright browsers: `pnpm exec playwright install`
   - Update browsers: `pnpm exec playwright install --with-deps`
