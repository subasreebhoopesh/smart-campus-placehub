# Company Cards Clickable - Complete ✅

## What Was Done

Made all company cards on the homepage clickable links that open the company's career website in a new tab.

## Changes Made

### Updated Home Page (`src/pages/Home.tsx`)

Wrapped each company card with an anchor tag (`<a>`) that:
- Opens company career website in new tab (`target="_blank"`)
- Uses `rel="noopener noreferrer"` for security
- Has `cursor-pointer` class for better UX
- Maintains all hover effects and styling

## Company Links Added

1. **Google** → https://www.google.com/careers
2. **Microsoft** → https://careers.microsoft.com
3. **Amazon** → https://www.amazon.jobs
4. **TCS** → https://www.tcs.com/careers
5. **Infosys** → https://www.infosys.com/careers
6. **Wipro** → https://careers.wipro.com
7. **Cognizant** → https://careers.cognizant.com
8. **Accenture** → https://www.accenture.com/careers
9. **IBM** → https://www.ibm.com/careers
10. **Oracle** → https://www.oracle.com/careers
11. **Capgemini** → https://www.capgemini.com/careers
12. **HCL Tech** → https://www.hcltech.com/careers

## Features

- **Clickable Cards**: All company cards are now clickable
- **New Tab**: Opens in new tab so users don't lose their place
- **Cursor Change**: Pointer cursor shows cards are clickable
- **Hover Effects**: All existing hover animations maintained
- **Security**: Uses `rel="noopener noreferrer"` for security best practices

## How It Works

When a user clicks on any company card:
1. Browser opens a new tab
2. Navigates to the company's official career page
3. Original page stays open in background
4. User can explore job opportunities directly

## User Experience

- Visual feedback with cursor change on hover
- Card scales up on hover (existing animation)
- Shadow increases on hover (existing animation)
- Smooth transition to company website
- Easy to return to placement portal

## Technical Details

### HTML Structure
```tsx
<a href="https://company-url.com" target="_blank" rel="noopener noreferrer" className="block">
  <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
    {/* Card content */}
  </Card>
</a>
```

### Security
- `target="_blank"` - Opens in new tab
- `rel="noopener noreferrer"` - Prevents security vulnerabilities
  - `noopener` - Prevents new page from accessing window.opener
  - `noreferrer` - Doesn't send referrer information

### Styling
- `cursor-pointer` - Shows hand cursor on hover
- `h-full` - Ensures consistent card heights
- `block` - Makes anchor fill full width

## Testing

1. Go to homepage: http://localhost:8080
2. Scroll to "Our Recruiting Partners" section
3. Hover over any company card (cursor changes to pointer)
4. Click on any company card
5. New tab opens with company career page
6. Original tab remains open

## Status: COMPLETE ✅

All company cards are now clickable and redirect to their official career websites!
