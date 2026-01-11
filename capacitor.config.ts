import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vidspark.app',
  appName: 'VidSpark',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // لو هتشغل الـ API على نفس الموبايل (localhost) استخدم IP جهازك على الشبكة بدل localhost داخل التطبيق
    // مثال: "http://192.168.1.5:4000"
    // ملاحظة: في Capacitor، 'localhost' داخل التطبيق يعني الموبايل نفسه.
    androidScheme: 'http'
  }
};

export default config;
