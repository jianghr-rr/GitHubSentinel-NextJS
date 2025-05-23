/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';
const flowbite = require('flowbite-react/tailwind');
const config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    flowbite.content(),
  ],
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    flowbite.plugin(),
  ],
  // variants: {
  //   extend: {
  //     display: ['group-hover'],
  //   },
  // },
} satisfies Config;

export default config;
