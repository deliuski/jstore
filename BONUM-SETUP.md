# Bonum төлбөрийн систем холбох заавар

Урсгал:

```
Хэрэглэгч → Сагс → Захиалга → Bonum төлбөрийн цонх (QPay / SocialPay / Карт) → Захиалга амжилттай
```

Бүх нууц түлхүүр сервер талаас (Cloud Functions) хадгалагдана — клиент кодонд нууц мэдээлэл орохгүй.

---

## 1. Firebase Blaze төлөвлөгөө

Cloud Functions нь Blaze (төлбөртэй) төлөвлөгөө шаардана.

1. [Firebase Console](https://console.firebase.google.com) → таны төсөл → доод талын «Upgrade» товч.
2. **Blaze (pay as you go)** сонгоно. Хэрэглээ бага үед үнэ төлбөргүй хэмжээнд багтдаг.

---

## 2. Bonum-оос түлхүүр авах

Bonum-той гэрээ байгуулсны дараа тэд дараах мэдээллийг өгнө:

| Түлхүүр | Тайлбар |
|---|---|
| `BONUM_APP_SECRET` | Merchant апп-ийн нууц түлхүүр |
| `BONUM_TERMINAL_ID` | Терминалын дугаар |
| `BONUM_MERCHANT_CHECKSUM_KEY` | Webhook checksum түлхүүр (сонголттой) |
| Base URL | Тест: `https://testapi.bonum.mn` · Бодит: `https://apis.bonum.mn` |

---

## 3. Түлхүүрүүдийг Functions рүү оруулах

Төслийн хавтаас (ягиж бичихгүй, `printf` ашигла — newline орохгүй):

```bash
printf "<APP_SECRET>" | firebase functions:secrets:set BONUM_APP_SECRET --data-file -
printf "<TERMINAL_ID>" | firebase functions:secrets:set BONUM_TERMINAL_ID --data-file -
printf "<CHECKSUM_KEY>" | firebase functions:secrets:set BONUM_MERCHANT_CHECKSUM_KEY --data-file -
printf "https://jstore-henna.vercel.app" | firebase functions:secrets:set SITE_URL --data-file -
```

Нууц өөрчлөгдсөн бол дараа нь дахин deploy хийх:

```bash
firebase deploy --only functions
```

Орчин (test → production) солих бол дараах secret-ийг шинэчилнэ — `BONUM_BASE_URL`:

```bash
# Тест орчин (default — тавиагүй үед):
printf "https://testapi.bonum.mn" | firebase functions:secrets:set BONUM_BASE_URL --data-file -

# Бодит орчин руу шилжихэд:
printf "https://apis.bonum.mn" | firebase functions:secrets:set BONUM_BASE_URL --data-file -
```

---

## 4. Firestore: захиалгыг хүн уншиж чадах байх

Захиалгын хуудас (OrderSuccessPage) захиалгын төлбөрийн төлөвийг бодит цагт унших тул
**нэвтрээгүй хэрэглэгч** захиалгын документийг унших боломжтой байх шаардлагатай.
`firestore.rules` дээрх orders хэсгийг дараах байдлаар сольж, deploy хийнэ:

```
match /orders/{orderId} {
  allow read: if true; // төлбөрийн төлөв харахад зориулсан
  allow update, delete: if isAdmin();
  allow create: ... (өмнөхтох байсан шигээ)
}
```

⚠️ Анхаар: захиалгын документ нэр, утас зэрэг мэдээллийг агуулдаг — тохиромжгүй бол
webhook-оор тусгай `payment/{orderId}` документ үүсгэж, зөвхөн түүнийг нээлттэй болгох
вариант байдаг. Одоогийн шийдвэр: хэрэглэгчийн захиалгын дугаар л хэрэгтэй тул захиалгын
дугаараар нь унших боломжтой.

---

## 5. Deploy хийх

```bash
npm run deploy           # вэбсайт + functions хамт
# эсвэл зөвхөн functions:
firebase deploy --only functions
```

Deploy хийсний дараа functions URL-ууд:

- Callable: `createBonumInvoice`
- Webhook: `https://us-central1-ger-fx.cloudfunctions.net/bonumWebhook`

**Bonum-ийн merchant порталаас** webhook (server-to-server) callback хаягийг дээрх URL болгож тохируулна.

---

## 6. Тестлэх

1. Сайт дээр бараа сагсалж, захиалга өгнө — Bonum төлбөрийн цонх нээгдэх ёстой.
2. Тест орчинд Bonum-ийн тест карт/QR ашиглана.
3. Төлбөр амжилттай бол захиалгын төлөв удирдлагын самбарт «Төлсөн» болж, нөөц хасагдана.
4. Webhook логийг шалгах: `firebase functions:log`.

---

## 7. Асуудал гарвал

- **«Төлбөрийн систем хараахан холбогдоогүй»** — secrets оруулаагүй (3-р хэсэг).
- **Төлбөрийн цонх нээгдэхгүй** — functions deploy хийгдсэн үү, Blaze идэвхжсэн үү шалгана.
- **Төлбөр төлөгдсөн боловч захиалга «Хүлээгдэж буй» хэвээр** — webhook хаяг буруу эсвэл
  checksum key тохирохгүй; `firebase functions:log` дээр алдаа гарсан эсэхийг харна.

---

## Юу өөрчлөгдсөн бэ (код)

- `src/pages/CheckoutPage/` — захиалга өгсний дараа шууд Bonum төлбөрийн цонх руу шилжинэ.
- `src/pages/OrderSuccessPage/` — төлбөрийн төлөвийг бодит цагт харуулна; «Төлбөр төлөх» товчоор дахин нээх боломжтой.
- `functions/src/index.ts` — `createBonumInvoice` (callable) ба `bonumWebhook` (HTTP) функцууд.
- `src/models/order.ts` — төлбөрийн төрөл зөвхөн `bonum` болсон (qpay/socialpay/bank устсан).
- Тохиргоо хуудаснаас «Дансны мэдээлэл» хэсэг, UID хуулах товчийг устгав.
- `/admin/products/new` хуудас ажиллах болсон (өмнө нь placeholder байсан).
