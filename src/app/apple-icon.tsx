import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#C8FF00',
        fontSize: 110,
        fontWeight: 900,
        fontStyle: 'italic',
        letterSpacing: -4,
        fontFamily: 'sans-serif',
      }}
    >
      BD
    </div>,
    { ...size },
  );
}
