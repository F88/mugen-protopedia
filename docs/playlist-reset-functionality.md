# Playlist RESET Functionality

## Overview
When the RESET button is pressed in playlist mode, the application now clears both the playlist title and URL parameters, returning the state to a clean base mode.

## Behavior

### Before RESET
- Playlist title is visible
- URL contains playlist parameters (e.g., `/?id=1,2,3&title=My%20Playlist`)
- Playlist state is active with IDs and title

### After RESET
- Playlist title is cleared
- URL is updated to base path (`/`)
- Play mode is reset to `normal`
- All playlist-related state is cleared:
  - `processedCount` reset to 0
  - `playlistQueueRef` cleared
  - `lastProcessedPlaylistSignatureRef` cleared
  - Playlist processing timeout cancelled

## Implementation Details

### Code Location
- **File**: `app/home-content.tsx`
- **Function**: `handleClearPrototypes()`

### Key Changes
1. Added `useRouter()` hook from Next.js navigation
2. Enhanced `handleClearPrototypes()` to detect playlist mode
3. When in playlist mode:
   - Sets play mode state to `{ type: 'normal' }`
   - Clears all playlist-related state variables
   - Calls `router.replace('/', { scroll: false })` to update URL
   - Logs the reset operation

### Dependencies
- `next/navigation` - for URL manipulation
- Existing state management in `HomeContent` component

## Edge Cases Handled
1. **Playlist Still Playing**: RESET is disabled while playlist is actively playing
2. **Normal Mode**: RESET in normal mode only clears slots, doesn't modify URL
3. **Timeout Cleanup**: Any pending playlist processing timeouts are properly cancelled

## Testing
- All existing tests pass (364 tests)
- PlaylistTitleCard already handles empty title correctly
- Linting passes with no errors

## Related Issues
- Implements enhancement from issue #67 (if applicable)
- Addresses state consistency concerns from issue #66

## User Benefits
- Prevents confusion from visible old title after data is cleared
- Ensures copied URL does not reference a cleared playlist
- Clean return to initial blank state aligns with user expectations
