# PWA (Progressive Web App) Implementation

## Overview

This application supports PWA functionality, allowing users to install it as a standalone application on their desktop and mobile devices.

## Features

### 1. Web App Manifest

The application includes a Web App Manifest (`app/manifest.ts`) that provides metadata for PWA installation:

- **Name**: 無限ProtoPedia
- **Display Mode**: Standalone (full-screen without browser UI)
- **Theme Color**: #000000 (black)
- **Background Color**: #ffffff (white)
- **Orientation**: Portrait-primary
- **Icons**: Multiple sizes (72x72 to 512x512) including maskable icons

### 2. Service Worker

Powered by `next-pwa`, the application automatically generates a service worker that provides:

- **Offline Support**: Basic offline functionality
- **Caching Strategy**: Automatic caching of static assets
- **Fast Loading**: Pre-cached app shell for instant loading
- **Background Sync**: Seamless updates

### 3. App Icons

The application includes icons in the following sizes:

- 72x72 pixels
- 96x96 pixels
- 128x128 pixels
- 144x144 pixels
- 152x152 pixels
- 192x192 pixels (required for PWA)
- 256x256 pixels
- 384x384 pixels
- 512x512 pixels (required for PWA)
- 180x180 pixels (Apple Touch Icon)

Icons support both `any` and `maskable` purposes for better integration with different platforms.

### 4. Apple Web App Support

Additional metadata for iOS devices:

- Apple Touch Icon (180x180)
- Apple Web App capable mode
- Status bar styling
- Telephone number detection disabled

## Installation

### Desktop (Chrome/Edge)

1. Visit the application in Chrome or Edge browser
2. Look for the install icon in the address bar
3. Click "Install" when prompted
4. The app will be installed as a desktop application

### Mobile (Android)

1. Open the application in Chrome on Android
2. Tap the three-dot menu
3. Select "Add to Home screen"
4. Confirm the installation
5. The app icon will appear on your home screen

### Mobile (iOS)

1. Open the application in Safari on iOS
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm the installation
5. The app icon will appear on your home screen

## Development

### Service Worker Behavior

- **Development Mode**: Service worker is disabled for easier debugging
- **Production Mode**: Service worker is automatically registered and active

### Generating Icons

If you need to regenerate the icons from a source image:

```bash
node tools/generate-icons.mjs
```

This script uses the image at `public/img/P-640x640.png` as the source and generates all required icon sizes.

### Testing PWA

1. **Build the application**:

    ```bash
    npm run build
    npm run start
    ```

2. **Test with Lighthouse**:
    - Open Chrome DevTools
    - Go to the Lighthouse tab
    - Run a PWA audit
    - Target: 100% PWA score

3. **Verify Manifest**:
    - Open Chrome DevTools
    - Go to Application tab
    - Check "Manifest" section
    - Verify all icons and metadata are correct

4. **Test Installation**:
    - Try installing the app on desktop
    - Try installing on mobile devices (Android/iOS)
    - Verify the app works in standalone mode

## Configuration

### next.config.mjs

The PWA configuration is set up in `next.config.mjs`:

```javascript
const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest\.json$/],
});
```

Key settings:

- `dest`: Service worker files are generated in the `public` directory
- `register`: Automatically register the service worker
- `skipWaiting`: Immediately activate new service worker versions
- `disable`: Disable in development for easier debugging
- `buildExcludes`: Exclude specific files from the service worker cache

### Manifest (app/manifest.ts)

The manifest configuration is defined in `app/manifest.ts` using Next.js 15's built-in manifest support.

## Troubleshooting

### PWA Not Installing

1. Ensure you're using HTTPS (or localhost for development)
2. Check that the manifest is properly loaded in DevTools > Application > Manifest
3. Verify all required icons (192x192 and 512x512) are present
4. Check the Console for any service worker errors

### Service Worker Not Updating

1. The service worker uses `skipWaiting: true` for immediate updates
2. Clear browser cache if needed
3. In DevTools > Application > Service Workers, click "Unregister" and reload

### Icons Not Displaying

1. Verify icon files exist in `/public/icons/`
2. Check that manifest.json is properly served
3. Clear browser cache and reload

## Best Practices

1. **Always test offline functionality** after making changes
2. **Update the manifest** when changing app name or branding
3. **Regenerate icons** if the logo changes
4. **Test on multiple devices** (desktop, Android, iOS)
5. **Monitor Lighthouse scores** to ensure PWA compliance

## References

- [Next.js PWA Documentation](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)
- [Web App Manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)
- [PWA Builder](https://www.pwabuilder.com/)
