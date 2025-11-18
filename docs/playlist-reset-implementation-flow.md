# Playlist RESET - Implementation Flow

## State Flow When RESET is Pressed in Playlist Mode

### Initial State (Playlist Mode Active)
```
URL: /?id=1,2,3&title=My%20Playlist
playModeState: { type: 'playlist', ids: [1,2,3], title: 'My Playlist' }
isPlaylistMode: true
isPlaylistPlaying: false (after completion)
isPlaylistCompleted: true
processedCount: 3
PlaylistTitleCard: VISIBLE with title "My Playlist"
```

### User Action
```
User clicks RESET button → handleClearPrototypes() is called
```

### State Transitions

1. **Check if playlist is playing**
   ```javascript
   if (isPlaylistPlaying) return; // Early exit if still playing
   ```

2. **Clear prototype slots**
   ```javascript
   clearSlots();
   ```

3. **Detect playlist mode and reset**
   ```javascript
   if (playModeState.type === 'playlist') {
     // Reset play mode to normal
     setPlayModeState({ type: 'normal' });
     
     // Clear playlist-related state
     setIsPlaylistPlaying(false);
     setIsPlaylistCompleted(false);
     setProcessedCount(0);
     playlistQueueRef.current = [];
     lastProcessedPlaylistSignatureRef.current = null;
     
     // Clear timeout
     if (playlistProcessingTimeoutRef.current !== null) {
       window.clearTimeout(playlistProcessingTimeoutRef.current);
       playlistProcessingTimeoutRef.current = null;
     }
     
     // Update URL
     router.replace('/', { scroll: false });
   }
   ```

### Final State (Normal Mode)
```
URL: /
playModeState: { type: 'normal' }
isPlaylistMode: false
isPlaylistPlaying: false
isPlaylistCompleted: false
processedCount: 0
PlaylistTitleCard: NOT RENDERED (component conditional on isPlaylistMode)
```

## Component Render Logic

### Before RESET
```jsx
const isPlaylistMode = playModeState.type === 'playlist'; // true

const playlistTitleCardProps = isPlaylistMode
  ? {
      className: 'mx-auto',
      ids: playModeState.ids,        // [1, 2, 3]
      title: playModeState.title,     // "My Playlist"
      processedCount,                 // 3
      totalCount: playlistTotalCount, // 3
      isCompleted: isPlaylistCompleted, // true
      isPlaying: isPlaylistPlaying,   // false
      variant: playlistVariant,
      fontFamily: playlistFont,
    }
  : null;

// Renders:
{isPlaylistMode && playlistTitleCardProps && (
  <PlaylistTitleCard {...playlistTitleCardProps} />
)}
```

### After RESET
```jsx
const isPlaylistMode = playModeState.type === 'playlist'; // false

const playlistTitleCardProps = isPlaylistMode
  ? { /* ... */ }
  : null; // null because isPlaylistMode is false

// Does NOT render:
{isPlaylistMode && playlistTitleCardProps && ( // false && null
  <PlaylistTitleCard {...playlistTitleCardProps} />
)}
```

## URL Updates

### Via Next.js Router
```javascript
// Uses shallow routing to avoid page reload
router.replace('/', { scroll: false });
```

This:
- Updates the browser URL from `/?id=1,2,3&title=My%20Playlist` to `/`
- Does NOT trigger a full page reload
- Does NOT scroll the page
- Clears browser history entry (replace, not push)
- Updates Next.js metadata (document title)

## Next.js Metadata Update

When the URL changes, Next.js automatically re-runs the metadata generation:

```typescript
// app/page.tsx - generateMetadata
const title = buildTitleFromSearchParams(resolved);
// After RESET: returns APP_TITLE ("Mugen ProtoPedia")
// Before RESET: returns "My Playlist (3) | Mugen ProtoPedia"
```

## Edge Case: RESET While Playing

```javascript
const handleClearPrototypes = useCallback(() => {
  if (isPlaylistPlaying) return; // Blocked!
  // ... rest of reset logic
}, [/* ... */]);
```

The RESET button is also disabled in the UI:
```jsx
<ControlPanel
  controlPanelMode={isPlaylistPlaying ? 'loadingPlaylist' : 'normal'}
  // ...
/>
```

In ControlPanel:
```jsx
<Button
  disabled={!canClearDisabled} // disabled when controlPanelMode === 'loadingPlaylist'
>
  RESET
</Button>
```

## Summary

The implementation ensures a complete state reset when RESET is pressed in playlist mode:
- ✅ Playlist title cleared (component not rendered)
- ✅ URL parameters removed
- ✅ All state variables reset
- ✅ No memory leaks (timeouts cancelled)
- ✅ Clean return to normal mode
