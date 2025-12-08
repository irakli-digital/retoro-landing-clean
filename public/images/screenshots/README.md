# App Screenshot Images

## Image Specifications

Place your vertical app screenshot images in this directory with the following specifications:

### Required Images
You need 6 vertical screenshots of your Retoro app:
- `app-screenshot-1.webp` - Track purchases screen
- `app-screenshot-2.webp` - Return deadlines overview
- `app-screenshot-3.webp` - Receipt scanning feature
- `app-screenshot-4.webp` - Push notifications settings
- `app-screenshot-5.webp` - Money saved tracker
- `app-screenshot-6.webp` - Multi-currency support

### Image Dimensions
**Recommended dimensions:**
- **Primary**: 1170 x 2532 pixels (iPhone 14 Pro Max - 9:19.5 aspect ratio)
- **Alternative**: 1080 x 2340 pixels (Standard Android - 9:19.5 aspect ratio)
- **Minimum**: 900 x 1950 pixels (maintain 9:19.5 ratio)

### Format & Optimization
- **Format**: WebP (preferred) or PNG/JPG
- **File size**: Aim for under 200KB per image
- **Quality**: 85% compression for WebP

### How to Create WebP Images

#### Using online tools:
1. Visit https://squoosh.app/
2. Upload your PNG/JPG screenshot
3. Select WebP format
4. Adjust quality to ~85%
5. Download

#### Using command line (if you have cwebp installed):
```bash
cwebp -q 85 input.png -o app-screenshot-1.webp
```

#### Using ImageMagick:
```bash
convert input.png -quality 85 app-screenshot-1.webp
```

### Design Tips for Screenshots
1. **Use device mockups**: Place your app screens in iPhone/Android mockups
2. **Show key features**: Each screenshot should highlight a specific feature
3. **Clean UI**: Ensure text is readable and UI elements are clear
4. **Consistent theme**: Use the same device frame/style for all screenshots
5. **Status bar**: Include realistic status bar (time, battery, signal)

### Example Naming
- ✅ app-screenshot-1.webp
- ✅ app-screenshot-2.webp
- ❌ screenshot1.png
- ❌ retoro-screen-1.jpg

## Slider Behavior
- Auto-advances every 3.5 seconds
- Pauses on hover
- Supports keyboard navigation (← →)
- Touch/swipe enabled on mobile
- Dot indicators show current slide
- Smooth fade transitions between images
