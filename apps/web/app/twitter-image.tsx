import { ImageResponse } from 'next/og';

import { SITE_PROFILE } from '@/lib/site-profile';

export const alt = 'Cruizn Clean Yorba Linda mobile auto detailing';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

/**
 * Generates the default Twitter/X brand-card preview image.
 */
export default function TwitterImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: 'linear-gradient(135deg, #080808 0%, #111111 48%, #2a0810 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          height: '100%',
          justifyContent: 'space-between',
          padding: 72,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div
            style={{
              border: '2px solid rgba(255,255,255,0.18)',
              borderRadius: 999,
              color: '#f4f4f4',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 2,
              padding: '14px 26px',
              textTransform: 'uppercase',
            }}
          >
            {SITE_PROFILE.locationLabel}
          </div>
          <div
            style={{
              background: '#8c1c2c',
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 700,
              padding: '14px 26px',
            }}
          >
            Mobile Detailing
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 900 }}>
          <div style={{ color: '#ffffff', fontSize: 92, fontWeight: 900, letterSpacing: -2, lineHeight: 0.92 }}>
            {SITE_PROFILE.businessName}
          </div>
          <div style={{ color: '#f5f5f5', fontSize: 48, fontWeight: 800, lineHeight: 1.1 }}>
            Yorba Linda Mobile Auto Detailing
          </div>
          <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 34, fontWeight: 600, lineHeight: 1.25 }}>
            Detail packages • paint correction • ceramic protection
          </div>
        </div>

        <div
          style={{
            borderTop: '2px solid rgba(255,255,255,0.16)',
            color: 'rgba(255,255,255,0.74)',
            display: 'flex',
            fontSize: 26,
            fontWeight: 600,
            justifyContent: 'space-between',
            paddingTop: 30,
            width: '100%',
          }}
        >
          <span>{SITE_PROFILE.serviceAreaLabel}</span>
          <span>{SITE_PROFILE.siteUrl.replace('https://', '')}</span>
        </div>
      </div>
    ),
    size,
  );
}
