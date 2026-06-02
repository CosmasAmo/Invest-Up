# InvestUp Logo Assets

This directory contains the logo assets for the InvestUp Trading Company.

## Available Assets

- `investup-logo.svg`: Vector version of the logo for high-quality display
- `/public/invest-up.png`: PNG version of the logo used for PWA icons
- `/public/favicon.ico`: ICO version of the logo for browser tab display

## Browser Tab Branding

The InvestUp logo appears in the browser tab through:
1. The favicon.ico file (for most browsers)
2. The invest-up.png file (for browsers that support PNG favicons)
3. The apple-touch-icon (for iOS devices)

The title in the browser tab is set to "InvestUp | Trading Company" by default, and pages use the `useDocumentTitle` hook to set page-specific titles.

## Using the Logo in Components

We have created a reusable component for displaying the logo:

```jsx
import InvestUpLogo from '../components/InvestUpLogo';

// Usage examples:
<InvestUpLogo size="sm" /> // Small logo
<InvestUpLogo size="md" /> // Medium logo (default)
<InvestUpLogo size="lg" /> // Large logo
<InvestUpLogo size="xl" /> // Extra large logo
<InvestUpLogo animated={false} /> // Static logo without animation
<InvestUpLogo darkMode={true} /> // Dark mode version
<InvestUpLogo className="my-custom-class" /> // With additional CSS classes
```

The `Logo.jsx` component uses the `InvestUpLogo` component and adds a link to the home page:

```jsx
import Logo from '../components/Logo';

// Usage:
<Logo />
```

## Updating the Logo

If you need to update the logo:

1. Use the `favicon-generator.html` file in the public directory to generate new favicon and PNG files
2. Replace the SVG file in this directory
3. Update the `InvestUpLogo.jsx` component if necessary

## Brand Guidelines

- Always maintain the proper aspect ratio of the logo
- Do not alter the colors unless specifically required for a dark/light theme
- Ensure sufficient contrast when placing the logo on colored backgrounds
- The minimum display size should be 32x32 pixels to maintain legibility

## Colors

- Primary Blue: #3B82F6 (blue-500)
- Secondary Blue: #2563EB (blue-600)
- Accent Indigo: #4F46E5 (indigo-600)
- Background Dark: #0F172A (slate-900) 