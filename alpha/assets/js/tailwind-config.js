(function () {
  const config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#D4AF37',
          'primary-darker': '#9d8c2b',
          'primary-contrast': '#0A192F',
          'royal-navy': '#0d2b58',
          'deep-navy': '#000080',
          'cloud-mist': '#F0F4F8',
          'warm-ivory': '#FAF3E0',
          'soft-sand': '#E8DCC4',
          'background-light': '#FFFFFF',
          'background-dark': '#0A192F',
          'background-night': '#1a1a2e',
          'charcoal-gray': '#36454F',
          'text-light': '#1f2937',
          'text-dark': '#e0e0e0',
          'text-muted-light': '#6b7280',
          'text-muted-dark': '#9ca3af',
          'muted-gold': '#D4AF37',
          'accent-gold': '#D4AF37',
          accent: '#D4AF37',
          gold: '#d6961f'
        },
        fontFamily: {
          display: ['Playfair Display', 'serif'],
          body: ['Noto Sans KR', 'sans-serif'],
          playfair: ['Playfair Display', 'serif'],
          'noto-sans-kr': ['Noto Sans KR', 'sans-serif']
        },
        borderRadius: {
          DEFAULT: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
          full: '9999px'
        },
        outlineColor: {
          'primary-contrast': '#0A192F',
          primary: '#D4AF37',
          'royal-navy': '#0d2b58',
          'deep-navy': '#000080'
        }
      }
    }
  };

  window.tailwind = window.tailwind || {};
  window.tailwind.config = Object.assign({}, window.tailwind.config || {}, config);
})();
