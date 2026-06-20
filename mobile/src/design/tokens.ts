/**
 * Crewmute Design Tokens
 *
 * The single source of truth for all visual values in the mobile app.
 * Every color, spacing, radius, and size used in a component MUST come
 * from this file — no hardcoded values anywhere in the codebase.
 *
 * Per AGENT_RULES.md §8.3:
 *   // FORBIDDEN
 *   <View style={{ padding: 16, backgroundColor: '#1A1A2E' }}>
 *
 *   // REQUIRED
 *   <View style={{ padding: spacing.base, backgroundColor: colors.background.primary }}>
 *
 * Source: DESIGN.md §2 (colors), §4 (spacing/layout), §4.3 (radii)
 */

// ── Colors Interface ──────────────────────────────────────────────────────────
export interface Colors {
  background: {
    primary: string;
    card: string;
    subtle: string;
  };
  text: {
    primary: string;
    secondary: string;
    placeholder: string;
  };
  border: {
    default: string;
  };
  interactive: {
    primary: string;
    primaryText: string;
  };
  status: {
    activeBackground: string;
    activeText: string;
    pendingBackground: string;
    pendingText: string;
    acceptedBackground: string;
    acceptedText: string;
    rejectedBackground: string;
    rejectedText: string;
    fullBackground: string;
    fullText: string;
    expiredBackground: string;
    expiredText: string;
    cancelledBackground: string;
    cancelledText: string;
  };
  overlay: {
    subtle: string;
    medium: string;
    heavy: string;
  };
  pressed: {
    default: string;
    primary: string;
  };
}

// ── Brand Colors (raw swatches) ───────────────────────────────────────────────
// Use semantic tokens (lightColors / darkColors) in components.
// Use brand colors only for illustrations or one-off brand moments.
export const brandColors = {
  electricViolet: '#6C63FF',
  coralPink:      '#FF6584',
  mintGreen:      '#00C896',
  amber:          '#FFB84C',
  coolGray:       '#8B8FA8',
  brandNavy:      '#0F0F1A',
} as const;

// ── Light Mode Semantic Tokens ────────────────────────────────────────────────
// Source: DESIGN.md §2.2
export const lightColors = {
  background: {
    primary: '#F7F7FC',
    card:     '#FFFFFF',
    subtle:   '#EDEDF8',
  },
  text: {
    primary:     '#0F0F1A',
    secondary:   '#4B5563',
    placeholder: '#8B8FA8',
  },
  border: {
    default: '#E4E4F0',
  },
  interactive: {
    primary:     '#6C63FF',
    primaryText: '#FFFFFF',
  },
  overlay: {
    subtle: 'rgba(0,0,0,0.05)',
    medium: 'rgba(0,0,0,0.4)',
    heavy:  'rgba(0,0,0,0.6)',
  },
  pressed: {
    default: 'rgba(0,0,0,0.08)',
    primary: 'rgba(90,80,230,1)',
  },
  // Status chip backgrounds (DESIGN.md §5.2)
  status: {
    activeBackground:   '#E8F5F0',
    activeText:         '#00C896',
    pendingBackground:  '#FFF6E8',
    pendingText:        '#FFB84C',
    acceptedBackground: '#E8F5F0',
    acceptedText:       '#00C896',
    rejectedBackground: '#FFF0F3',
    rejectedText:       '#FF6584',
    fullBackground:     '#F0EFFF',
    fullText:           '#6C63FF',
    expiredBackground:  '#F3F4F6',
    expiredText:        '#8B8FA8',
    cancelledBackground:'#FFF0F3',
    cancelledText:      '#FF6584',
  },
} as const;

// ── Dark Mode Semantic Tokens ─────────────────────────────────────────────────
// Source: DESIGN.md §2.3
export const darkColors = {
  background: {
    primary: '#0F0F1A',
    card:     '#1C1C2E',
    subtle:   '#252538',
  },
  text: {
    primary:     '#F0F0FF',
    secondary:   '#9CA3AF',
    placeholder: '#6B7280',
  },
  border: {
    // Slightly more opaque in dark mode per DESIGN.md §9.3
    default: '#2E2E4A',
  },
  interactive: {
    // Slightly lighter for dark bg contrast (DESIGN.md §2.3)
    primary:     '#7C74FF',
    primaryText: '#FFFFFF',
  },
  overlay: {
    subtle: 'rgba(255,255,255,0.05)',
    medium: 'rgba(0,0,0,0.6)',
    heavy:  'rgba(0,0,0,0.8)',
  },
  pressed: {
    default: 'rgba(255,255,255,0.1)',
    primary: 'rgba(90,80,230,1)',
  },
  status: {
    activeBackground:   '#0D2B22',
    activeText:         '#00C896',
    pendingBackground:  '#2B2208',
    pendingText:        '#FFB84C',
    acceptedBackground: '#0D2B22',
    acceptedText:       '#00C896',
    rejectedBackground: '#2B0D14',
    rejectedText:       '#FF6584',
    fullBackground:     '#1A1833',
    fullText:           '#7C74FF',
    expiredBackground:  '#252538',
    expiredText:        '#8B8FA8',
    cancelledBackground:'#2B0D14',
    cancelledText:      '#FF6584',
  },
} as const;

// ── Spacing Scale ─────────────────────────────────────────────────────────────
// Base-4 system from DESIGN.md §4.1
// Every margin, padding, and gap must be a value from this object.
export const spacing = {
  xs:   4,   // space.1 — icon internal padding, micro gaps
  sm:   8,   // space.2 — between icon and label, tag padding
  md:   12,  // space.3 — input padding top/bottom, small card gaps
  base: 16,  // space.4 — card padding, section spacing, list item gap
  lg:   20,  // space.5 — screen horizontal padding, button height ref
  xl:   24,  // space.6 — between cards in feed, modal top padding
  '2xl':32,  // space.8 — section header to content, large vertical gaps
  '3xl':40,  // space.10 — hero section padding, onboarding margins
} as const;

// ── Border Radii ──────────────────────────────────────────────────────────────
// Source: DESIGN.md §4.3
export const radii = {
  none:        0,
  icon:        8,    // Icon containers
  input:       10,   // Input fields
  button:      12,   // Primary buttons
  card:        16,   // Cards
  bottomSheet: 24,   // Bottom sheets and modals (top corners only)
  avatar:      9999, // Perfect circle
  tag:         9999, // Tags, chips, badges (pill)
} as const;

// ── Tab Bar ───────────────────────────────────────────────────────────────────
// Source: DESIGN.md §4.2 and §5.5
// TAB_BAR_HEIGHT is the base height without safe area inset.
// Use useSafeAreaInsets().bottom to get the full padding needed.
export const TAB_BAR_HEIGHT = 64;

// ── Touch Target ──────────────────────────────────────────────────────────────
// Apple HIG standard, DESIGN.md §4.2, AGENT_RULES.md §8.5
export const MIN_TOUCH_TARGET = 44;
