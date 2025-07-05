// frontend/app.config.js
import 'dotenv/config'   // ← これで .env が process.env に入る

export default {
  expo: {
    name: 'frontend',
    slug: 'frontend',
    version: '1.0.0',
    orientation: 'portrait',

    // アイコンなどは従来どおり
    icon: './assets/images/icon.png',
    scheme: 'frontend',
    userInterfaceStyle: 'automatic',
    experiments: { typedRoutes: true },

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.frontend',
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.anonymous.frontend',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      // Expo Router 用プラグインは自動で有効なので外してもOK
      // 'expo-router',
      [
        'expo-splash-screen',
        {
          image:          './assets/images/splash-icon.png',
          imageWidth:     200,
          resizeMode:     'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],

    // ← ここだけ動的に .env から読み込む
    extra: {
      apiHost:          process.env.API_HOST,
      apiPort:          process.env.API_PORT,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
}