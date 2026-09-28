# ДҮҮХЭЭ гутлын дэлгүүр

Онлайн дэлгүүр + эзэмшигчийн удирдлагын самбар.
Vite + React 19 + TypeScript + React Router + CSS Modules + Firebase (Firestore, Auth, Storage) + Leaflet.

## Хуудсууд

| Зам                        | Хуудас                                             |
| -------------------------- | -------------------------------------------------- |
| `/`                        | Нүүр хуудас (баннер, мэдэгдэл, шинэ бараа)          |
| `/products`                | Бүх бараа — зүүн талдаа шүүлтүүртэй                 |
| `/product/:id`             | Барааны хуудас                                     |
| `/location`                | Дэлгүүрийн байршил, газрын зураг                    |
| `/cart`, `/checkout`       | Сагс, захиалга өгөх                                 |
| `/admin`                   | Удирдлага: самбар, захиалга, бараа, нөөц, тохиргоо |

## Ажиллуулах

```bash
npm install
npm run dev      # сайт (Firebase jdstore-mn-тэй шууд холбогдоно)
npm run build    # production build → dist/
npm run deploy   # build + Firebase Hosting руу байршуулах
npm run lint
```

Firebase-ийн тохиргоо `.env.local` файлд байгаа (git-д орохгүй). Шинэ компьютер дээр
`.env.example`-г `.env.local` болгон хуулж, Firebase console → Project settings → Your apps →
Web app-ийн утгуудыг бөглөнө.

## Firebase төсөл (jdstore-mn) — нэг удаагийн тохиргоо

1. **Firestore Database** үүсгэсэн ✓, аюулгүй байдлын дүрэм байршуулсан ✓
   (`firestore.rules`-г өөрчилбөл: `npx firebase deploy --only firestore:rules`).
2. **Authentication** → Email/Password идэвхжүүлсэн ✓.
3. **Storage** → *Get started* (барааны зураг байршуулахад хэрэгтэй; Blaze төлөвлөгөө шаардаж
   магадгүй). Идэвхжүүлсний дараа: `npx firebase deploy --only storage`.
   Storage-гүй бол admin дээр зургийн холбоос (URL эсвэл `/images/...`) оруулж болно.
4. **Админ нэмэх:** Authentication → Users → *Add user* → UID-г хуулах → Firestore → `admins`
   collection → Document ID = UID, талбар `role` = `admin`, `name` = харагдах нэр.
5. `/admin` → **Тохиргоо** → **Анхны тохиргоо**: эхний бараа, дэлгүүрийн мэдээлэл, захиалгын
   дугаарлалт (#1001-ээс) оруулна. Байгаа өгөгдлийг дарж бичихгүй.

## Бүтэц

```
src/
  models/      # бараа, захиалга, тохиргооны төрөл + туслах функцууд
  services/    # Firestore / Storage / Auth руу хандах бүх код
  hooks/       # realtime өгөгдлийн hook-ууд (useCatalog, useOrders ...)
  context/     # сагс, хадгалсан бараа (ShopProvider)
  components/  # Header, Footer, ProductCard, StoreMap ...
  pages/       # дэлгүүрийн хуудсууд
  admin/       # удирдлагын хэсэг
  data/        # цэс, текст (site.ts), анхны бараа (seed.ts)
firestore.rules, storage.rules   # хэн юуг унших/бичих эрхтэй
```

- **Бараа, үнэ, зураг, нөөц:** Admin → Бараа / Нөөц · размер.
- **Хаяг, утас, цаг, газрын зургийн байршил, банкны данс:** Admin → Тохиргоо.
- **Лого, цэс, footer-ийн холбоос:** `src/data/site.ts`.
- **Төлбөр:** захиалга одоогоор "төлбөр хүлээгдэж буй" төлөвтэй бүртгэгдэнэ; Bonum-ийг дараа холбоно.
  Холбохдоо үнийг сервер талд (Cloud Function) дахин тооцоолох хэрэгтэй — хэрэглэгчийн
  илгээсэн үнэд итгэж болохгүй.

## Responsive

- 1280px-ээс дээш — desktop дизайн (1440px дээр дизайнтай таарна; header 90px,
  "Шинэ бараа ирэхэд…" мөр 56px болгож намсгасан)
- 768–1279px — laptop / tablet
- 767px ба түүнээс доош — гар утасны дизайн (390px дээр дизайнтай таарна)
