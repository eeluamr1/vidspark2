# تنزيل APK مباشر “يتثبت ويشتغل” من غير Android Studio (باستخدام GitHub Actions)

## ده هيطلع ايه؟
- **Debug APK**: بيكون **موقّع تلقائياً** (debug signing) => **يتثبت عادي** على الموبايل ويفتح مباشرة.

> لو انت عايز Release APK موقّع باسمك (Signing/Keystore) قولّي وانا أجهز workflow تاني للتوقيع بالـ secrets.

---

## الخطوات (من الموبايل أو الكمبيوتر)
1) اعمل Repo جديد على GitHub
2) ارفع كل ملفات المشروع (فك الضغط وارفع المجلد)
3) روح: **Settings > Secrets and variables > Actions**
   - (اختياري) ضيف Secret اسمه:
     - `VITE_API_BASE` = رابط الـ API بتاعك
       مثال: `http://192.168.1.5:4000` أو `https://api.yourdomain.com`

4) روح تبويب **Actions**
5) افتح Workflow اسمه **Build APK (installable)**
6) اضغط **Run workflow**

بعد ما يخلص:
- هتلاقي تحت الـ run قسم **Artifacts**
- نزّل `VidSpark-debug-apk`
- جواه `app-debug.apk` => ثبته على الموبايل

---

## مهم جدًا: رابط الـ API داخل التطبيق
- **ماينفعش تستخدم localhost**
- لازم IP جهازك على نفس Wi‑Fi أو دومين/HTTPS
