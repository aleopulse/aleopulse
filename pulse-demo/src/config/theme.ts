/**
 * Theme configuration for your demo video.
 * Edit these values to match your brand.
 */

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo: {
    text: string;
    gradient?: [string, string];
  };
  tagline: string;
  url: string;
}

export const theme: ThemeConfig = {
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#a855f7",
    background: "#0a0a0a",
    text: "#fafafa",
    muted: "#a1a1aa",
  },
  fonts: {
    heading: "system-ui, sans-serif",
    body: "system-ui, sans-serif",
  },
  logo: {
    text: "LeoPulse",
    gradient: ["#6366f1", "#a855f7"],
  },
  tagline: "Privacy-Preserving Polls on Aleo",
  url: "aleopulse.onrender.com",
};
