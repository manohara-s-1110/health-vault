module.exports = {
  expo: {
    name: "HealthVault", // Changed to Capitalized for better display
    slug: "healthvault",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png", // Ensure your new logo is saved here!
    scheme: "healthvault",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      bundleIdentifier: "com.manohara.healthvault"
    },
    android: {
      package: "com.manohara.healthvault",
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
      permissions: [
        "android.permission.NOTIFICATIONS"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
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
          icon: "./assets/images/adaptive-icon.png",
          color: "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you upload medical reports.",
          cameraPermission: "The app accesses your camera to let you scan medical reports."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "52f70aa1-fb65-4805-b629-ea76b8a67f60"
      }
    }
  }
};