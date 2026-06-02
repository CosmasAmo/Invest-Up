# InvestUp Public Assets

This directory contains public assets for the InvestUp Trading Company application.

## Favicon Files

- `favicon.ico`: The main favicon file used by most browsers for the browser tab icon
- `invest-up.png`: PNG version of the logo used for:
  - Modern browsers that support PNG favicons
  - Apple touch icon for iOS devices
  - PWA icon when the app is installed on a device

## How to Update the Favicon

If you need to update the favicon:

1. Use the `favicon-generator.html` file in this directory to generate a new favicon
2. Replace both `favicon.ico` and `invest-up.png` with your new versions
3. Make sure the new icons match the InvestUp branding guidelines

## Manifest File

The `manifest.json` file contains configuration for Progressive Web App (PWA) support, including:

- App name and short name
- Icons for different device sizes
- Theme colors
- Display mode

When updating the logo, make sure to update the manifest.json file if necessary to reference the correct icon files. 