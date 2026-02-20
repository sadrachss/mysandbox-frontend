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

  // Status config
  const statusConfig: Record<string, { color: string; label: string; animate: boolean }> = {
    available: { color: '#22c55e', label: 'Available', animate: true },
    busy: { color: '#ef4444', label: 'Busy', animate: false },
    hybrid: { color: '#eab308', label: 'Hybrid', animate: false },
  };

  const currentStatus = statusConfig[profile.status] || statusConfig.available;

  // Quick Contact: determine CTA based on status
  const getContactCTA = () => {
    if (!profile.contactUrl) return null;

    // Use custom label or fall back to status-based defaults
    const defaultLabels: Record<string, string> = {
      available: 'Hire me',
      busy: 'Join waitlist',
      hybrid: "Let's talk",
    };

    const label = profile.contactLabel || defaultLabels[profile.status] || 'Contact me';

    // Hide CTA when busy and no custom label set
    if (profile.status === 'busy' && !profile.contactLabel) return null;

    return { label, url: profile.contactUrl };
  };

  const contactCTA = isPro ? getContactCTA() : null;

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

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: currentStatus.color,
              animation: currentStatus.animate ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: theme.typography.bio.color }}
          >
            {profile.statusMessage || currentStatus.label}
          </span>
        </div>

        {/* Bio with Markdown */}
        {profile.bio && (
          <div
            className="text-center max-w-md mb-6 leading-relaxed"
            style={bioStyle}
          >
            <MarkdownBio text={profile.bio} theme={theme} />
          </div>
        )}

        {/* Quick Contact CTA */}
        {contactCTA && (
          <a
            href={contactCTA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full max-w-md mb-6 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] block"
            style={{
              ...buttonStyle,
              background: `linear-gradient(135deg, ${theme.buttons.backgroundColor}, ${adjustColor(theme.buttons.backgroundColor, 20)})`,
              border: `1px solid ${theme.buttons.textColor}20`,
            }}
          >
            <div className="flex items-center justify-center gap-2 px-5 py-3.5">
              <span className="font-semibold text-sm">{contactCTA.label}</span>
              <ExternalLink
                className="h-3.5 w-3.5 opacity-50 group-hover:opacity-80 transition-opacity"
                style={{ color: theme.buttons.textColor }}
              />
            </div>
          </a>
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

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// Markdown Bio Renderer
// Supports: **bold**, `code`, [text](url)
// ============================================
function MarkdownBio({ text, theme }: { text: string; theme: ThemeConfig }) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`|\[.*?\]\(.*?\))/g);

  return (
    <>
      {parts.map((part, i) => {
        // Bold
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ fontWeight: 600, color: theme.typography.name.color }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Inline code
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              style={{
                padding: '1px 5px',
                borderRadius: 4,
                backgroundColor: theme.buttons.backgroundColor + '40',
                color: theme.buttons.textColor,
                fontSize: '0.85em',
                fontFamily: 'monospace',
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        // Link [text](url)
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.buttons.textColor,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {linkMatch[1]}
            </a>
          );
        }
        // Plain text (preserve newlines)
        return (
          <span key={i}>
            {part.split('\n').map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

// ============================================
// Helper functions
// ============================================

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

  return { backgroundColor: bg.color || '#0a0e17' };
}

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

// Lighten/darken a hex color
function adjustColor(hex: string, amount: number): string {
  const clamp = (n: number) => Math.min(255, Math.max(0, n));
  const color = hex.replace('#', '');
  const r = clamp(parseInt(color.substring(0, 2), 16) + amount);
  const g = clamp(parseInt(color.substring(2, 4), 16) + amount);
  const b = clamp(parseInt(color.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
