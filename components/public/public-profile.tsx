'use client';

import { useState } from 'react';
import { type PublicProfile, type ThemeConfig, publicService, getDeviceInfo } from '@/lib/api/public';
import { Braces, ExternalLink } from 'lucide-react';

interface PublicProfileViewProps {
  data: PublicProfile;
}

export function PublicProfileView({ data }: PublicProfileViewProps) {
  const { profile, links, theme, isPro, username } = data;
  const [clickingId, setClickingId] = useState<string | null>(null);

  const handleLinkClick = async (linkId: string, url: string) => {
    setClickingId(linkId);

    // Track click in background
    const deviceInfo = getDeviceInfo();
    publicService.trackClick(linkId, deviceInfo);

    // Small delay for visual feedback, then navigate
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setClickingId(null);
    }, 150);
  };

  // Build dynamic styles from theme
  const bgStyle = getBackgroundStyle(theme);
  const nameStyle = getTypographyStyle(theme.typography.name);
  const bioStyle = getTypographyStyle(theme.typography.bio);
  const buttonStyle = getButtonStyle(theme);
  const maxWidth = theme.layout?.maxWidth || 600;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={bgStyle}
    >
      {/* Main content */}
      <main
        className="flex-1 flex flex-col items-center px-4 py-12 sm:py-16"
        style={{ maxWidth, margin: '0 auto', width: '100%' }}
      >
        {/* Avatar */}
        <div className="mb-5">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div
              className="h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: theme.buttons.backgroundColor + '20',
                color: theme.typography.name.color,
              }}
            >
              {(profile.displayName || username)
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
        </div>

        {/* Display Name */}
        <h1 className="mb-1 text-center" style={nameStyle}>
          {profile.displayName}
        </h1>

        {/* Username */}
        <p
          className="text-sm mb-2 font-mono opacity-60"
          style={{ color: theme.typography.name.color }}
        >
          @{username}
        </p>

        {/* Bio */}
        {profile.bio && (
          <p
            className="text-center max-w-md mb-8 leading-relaxed"
            style={bioStyle}
          >
            {profile.bio}
          </p>
        )}

        {/* Links */}
        {links.length > 0 ? (
          <div className="w-full space-y-3">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                disabled={clickingId === link.id}
                className="group w-full text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                style={buttonStyle}
              >
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="font-medium text-sm truncate flex-1">
                    {link.title}
                  </span>
                  <ExternalLink
                    className="h-4 w-4 shrink-0 ml-3 opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{ color: theme.buttons.textColor }}
                  />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p
              className="text-sm opacity-50"
              style={{ color: theme.typography.bio.color }}
            >
              No links yet
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <a
          href="https://mysandbox.codes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: theme.typography.bio.color }}
        >
          <Braces className="h-3 w-3" />
          <span>MySandbox.codes</span>
        </a>
      </footer>
    </div>
  );
}

// Helper: build background CSS
function getBackgroundStyle(theme: ThemeConfig): React.CSSProperties {
  const bg = theme.background;

  if (bg.type === 'gradient' && bg.gradient) {
    return { background: bg.gradient };
  }

  if (bg.type === 'image' && bg.imageUrl) {
    return {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  return { backgroundColor: bg.color || '#0f172a' };
}

// Helper: build typography CSS
function getTypographyStyle(config: {
  font: string;
  size: number;
  weight: number;
  color: string;
}): React.CSSProperties {
  return {
    fontFamily: `"${config.font}", sans-serif`,
    fontSize: config.size,
    fontWeight: config.weight,
    color: config.color,
  };
}

// Helper: build button CSS
function getButtonStyle(theme: ThemeConfig): React.CSSProperties {
  const btn = theme.buttons;

  const style: React.CSSProperties = {
    backgroundColor: btn.backgroundColor,
    color: btn.textColor,
    borderRadius: btn.borderRadius,
    display: 'block',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
  };

  if (btn.shadow?.enabled) {
    style.boxShadow = `0 4px ${btn.shadow.blur}px ${btn.shadow.color}${Math.round(btn.shadow.opacity * 255).toString(16).padStart(2, '0')}`;
  }

  return style;
}
