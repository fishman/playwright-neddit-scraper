export type DeviceProfile = {
  name: string;
  viewport: { width: number; height: number };
  userAgent: string;
};

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    name: 'macbook-pro-16',
    viewport: { width: 1536, height: 960 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
  },
  {
    name: 'windows-fhd',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  },
  {
    name: 'windows-4k',
    viewport: { width: 3840, height: 2160 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  },
  {
    name: 'macbook-air',
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
  }
];

export const DEFAULT_PROFILE = DEVICE_PROFILES[0];
