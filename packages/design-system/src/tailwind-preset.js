/**
 * TotoAfya Digital - Canonical Tailwind & NativeWind Theme Preset
 * "The Sunlit Botanical Editorial"
 *
 * Exposes clinical design tokens, 8pt spatial grid, Merriweather / Plus Jakarta Sans typography,
 * WCAG AA 48px touch targets, safe area insets, and Dark-on-Amber contrast enforcement.
 *
 * References:
 * - design/mother-experience/04-art-direction/COLOR_AND_CONTRAST_STUDY.md
 * - design/mother-experience/04-art-direction/TYPOGRAPHY_STUDY.md
 * - design/mother-experience/05-design-system/DESIGN_SYSTEM_SPECIFICATION.md
 * - design/mother-experience/10-handoff/DEVELOPER_HANDOFF_SPECIFICATIONS.md
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        toto: {
          teal: {
            deep: '#004D44',
            primary: '#006B5F',
            medium: '#2E8A74',
            soft: '#E6F4F1',
          },
          amber: {
            deep: '#B45309',
            primary: '#E68A00',
            soft: '#FEF3C7',
            subtle: '#FFFBEB',
          },
          crimson: {
            primary: '#DC2626',
            soft: '#FEE2E2',
            subtle: '#FEF2F2',
          },
          canvas: {
            stone: '#F9F8F5',
            card: '#FFFFFF',
            subtle: '#F1EFEA',
            muted: '#F1EFEA',
            border: '#E2E8F0',
            borderFocus: '#006B5F',
          },
          ink: {
            primary: '#1A202C',
            secondary: '#4A5568',
            muted: '#718096',
            inverse: '#FFFFFF',
          },
          status: {
            healthy: {
              bg: '#F0FDF4',
              text: '#15803D',
              border: '#A3E0BF',
            },
            warning: {
              bg: '#FFFBEB',
              text: '#B45309',
              border: '#FDE68A',
            },
            critical: {
              bg: '#FEF2F2',
              text: '#DC2626',
              soft: '#FEE2E2',
              border: '#FCA5A5',
            },
            info: {
              bg: '#EFF6FF',
              text: '#1D4ED8',
              border: '#93C5FD',
            },
            scheduled: {
              bg: '#E6F4F1',
              text: '#006B5F',
              border: '#99D5CE',
            },
            upcoming: {
              bg: '#F1EFEA',
              text: '#4A5568',
              border: '#E2E8F0',
            },
          },
        },

        // Root Semantic Aliases
        primary: {
          DEFAULT: '#006B5F',
          hover: '#004D44',
          subtle: '#E6F4F1',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#E68A00',
          hover: '#B45309',
          subtle: '#FEF3C7',
          // Dark-on-Amber Rule: Foreground is Charcoal Ink #1A202C (6.71:1 contrast)
          foreground: '#1A202C',
        },
        background: '#F9F8F5',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F1EFEA',
          muted: '#F1EFEA',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
          focus: '#006B5F',
        },
        text: {
          primary: '#1A202C',
          secondary: '#4A5568',
          clinical: '#1A202C',
          muted: '#718096',
          inverse: '#FFFFFF',
        },
        status: {
          healthy: '#15803D',
          'healthy-bg': '#F0FDF4',
          'healthy-border': '#A3E0BF',
          due: '#B45309',
          'due-bg': '#FFFBEB',
          'due-border': '#FDE68A',
          overdue: '#DC2626',
          'overdue-bg': '#FEF2F2',
          'overdue-border': '#FCA5A5',
          critical: '#DC2626',
          'critical-bg': '#FEF2F2',
          'critical-soft': '#FEE2E2',
          scheduled: '#006B5F',
          'scheduled-bg': '#E6F4F1',
          'scheduled-border': '#99D5CE',
          upcoming: '#4A5568',
          'upcoming-bg': '#F1EFEA',
          'upcoming-border': '#E2E8F0',
        },
      },

      fontFamily: {
        display: ['Merriweather', 'Georgia', 'serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },

      fontSize: {
        'display-hero': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title-large': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-medium': ['18px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.00em', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.00em', fontWeight: '400' }],
        'label-action': ['14px', { lineHeight: '18px', letterSpacing: '+0.01em', fontWeight: '600' }],
        caption: ['12px', { lineHeight: '16px', letterSpacing: '+0.01em', fontWeight: '500' }],
        'data-metric': ['22px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '700' }],
      },

      spacing: {
        // 8-Point Spatial Grid Tokens (2px to 48px)
        'space-2xs': '2px',
        'space-xs': '4px',
        'space-sm': '8px',
        'space-md': '12px',
        'space-base': '16px',
        'space-lg': '24px',
        'space-xl': '32px',
        'space-2xl': '48px',
        'space-3xl': '64px',
        // Swahili +25% padding clearance token (px-5 / 20px)
        'swahili-btn': '20px',
      },

      minHeight: {
        touch: '48px', // WCAG 2.1 / 2.2 AA 48px hit target
      },
      minWidth: {
        touch: '48px',
      },

      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '24px',
        'card-sm': '12px',
        'card-md': '16px',
        'card-lg': '24px',
        full: '9999px',
      },

      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
        card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        sheet: '0 -4px 20px rgba(0, 0, 0, 0.08)',
        button: '0 4px 14px rgba(0, 107, 95, 0.25)',
        'teal-glow': '0 8px 24px rgba(0, 107, 95, 0.22)',
        'amber-glow': '0 8px 24px rgba(230, 138, 0, 0.22)',
      },

      zIndex: {
        dropdown: '10',
        sticky: '20',
        modal: '30',
        popover: '40',
        toast: '50',
      },
    },
  },

  plugins: [
    // Safe Area & Dark-on-Amber Plugin for Web & Native
    function ({ addUtilities }) {
      addUtilities({
        // Safe Area Inset Padding
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top, 0px)' },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.pl-safe': { paddingLeft: 'env(safe-area-inset-left, 0px)' },
        '.pr-safe': { paddingRight: 'env(safe-area-inset-right, 0px)' },
        '.p-safe': {
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        },

        // Safe Area Inset Margins
        '.mt-safe': { marginTop: 'env(safe-area-inset-top, 0px)' },
        '.mb-safe': { marginBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.ml-safe': { marginLeft: 'env(safe-area-inset-left, 0px)' },
        '.mr-safe': { marginRight: 'env(safe-area-inset-right, 0px)' },

        // OpenType Tabular Figures
        '.tabular-nums': {
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum" 1',
        },

        // 48x48 WCAG AA Touch Target Primitive
        '.touch-target': {
          minHeight: '48px',
          minWidth: '48px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        // Dark-on-Amber Enforced Utility Classes
        '.dark-on-amber': {
          backgroundColor: '#E68A00',
          color: '#1A202C !important',
        },
        '.btn-amber': {
          backgroundColor: '#E68A00',
          color: '#1A202C !important',
          fontWeight: '600',
          minHeight: '48px',
          paddingLeft: '20px',
          paddingRight: '20px',
          borderRadius: '9999px',
        },
        '.badge-amber': {
          backgroundColor: '#FFFBEB',
          color: '#B45309 !important',
          border: '1px solid #FDE68A',
          borderRadius: '6px',
          padding: '4px 8px',
          fontWeight: '600',
        },

        // Swahili Layout Helpers
        '.swahili-btn': {
          width: '100%',
          paddingLeft: '20px',
          paddingRight: '20px',
          minHeight: '48px',
        },
        '.swahili-header': {
          minHeight: '3rem',
          lineHeight: '1.3',
          overflowWrap: 'break-word',
        },
        '.clinical-wrap': {
          overflow: 'visible !important',
          textOverflow: 'clip !important',
          whiteSpace: 'normal !important',
        },
      });
    },
  ],
};
