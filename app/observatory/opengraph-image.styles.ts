import type { CSSProperties } from 'react';

export const containerStyle: CSSProperties = {
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0f172a', // slate-900
  backgroundImage:
    'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%)',
  backgroundSize: '100px 100px',
};

export const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  padding: '40px 80px',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export const titleStyle: CSSProperties = {
  fontSize: 64,
  fontWeight: 900,
  color: 'white',
  marginBottom: 20,
  letterSpacing: '-0.02em',
  textAlign: 'center',
};

export const subtitleStyle: CSSProperties = {
  fontSize: 32,
  color: '#94a3b8', // slate-400
  textAlign: 'center',
};

export const footerStyle: CSSProperties = {
  position: 'absolute',
  bottom: 40,
  fontSize: 24,
  color: '#64748b', // slate-500
};
