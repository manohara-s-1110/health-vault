// app.config.js
module.exports = {
  expo: {
    name: "healthvault",
    slug: "healthvault",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "healthvault",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      // --- I've removed the redundant infoPlist permissions ---
      // The 'expo-image-picker' plugin handles this.
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      "bundleIdentifier": "com.manohara.healthvault"
    },
    // --- The first 'plugins' array that was here has been REMOVED ---

    android: {
      "package": "com.manohara.healthvault",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      "permissions": [
        "android.permission.NOTIFICATIONS"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },

    // --- THIS IS THE ONLY 'plugins' ARRAY ---
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-sqlite",
      "expo-web-browser",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/adaptive-icon.png",
          "color": "#ffffff"
        }
      ],
      // --- ADDED 'expo-image-picker' HERE ---
      [
        "expo-image-picker",
        {
          "photosPermission": "This app needs access to your photos to let you upload reports.",
          "cameraPermission": "This app needs access to your camera to let you take photos of reports."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Firebase keys
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      
      // Google Maps key
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,

      // EAS Project ID
      "eas": {
        "projectId": "52f70aa1-fb65-4805-b629-ea76b8a67f60"
      }
    }
  }
};