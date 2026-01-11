# VidSpark — كلّه من التلفون (APK + Backend على Termux)

## الهدف
- تطلع APK يتثبت ويفتح (Debug APK)
- وتشغّل الـ API على نفس التلفون باستخدام Termux
- التطبيق هيكلم الـ API على: http://127.0.0.1:4000

---

## 1) طلّع APK من GitHub Actions (من غير Android Studio)
1) اعمل Repo جديد على GitHub (مثلاً: vidspark)
2) ارفع **كل ملفات** المشروع (فك الضغط ثم Upload)
3) روح: Actions
4) شغّل Workflow: **Build APK (Phone-only installable)**
5) بعد ما يخلص: نزّل Artifact اسمه:
   **VidSpark-app-debug-apk**
6) فكّه وخد الملف:
   `app-debug.apk` وثبّته على الموبايل

> لو GitHub سأل عن Permission للـ Actions وافق.

---

## 2) شغّل الـ Backend على نفس التلفون (Termux)
### أ) تثبيت Termux
- الأفضل من F-Droid.

### ب) جهّز صلاحية التخزين
افتح Termux واكتب:
```bash
termux-setup-storage
```

### ج) نزّل Node + FFmpeg
```bash
pkg update -y
pkg install -y nodejs ffmpeg git unzip
```

### د) حط المشروع في Termux
- خليه في Download ثم في Termux:
```bash
cd /storage/emulated/0/Download
# لو المشروع عندك ZIP باسم مختلف غيّره هنا
unzip VidSpark-Phone-Only.zip -d vidspark
cd vidspark/backend
```

### هـ) شغّل الـ API
```bash
npm install
npm run dev
```

هيشتغل على:
`http://127.0.0.1:4000`

### و) افتح التطبيق
- افتح APK اللي ثبتّه
- اعمل Register/Login
- جرّب Upload/Generate

> مهم: سيب Termux شغال والـ API شغال وإلا التطبيق مش هيلاقي السيرفر.

---

## مشاكل شائعة وحلها
- **التطبيق مش بيجيب فيد / Error Network**
  - اتأكد Termux شغال وفيه سطر بيقول API running
  - اتأكد إنك بتستخدم APK اللي اتبنى بالـ workflow ده
- **رفع ملفات من الموبايل**
  - الأفضل تختار ملفات من الموبايل عادي من داخل التطبيق (Upload)
