/**
 * app.config.js — replaces app.json
 * Reads non-secret environment variables and injects them as Expo constants.
 * Secrets must never be included in an Expo client bundle.
 */
const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const isDeviceBuild = Boolean(process.env.EAS_BUILD_PROFILE || process.env.EAS_BUILD === 'true');

if (isDeviceBuild && !/^https:\/\//i.test(apiBaseUrl)) {
  throw new Error('Device builds require EXPO_PUBLIC_API_URL to be an externally reachable HTTPS endpoint.');
}

module.exports = {
  expo: {
    name: 'MediChain SL',
    slug: 'medichain-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/app-icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000728',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.medichain.patient',
    },
    android: {
      allowBackup: false,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000728',
      },
      package: 'com.medichain.patient',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-image-picker',
        {
          photosPermission: 'MediChain needs access to your photos to upload medical reports.',
          cameraPermission: 'MediChain needs camera access to capture medical documents.',
        },
      ],
    ],
    extra: {
      apiBaseUrl,
      dataClassification: process.env.EXPO_PUBLIC_DATA_CLASSIFICATION || 'synthetic',
      eas: {
        projectId: '1d5aa398-bfc2-422e-8ae5-0ff556a1f4d4',
      },
    },
  },
};
