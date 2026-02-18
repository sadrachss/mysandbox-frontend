'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicService, type PublicProfile } from '@/lib/api/public';
import { PublicProfileView } from '@/components/public/public-profile';
import { ProfileNotFound } from '@/components/public/profile-not-found';
import { Braces } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [data, setData] = useState<PublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    publicService
      .getProfile(username)
      .then((profile) => {
        setData(profile);
        // Update page title
        document.title = profile.meta.title || `${profile.profile.displayName} - MySandbox.codes`;
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-pulse">
            <Braces className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500/50 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-emerald-500/50 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-emerald-500/50 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound || !data) {
    return <ProfileNotFound username={username} />;
  }

  // Load Google Font if needed
  const fontFamily = data.theme.typography.name.font;
  const bioFont = data.theme.typography.bio.font;
  const fonts = new Set([fontFamily, bioFont].filter((f) => f && f !== 'Inter'));

  return (
    <>
      {/* Dynamic font loading */}
      {fonts.size > 0 && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?${[...fonts]
            .map((f) => `family=${f.replace(/\s+/g, '+')}:wght@400;500;600;700`)
            .join('&')}&display=swap`}
        />
      )}
      <PublicProfileView data={data} />
    </>
  );
}
