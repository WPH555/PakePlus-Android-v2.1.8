import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aeromarinx.app',
  appName: 'AeroMarinX',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;