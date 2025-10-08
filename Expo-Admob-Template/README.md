# Expo AdMob Integration

A simple Expo React Native app with Google AdMob banner and interstitial ads.

## Features

- Banner Ad - Displays at the bottom of the screen
- Interstitial Ad - Full-screen ad triggered by button click
- Test Ads - Google test ads in development mode
- Environment Variables - Secure AdMob ID management with .env

---

## Step 1: Clone This Project

Download this project to your computer:

```bash
git clone <repo-url>
cd my-app
```

---

## Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

---

## Step 3: Create Your AdMob Account

1. Go to https://admob.google.com/
2. Sign in with your Google account
3. Click "Get Started" or "Apps" then "Add App"

---

## Step 4: Create Your App in AdMob

1. Click "Add App"
2. Choose Android or iOS
3. Enter your app name (example: "My App")
4. Click "Add"
5. Copy your App ID - Format:
   ```
   ca-app-pub-1234567890123456~1234567890
   ```

---

## Step 5: Create Ad Units

### Create Banner Ad:

1. In AdMob, click "Ad Units" then "Add Ad Unit"
2. Select "Banner"
3. Enter a name (example: "bottom-banner")
4. Click "Create Ad Unit"
5. Copy the Ad Unit ID - Format:
   ```
   ca-app-pub-1234567890123456/1234567890
   ```

### Create Interstitial Ad:

1. Click "Ad Units" then "Add Ad Unit"
2. Select "Interstitial"
3. Enter a name (example: "test-interstitial")
4. Click "Create Ad Unit"
5. Copy the Ad Unit ID

---

## Step 6: Configure Environment Variables

1. In the project folder, find `.env.example`
2. Copy this file and rename it to `.env`
3. Open `.env` and add your AdMob IDs:

```env
# Google AdMob Configuration
ADMOB_ANDROID_APP_ID=ca-app-pub-YOUR-APP-ID-HERE~XXXXXXXXXX
ADMOB_IOS_APP_ID=ca-app-pub-YOUR-APP-ID-HERE~XXXXXXXXXX

# AdMob Ad Unit IDs
ADMOB_BANNER_AD_UNIT_ID=ca-app-pub-YOUR-APP-ID-HERE/XXXXXXXXXX
ADMOB_INTERSTITIAL_AD_UNIT_ID=ca-app-pub-YOUR-APP-ID-HERE/XXXXXXXXXX
```

Replace `YOUR-APP-ID-HERE` with your actual AdMob IDs from Step 4 and Step 5.

---

## Step 7: Build the App

AdMob requires a development build and does not work with Expo Go.

### Option A: Build on EAS Cloud (Recommended)

1. Install EAS CLI:

   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:

   ```bash
   eas login
   ```

3. Configure EAS (if not already done):

   ```bash
   eas build:configure
   ```

4. Build for Android:

   ```bash
   eas build --profile development --platform android
   ```

5. Wait 5-10 minutes for the build to complete
6. Download the APK file to your Android phone
7. Install the APK on your phone

### Option B: Build Locally (Requires Android Studio)

1. Ensure Android Studio and Android SDK are installed
2. Run prebuild:
   ```bash
   npx expo prebuild --clean
   ```
3. Build and run:
   ```bash
   npx expo run:android
   ```

---

## Step 8: Run the Development Server

1. Start the development server:

   ```bash
   npx expo start --dev-client
   ```

2. Open the development build app on your phone

3. Connect to your development server by:

   - Scanning the QR code
   - Or entering the URL manually: `exp://YOUR-IP-ADDRESS:8081`

4. You will see:
   - Banner ad at the bottom of the screen
   - Button in the center to show interstitial ad

---

## Testing

### Development Mode:

- App displays Google test ads (not real ads)
- Safe for testing - will not violate AdMob policies

### Production Mode:

- App displays your real ads from AdMob
- Revenue-generating ads

---

## Project Structure

```
my-app/
├── app/
│   ├── _layout.tsx                  # App layout, AdMob initialization
│   ├── index.tsx                    # Home screen
│   └── banner-ad-screen.tsx         # Banner ad screen
├── .env                             # Your AdMob IDs (not in git)
├── .env.example                     # Example environment file
├── app.config.ts                    # Expo configuration (reads .env)
└── package.json                     # Dependencies
```

---

## Security

### .env File

- DO NOT share this file
- DO NOT commit to git
- Contains your private AdMob IDs

### .env.example File

- Safe to share
- Template for required environment variables
- Contains placeholder values

---

## Troubleshooting

### Problem: "No ad to show" or "No ad inventory"

**Solution:** Wait 1 hour after creating ad units in AdMob. New ad units need time to activate.

### Problem: "Module not found: react-native-google-mobile-ads"

**Solution:** Ensure you created a development build. AdMob does not work with Expo Go.

### Problem: Ads not showing in production

**Solution:**

1. Verify `.env` file has correct IDs
2. Wait 24-48 hours for AdMob account approval
3. Check AdMob dashboard for policy violations

---

## How It Works

1. App starts - AdMob initializes (see `app/_layout.tsx`)
2. Development mode - Shows Google test ads
3. Production mode - Shows your real ads from `.env` file
4. User clicks button - Interstitial ad displays
5. User closes ad - New ad loads automatically

---

## Resources

- AdMob Help: https://support.google.com/admob
- Expo Documentation: https://docs.expo.dev/
- React Native Google Mobile Ads: https://docs.page/invertase/react-native-google-mobile-ads

---

## License

MIT License - Free to use for your projects.
