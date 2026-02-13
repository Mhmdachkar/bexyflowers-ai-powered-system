# Business Information Setup Guide

## Overview
Configure your business contact information in Admin Settings → Business Information section.

## 📱 WhatsApp Click to Chat URL

### Format
```
https://wa.me/PHONENUMBER
```

### How to Get Your WhatsApp URL

1. **Get Your Phone Number in International Format**
   - Remove all spaces, dashes, and plus signs
   - Include country code
   - Example: Lebanon (+961 3 123 456) → 9613123456

2. **Create the URL**
   ```
   https://wa.me/9613123456
   ```

3. **With Pre-filled Message (Optional)**
   ```
   https://wa.me/9613123456?text=Hello%20Bexy%20Flowers
   ```

### Examples:
✅ **Correct**:
- `https://wa.me/9613123456`
- `https://wa.me/9613123456?text=Hello`
- `https://wa.me/14155238886`

❌ **Incorrect**:
- `wa.me/123` (missing https://)
- `https://wa.me/+961 3 123 456` (has spaces and +)
- `https://whatsapp.com/9613123456` (wrong domain)

## 🗺️ Google Maps Location URL

### How to Get Your Google Maps URL

#### Method 1: Google Maps Website (Recommended)
1. Go to [Google Maps](https://maps.google.com)
2. Search for your business or drop a pin at your location
3. Click the **"Share"** button (or three dots menu)
4. Click **"Copy link"**
5. You'll get a short URL like: `https://maps.app.goo.gl/ABC123xyz`

#### Method 2: Google Maps Mobile App
1. Open Google Maps app
2. Long-press your location to drop a pin
3. Tap the location card at the bottom
4. Tap **"Share"**
5. Copy the link

#### Method 3: Google My Business
1. Go to [Google My Business](https://business.google.com)
2. Select your business
3. Find the "Share your Business Profile" link
4. Copy the URL

### Valid Google Maps URL Formats:
✅ **Accepted**:
- `https://maps.app.goo.gl/ABC123xyz` (Short link - recommended)
- `https://www.google.com/maps/place/...` (Full link)
- `https://goo.gl/maps/ABC123` (Legacy short link)
- `https://google.com/maps/@33.8937913,35.5017766,17z`

❌ **Not Accepted**:
- `maps.google.com/...` (missing https://)
- `www.google.com/search?q=location` (search link, not maps)

## 📍 Step-by-Step: Add Your Business to Google Maps

If your business isn't on Google Maps yet:

1. **Visit Google My Business**
   - Go to https://business.google.com
   - Sign in with your Google account

2. **Add Your Business**
   - Click "Add your business to Google"
   - Enter business name: "Bexy Flowers"
   - Select category: "Florist" or "Flower Shop"

3. **Add Location**
   - Choose if you have a physical location customers can visit
   - Enter your full address
   - Drag the map pin to exact location

4. **Add Contact Info**
   - Phone: Your business phone number
   - Website: https://bexyflowers.com
   - Hours: Your business hours

5. **Verify Your Business**
   - Google will send a verification code (by mail or phone)
   - Enter the code to verify

6. **Get Your Map Link**
   - Once verified, click "Share your Business Profile"
   - Copy the link for use in settings

## 💼 Complete Business Information Example

```javascript
{
  "whatsappUrl": "https://wa.me/9613123456",
  "googleMapsUrl": "https://maps.app.goo.gl/ABC123xyz",
  "phoneNumber": "+961 3 123 456",
  "address": "Beirut, Lebanon"
}
```

## 🧪 Testing Your URLs

### Test WhatsApp URL:
1. Copy your WhatsApp URL
2. Paste it in a new browser tab
3. It should open WhatsApp Web or app
4. Should show option to chat with your number

### Test Google Maps URL:
1. Copy your Google Maps URL
2. Paste it in a new browser tab
3. It should open Google Maps
4. Should show your exact business location

## 🔧 Troubleshooting

### WhatsApp URL Issues:
- **"Invalid WhatsApp click to chat link"**
  - Check format: Must start with `https://wa.me/`
  - Remove spaces, dashes, and + from phone number
  - Include country code

### Google Maps URL Issues:
- **"Invalid Google Maps link"**
  - Make sure link starts with `https://`
  - Use a Google Maps share link, not a search link
  - Try getting a new short link from Google Maps

### Phone Number Format:
- **International Format**: +[Country Code][Number]
- **Lebanon**: +961 3 123 456
- **USA**: +1 415 555 0123
- **UAE**: +971 50 123 4567

## 📝 Where This Information is Used

Your business information will appear:
- Footer contact section
- Contact page
- Checkout page (for customer support)
- Email templates
- WhatsApp quick contact button

## 🔒 Security Note

- Your WhatsApp number will be publicly visible
- Anyone can click the link to start a conversation
- Consider using a business WhatsApp number, not personal
- Use WhatsApp Business app for better customer management

## ❓ Need Help?

If you're having trouble:
1. Double-check the URL format examples above
2. Test the URL in your browser first
3. Make sure your business is verified on Google Maps
4. For WhatsApp, verify the number is correct and active

---

**Last Updated**: 2026-02-12
**Status**: ✅ Active
