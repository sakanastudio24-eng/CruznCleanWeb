'use client';

import Image, { type StaticImageData } from 'next/image';

import facebookIcon from '@/assets/Icons/facebook.svg';
import instagramIcon from '@/assets/Icons/instagram.svg';
import tiktokIcon from '@/assets/Icons/tiktok.svg';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { SITE_PROFILE, type SocialPlatform } from '@/lib/site-profile';

interface SocialLinkButtonsProps {
  location: string;
  page: string;
  align?: 'start' | 'center';
  size?: 'compact' | 'comfortable';
}

const PLATFORM_ICONS: Record<SocialPlatform, StaticImageData> = {
  facebook: facebookIcon,
  instagram: instagramIcon,
  tiktok: tiktokIcon,
};

/**
 * Renders external social profile links with shared tracking and accessible labels.
 */
export function SocialLinkButtons({
  location,
  page,
  align = 'start',
  size = 'compact',
}: SocialLinkButtonsProps): JSX.Element {
  const wrapperClass = align === 'center' ? 'justify-center' : 'justify-start';
  const buttonClass = size === 'comfortable' ? 'min-h-11 px-4 py-2 text-sm' : 'min-h-10 px-3 py-2 text-xs';

  return (
    <div className={`flex flex-wrap gap-2 ${wrapperClass}`}>
      {SITE_PROFILE.socialLinks.map((link) => (
        <a
          key={link.platform}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.ariaLabel}
          onClick={() =>
            trackAnalyticsEvent('click_social', {
              page,
              platform: link.platform,
              location,
              url: link.href,
            })
          }
          className={`group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.055] font-semibold text-white/80 shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition hover:border-burgundyAccent/75 hover:bg-burgundy/20 hover:text-white ${buttonClass}`}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-burgundy/45 bg-white/[0.08] p-1.5 transition group-hover:border-burgundyAccent group-hover:bg-burgundy/35">
            <Image
              src={PLATFORM_ICONS[link.platform]}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain invert transition group-hover:opacity-95"
            />
          </span>
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
}
