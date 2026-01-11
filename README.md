# VidSpark MVP (Video Generator + Social Feed)

> **مهم**: ده مشروع MVP تعليمي/مبدئي بيقدم *فئات مزايا مشابهة* (Feed/Shorts/Profiles/Follow/Likes/Comments + مولّد فيديو بسيط).
> ماينفعش قانونيًا أو عمليًا تعمل "نسخة كاملة" من Facebook/YouTube/TikTok أو تنسخ تصميمهم/شعاراتهم/كودهم.  
> تقدر تبني تطبيق أصلي بمزايا قريبة وبشكل مستقل — وده اللي بيعمله المشروع ده.

## المزايا داخل الـ MVP
- تسجيل/تسجيل دخول (JWT)
- بروفايل + متابعة (Follow)
- فيد فيديوهات (Feed)
- رفع فيديو (Upload)
- لايك/تعليق
- مولّد فيديو بسيط: يحوّل صور + موسيقى اختيارية إلى فيديو (Server-side عبر FFmpeg)
- صفحة مشاهدة فيديو مفردة (Watch)
- بحث بسيط (بالـ caption/hashtags)

## المتطلبات
- Node.js 18+  
- FFmpeg مثبت على جهازك (أو Docker)

## تشغيل سريع (بدون Docker)
### 1) API
```bash
cd backend
npm install
npm run dev
```

### 2) Frontend
في نافذة تانية:
```bash
cd frontend
npm install
npm run dev
```

- الواجهة: http://localhost:5173
- الـ API: http://localhost:4000

## تشغيل بـ Docker (اختياري)
```bash
docker compose up --build
```

## ملاحظات مهمة عن “تكامل” Facebook/YouTube/TikTok
لو عايز مشاركة/رفع تلقائي على منصات تانية:
- لازم تستخدم الـ APIs الرسمية لكل منصة + OAuth + مراجعات صلاحيات.
- في قيود كبيرة على بعض الوظائف (خصوصًا تيك توك/يوتيوب) ومش هتقدر تعمل "كل شيء" زي التطبيقات الأصلية.
- المشروع ده بيقدم **Share links** + مكان تضيف Integrations لاحقًا.

## هيكل المشروع
- `backend/` Express API + SQLite (ملف db محلي) + رفع ملفات + توليد فيديو عبر FFmpeg
- `frontend/` React (Vite) UI بسيطة

## أمان/إنتاج
ده MVP. قبل الإنتاج:
- استخدم Postgres/MySQL بدل SQLite الملفي
- Rate limiting + CSRF + التحقق من الملفات
- تخزين S3/Cloud storage للملفات
- ترميز فيديوهات (HLS/DASH) + CDN
- نظام بلاغات/مراجعة محتوى
