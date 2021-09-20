const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'media',
  theme: {
    height: {
      75: '75vh',
      9: ' 2.25rem',
    },
    boxShadow: {
      neon: '0 0 8px #fff, inset 0 0 8px #fff, 0 0 16px #4D4DFF, inset 0 0 16px #4D4DFF, 0 0 32px #4D4DFF, inset 0 0 32px #4D4DFF;',
      greenNeon: '0 0 8px #fff, inset 0 0 8px #fff, 0 0 16px #39ff14, inset 0 0 16px #39ff14, 0 0 32px #39ff14, inset 0 0 32px #39ff14;'
    },
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.trueGray,
      classicGray: colors.gray,
      blueGray: colors.blueGray,
      lightBlue: colors.lightBlue,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      red: colors.red,
      pink: colors.pink,
      rose: colors.rose,
      fuchsia: colors.fuchsia,
      orange: colors.orange,
      yellow: colors.yellow,
      green: colors.green,
      teal: colors.teal,
      cyan: colors.cyan,
      violet: colors.violet,
      purple: colors.purple,
      amber: colors.amber,
      emerald: colors.emerald,
      transparent: 'transparent',
      nativeGray: '#353839',
    },
  },
  variants: {
    extend: {
      backgroundColor: ['checked', 'disabled', 'active'],
      borderColor: ['checked'],
      opacity: ['disabled'],
      transform: ['disabled', 'active'],
      scale: ['active'],
      outline: ['focus', 'active'],
      pointerEvents: ['hover', 'focus', 'disabled'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
