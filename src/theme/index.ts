export const colors = {
  light: {
    background: '#F8F6EF',
    surface: '#DDEBDD',
    text: '#26332C',
    primary: '#2F6B4F',
    accent: '#A8D5BA',
    reward: '#F4C95D',
  },
  dark: {
    background: '#17251D',
    surface: '#263C2E',
    text: '#F8F6EF',
    primary: '#A8D5BA',
    accent: '#A8D5BA',
    reward: '#F4C95D',
  },
} as const;
export const typography = {
  fonts: {
    heading: 'Outfit_700Bold',
    headingMedium: 'Outfit_600SemiBold',
    body: 'DM_Sans_400Regular',
    bodyMedium: 'DM_Sans_500Medium',
    bodyBold: 'DM_Sans_600SemiBold',
    timer: 'Outfit_600SemiBold',
  },
  sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, display: 64 },
} as const;
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
export const radii = { sm: 8, md: 16, lg: 24, pill: 999 } as const;
