window.tailwind = window.tailwind || {};

const withOpacityValue = (variable) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variable}) / ${opacityValue})`;
    }
    return `rgb(var(${variable}) / <alpha-value>)`;
  };
};

window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: withOpacityValue("--color-primary-rgb"),
        "primary-darker": withOpacityValue("--color-primary-darker-rgb"),
        accent: withOpacityValue("--color-accent-rgb"),
        "royal-navy": withOpacityValue("--color-royal-navy-rgb"),
        "cloud-mist": withOpacityValue("--color-cloud-mist-rgb"),
        "warm-ivory": withOpacityValue("--color-warm-ivory-rgb"),
        "soft-sand": withOpacityValue("--color-soft-sand-rgb"),
        "background-light": withOpacityValue("--color-background-light-rgb"),
        "background-dark": withOpacityValue("--color-background-dark-rgb"),
        "charcoal-gray": withOpacityValue("--color-charcoal-gray-rgb"),
        "muted-gold": withOpacityValue("--color-muted-gold-rgb"),
        gold: withOpacityValue("--color-gold-rgb"),
        "text-light": withOpacityValue("--color-text-light-rgb"),
        "text-dark": withOpacityValue("--color-text-dark-rgb"),
        "text-muted-light": withOpacityValue("--color-text-muted-light-rgb"),
        "text-muted-dark": withOpacityValue("--color-text-muted-dark-rgb")
      },
      fontFamily: {
        display: ["var(--font-display)", "Playfair Display", "serif"],
        body: ["var(--font-body)", "Noto Sans KR", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "var(--radius-default, 0.25rem)",
        lg: "var(--radius-lg, 0.75rem)",
        xl: "var(--radius-xl, 1rem)",
        full: "9999px"
      }
    }
  }
};
