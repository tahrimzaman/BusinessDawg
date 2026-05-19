import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BusinessDawg. We build business machines.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        color: '#fafafa',
        padding: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 22,
          fontWeight: 800,
          fontStyle: 'italic',
        }}
      >
        BusinessDawg
        <span style={{ width: 14, height: 14, background: '#c8ff00', borderRadius: 999 }} />
      </div>
      <div
        style={{
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: 110,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        We build <span style={{ color: '#c8ff00' }}>business</span> machines.
      </div>
      <div style={{ fontSize: 26, color: '#fafafa99' }}>
        Growth · AI Automation · Branding · Web & Product · Marketing Infrastructure
      </div>
    </div>,
    { ...size },
  );
}
