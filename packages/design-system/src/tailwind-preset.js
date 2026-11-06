/**
 * TotoAfya Digital - Canonical Tailwind CSS Preset
 *
 * Exposes clinical design tokens, 8pt spatial grid, high-contrast accessible typography,
 * and semantic clinical indicator colors across web workspaces.
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#006B5F',
          'teal-hover': '#00544B',
          'teal-subtle': '#E6F4F1',
          gold: '#C98A2C',
          'gold-hover': '#B27823',
          'gold-subtle': '#FDF6EB',
          pine: '#0A2E2B',
          amber: '#D97706',
          'amber-subtle': '#FFFBEB',
          crimson: '#DC2626',
          'crimson-subtle': '#FEF2F2',
        },
        primary: {
          DEFAULT: '#006B5F',
          hover: '#00544B',
          subtle: '#E6F4F1',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#C98A2C',
          hover: '#B27823',
          subtle: '#FDF6EB',
          foreground: '#FFFFFF',
        },
        background: '#F7F5F0',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#FAFAFA',
          muted: '#F8FAFC',
        },
        border: {
          DEFAULT: '#E5E5E5',
          strong: '#D1D5DB',
        },
        text: {
          primary: '#0A0A0A',
          secondary: '#4A4A4A',
          clinical: '#2B3441',
          muted: '#6B7280',
          inverse: '#FFFFFF',
        },
        status: {
          healthy: '#0E6835',
          'healthy-bg': '#F0FAF5',
          'healthy-border': '#A3E0BF',
          due: '#8F5B00',
          'due-bg': '#FFFBEB',
          'due-border': '#FDE68A',
          overdue: '#DC2626',
          'overdue-bg': '#FEF2F2',
          'overdue-border': '#FCA5A5',
          scheduled: '#006B5F',
          'scheduled-bg': '#E6F4F1',
          'scheduled-border': '#99D5CE',
          upcoming: '#4B5563',
          'upcoming-bg': '#F3F4F6',
          'upcoming-border': '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // 8-point spatial aliases
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-6': '24px',
        'space-8': '32px',
        'space-12': '48px',
        'space-16': '64px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        hover: '0 4px 16px rgba(0, 0, 0, 0.08)',
        elevated: '0 20px 50px rgba(0, 0, 0, 0.12)',
        'teal-glow': '0 8px 24px rgba(0, 107, 95, 0.22)',
        'gold-glow': '0 8px 24px rgba(201, 138, 44, 0.22)',
        'crimson-glow': '0 8px 24px rgba(220, 38, 38, 0.22)',
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
  plugins: [],
};
