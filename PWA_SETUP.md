# 📱 PWA Setup Guide

Your PSL Predictor app is now a Progressive Web App! Users can install it like a native app.

## What's Included

✅ Web App Manifest (`/public/manifest.json`)
✅ Service Worker (`/public/sw.js`) 
✅ App Icons (192x192, 512x512)
✅ Install Prompt Component
✅ Offline Support
✅ iOS & Android Support

## How It Works

### Automatic Install Prompt
- Shows on dashboard after page load
- Only appears once (dismissible)
- Stored in localStorage to avoid spam

### Manual Installation

**Android (Chrome/Edge)**
1. Visit the website
2. Tap "Install" on the prompt, or
3. Menu (⋮) → "Add to Home Screen"

**iOS (Safari 16.4+)**
1. Visit the website
2. Tap Share button (□↑)
3. Scroll down → "Add to Home Screen"
4. Tap "Add"

**Desktop (Chrome/Edge)**
1. Visit the website
2. Click install icon in address bar (⊕), or
3. Click the install prompt

## Features

- **Offline Access**: Cached pages work without internet
- **Home Screen Icon**: Quick access like native apps
- **Full Screen**: No browser UI when launched
- **Fast Loading**: Service worker caches assets
- **Push Notifications**: Ready for future implementation

## Customization

### Change App Name
Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name"
}
```

### Change Theme Color
Edit `public/manifest.json`:
```json
{
  "theme_color": "#dc2626",
  "background_color": "#000000"
}
```

### Update Icons
Replace files in `/public/`:
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

### Modify Cached Pages
Edit `public/sw.js` → `urlsToCache` array

## Testing

1. Run dev server: `npm run dev`
2. Open in Chrome: `http://localhost:3000`
3. Open DevTools → Application → Manifest
4. Check "Service Workers" tab
5. Test install prompt

## Production Deployment

PWA works best on HTTPS. Deploy to:
- Vercel (automatic HTTPS)
- Netlify (automatic HTTPS)
- Any hosting with SSL certificate

## Browser Support

| Browser | Install | Offline | Notifications |
|---------|---------|---------|---------------|
| Chrome Android | ✅ | ✅ | ✅ |
| Safari iOS 16.4+ | ✅ | ✅ | ❌ |
| Chrome Desktop | ✅ | ✅ | ✅ |
| Edge Desktop | ✅ | ✅ | ✅ |
| Firefox | ⚠️ | ✅ | ✅ |

## Troubleshooting

**Install prompt not showing?**
- Clear browser cache
- Check DevTools → Console for errors
- Ensure HTTPS (or localhost)
- Check if already installed

**Service worker not registering?**
- Check DevTools → Application → Service Workers
- Look for registration errors in Console
- Ensure `/sw.js` is accessible

**iOS not working?**
- Requires Safari (not Chrome)
- Requires iOS 16.4 or later
- Must use "Add to Home Screen" manually

## Next Steps

- Add push notifications
- Implement background sync
- Add offline prediction queue
- Create app update prompt
