import axios from 'axios';

// Uses Next.js rewrite proxy: /public/:path* → backend/public/:path*
const PUBLIC_BASE = '/public';

export interface PublicProfile {
  username: string;
  profile: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    status: 'available' | 'busy' | 'hybrid';
    statusMessage?: string | null;
    contactUrl?: string | null;
    contactLabel?: string | null;
  };
  links: {
    id: string;
    title: string;
    url: string;
    icon?: string;
  }[];
  theme: ThemeConfig;
  isPro: boolean;
  meta: {
    title: string;
    description?: string;
    ogImage?: string;
  };
}

export interface ThemeConfig {
  background: {
    type: 'solid' | 'gradient' | 'image';
    color?: string;
    gradient?: string;
    imageUrl?: string;
  };
  buttons: {
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    shadow?: {
      enabled: boolean;
      color: string;
      blur: number;
      opacity: number;
    };
  };
  typography: {
    name: {
      font: string;
      size: number;
      weight: number;
      color: string;
    };
    bio: {
      font: string;
      size: number;
      weight: number;
      color: string;
    };
  };
  layout: {
    alignment: string;
    maxWidth: number;
  };
}

export const publicService = {
  getProfile: async (username: string): Promise<PublicProfile> => {
    const response = await axios.get(`${PUBLIC_BASE}/${username}`);
    return response.data;
  },

  trackClick: async (linkId: string, metadata: Record<string, string | undefined>) => {
    try {
      const response = await axios.post(`${PUBLIC_BASE}/track/${linkId}`, metadata);
      return response.data;
    } catch {
      // Don't block navigation if tracking fails
      return null;
    }
  },
};

// Detect device info from browser
export function getDeviceInfo() {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent;

  // Device type
  let device = 'desktop';
  if (/Mobi|Android/i.test(ua)) device = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'tablet';

  // Browser
  let browser = 'unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  // OS
  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return {
    device,
    browser,
    os,
    referrer: document.referrer || undefined,
  };
}
