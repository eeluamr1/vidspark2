# تحويل VidSpark إلى Android APK (Capacitor)

## الفكرة
هنحوّل واجهة الويب (React) إلى تطبيق Android باستخدام **Capacitor** (WebView Wrapper).  
الـ Backend (Express API) يفضل يشتغل على سيرفر/VM/VPS أو جهازك على نفس الشبكة.

---

## 0) المتطلبات على جهازك
- Node.js 18+
- Android Studio (وفيه Android SDK + Platform Tools)
- Java 17 (عادة Android Studio بيظبطها لوحده)
- (اختياري) جهاز Android فعلي للتجربة

---

## 1) تشغيل الـ API (Backend)
### خيار A: على نفس جهازك (PC) وتجربة على الموبايل
- شغّل الـ API:
```bash
cd backend
npm install
npm run dev
```

هتحتاج تعرف IP جهازك على الشبكة (مثال: 192.168.1.5).

### خيار B: على سيرفر
ارفع backend على VPS وخلي عندك URL ثابت (https://api.yourdomain.com)

---

## 2) ضبط رابط الـ API للـ Android
داخل `frontend` عندنا env اسمه:
- `VITE_API_BASE`

### لو الـ API على جهازك:
اكتب في `frontend/.env` (أنشئه لو مش موجود):
```
VITE_API_BASE=http://192.168.1.5:4000
```

> مهم: **ما تكتبش localhost** لأن داخل التطبيق localhost = الموبايل.

---

## 3) توليد مشروع Android
من داخل `frontend`:
```bash
cd frontend
npm install
npm run build
npm run cap:init
npm run cap:add:android
npm run cap:sync
```

---

## 4) فتح المشروع في Android Studio وبناء APK
```bash
npm run cap:open:android
```

في Android Studio:
- Build > Build Bundle(s) / APK(s) > Build APK(s)
هتلاقي الـ APK في:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 5) ملاحظات مهمة
- ده Wrapper للواجهة فقط. الفيديوهات اللي بترفعها هتروح للـ API (السيرفر).
- للإنتاج: استخدم HTTPS + دومين + تخزين ملفات (S3/Cloud) + CDN.
- لو عايز Notifications / كاميرا / رفع ملف متقدم… ممكن نضيف Plugins إضافية.

---

## Troubleshooting سريع
- لو Gradle اشتكى من Java: خليها JDK 17.
- لو الموبايل مش شايف الـ API: اتأكد إنهم على نفس Wi‑Fi وإن الفايروول سامح للـ PORT 4000.
