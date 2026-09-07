# Portfolio — Tran Thi Thuy Vy

## Mục lục

1. [Các trang](#các-trang)
2. [Chạy thử trên máy](#1-chạy-thử-trên-máy)
3. [Deploy lên Vercel](#2-deploy-lên-vercel)
4. [Bật trang quản trị (Supabase)](#3-bật-trang-quản-trị-supabase)
5. [Trang quản trị](#4-trang-quản-trị--admin)
6. [Thay ảnh](#5-thay-ảnh)
7. [Sửa chữ](#6-sửa-chữ)
8. [Đổi màu, font, hiệu ứng](#7-đổi-màu-font-hiệu-ứng)
9. [Sổ lưu bút (đang ẩn)](#8-sổ-lưu-bút-đang-ẩn)
10. [Cấu trúc thư mục](#cấu-trúc-thư-mục)

---

## Các trang

| Đường dẫn | Là gì |
|---|---|
| `/` | **Home** — tên bạn viết tay hiện dần, câu hook, đoạn giới thiệu, ba từ khoá (bấm được), số liệu, nút sang Portfolio |
| `/portfolio` | **Portfolio** — trang tổng hợp: 3 thẻ từ khoá + thanh lọc 5 chuyên mục; tab *Everything* nhóm theo chuyên mục |
| `/portfolio/excellence`<br>`/portfolio/leadership`<br>`/portfolio/entrepreneurship` | **Trang riêng của mỗi từ khoá** — chỉ hiện những chuyên mục bạn gán cho từ khoá đó |
| `/archive` | **Archive** — công khai, liệt kê *mọi* hoạt động theo năm, kể cả mục không đưa lên Portfolio |
| `/contact` | **Contact** — email, điện thoại, LinkedIn, Facebook, tình trạng hiện tại |
| `/admin` | **Kho riêng của bạn** (có mật khẩu) — 5 khu: Activities · Sections & keywords · Numbers · Images · Text |
| `/guestbook` | Sổ lưu bút — đã dựng xong nhưng **đang ẩn khỏi menu** cho tới gần ngày tốt nghiệp |

### Năm chuyên mục

`Academic` · `Leadership` · `Extracurricular` · `Work Experience` · `Competitions & Awards`

Mỗi chuyên mục được **gán vào một từ khoá** (sửa trong `/admin` → *Sections & keywords*).
Mặc định: Excellence ← Academic · Leadership ← Leadership + Extracurricular ·
Entrepreneurship ← Work Experience + Competitions & Awards.
Chuyên mục nào để trống từ khoá thì vẫn hiện trên Portfolio, chỉ là nằm phía dưới.

### Portfolio và Archive khác nhau chỗ nào

- **Archive** = tất cả hoạt động đã công khai.
- **Portfolio** = những mục bạn bật *Show on portfolio*.
Trong `/admin` → *Activities*, mỗi mục có hai công tắc: **Visible** (công khai hay không) và
**On portfolio / Archive only** (có lên trang Portfolio hay chỉ nằm ở Archive).

---

## Thiết kế

Bảng màu **trắng · xanh dịu · navy**:

| Token | Hex | Dùng ở đâu |
|---|---|---|
| `paper` | `#FCFDFF` | nền chính |
| `paper-100` | `#F7FAFE` | panel sáng nhất |
| `paper-200` | `#F0F6FD` | nền phụ, phân tách section |
| `paper-300` | `#E4EFFB` | thẻ, chip |
| `paper-400` | `#D6E6F7` | đường kẻ, viền |
| `navy` | `#16365F` | chữ chính |
| `navy-soft` | `#5B7896` | chữ phụ |
| `navy-deep` | `#0F2947` | các khối đảo màu |
| `azure` | `#1D63D2` | link, số liệu (đủ tương phản trên nền trắng) |
| `azure-bright` | `#3B82F6` | vệt sáng trang trí |
| `azure-light` | `#8FBBF9` | màu nhấn trên nền navy |

Font:

- **Ephesis** — chữ ký viết tay, dùng cho tên bạn (dự phòng: Great Vibes)
- **Instrument Serif** *nghiêng* — ba từ khoá và các tiêu đề lớn, nét cong mềm
- **Inter** — thân bài, nhãn, nút

### Chuyển động

| Hiệu ứng | Ở đâu |
|---|---|
| Tên viết dần ra như đang ký | Home |
| Cuộn có quán tính (Lenis) | toàn trang |
| Con trỏ tuỳ biến — chấm + vòng bám theo, đổi thành huy hiệu trên ảnh | máy tính có chuột |
| Chữ trồi lên từng từ qua khung che | mọi tiêu đề lớn |
| Ảnh lộ dần từ dưới lên | ảnh bìa các trang |
| Parallax | ảnh nền Home, chân dung, ảnh bìa Portfolio |
| Dải số liệu chạy ngang, tăng tốc theo tốc độ cuộn | dưới ảnh bìa Home |
| Số đếm từ 0 lên | Home và mỗi chuyên mục Portfolio |
| Ảnh bay ra bám con trỏ khi rê vào một mục | Portfolio |
| Cửa sổ nổi trượt lên khi bấm vào một mục | Portfolio · Archive · trang từ khoá |
| Bấm từ khoá ở Home → mở trang riêng của từ khoá đó | Home |
| Nút hút nhẹ về phía con trỏ | các nút chính |
| Vệt sáng xanh trôi chậm ở nền | Home, Portfolio, Contact |

Tất cả tự tắt khi người xem bật **"giảm chuyển động"** trong hệ điều hành.

---

## 1. Chạy thử trên máy

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## 2. Deploy lên Vercel

**Nhanh nhất (không cần Git):**

```bash
npm i -g vercel
vercel        # bản preview
vercel --prod # bản chính thức
```

**Chuẩn hơn (khuyến nghị — sau này chỉ cần `git push`):**

1. Đẩy thư mục này lên một repo GitHub.
2. Vào vercel.com → **Add New → Project** → chọn repo → **Deploy**.

> Website chạy bình thường ngay cả khi chưa có Supabase: 13 hoạt động lấy từ CV và toàn bộ chữ
> mặc định nằm sẵn trong code. Supabase cần cho `/admin` — thêm hoạt động, sửa số liệu, sửa chữ,
> upload ảnh.

---

## 3. Bật trang quản trị (Supabase)

Làm một lần, khoảng 10 phút.

### Bước 1 — Tạo project

1. Vào [supabase.com](https://supabase.com) → **Start your project** → đăng nhập bằng GitHub.
2. **New project**, chọn region Singapore, đặt mật khẩu database rồi lưu lại.
3. Đợi ~2 phút.

### Bước 2 — Tạo bảng và kho ảnh

1. Mở **SQL Editor** → **New query**.
2. Copy toàn bộ file `supabase/schema.sql` trong thư mục này, dán vào, bấm **Run**.
3. Vào **Table Editor** thấy `portfolio_entries`, `site_settings` và `guestbook_entries`;
   vào **Storage** thấy bucket `portfolio-images` là xong.
   (Chạy lại file này lần nữa cũng an toàn — nó chỉ thêm những gì còn thiếu.)

### Bước 3 — Lấy khoá

**Project Settings → API** (hoặc **Data API**), lấy:

- **Project URL** → `SUPABASE_URL`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ `service_role` là khoá toàn quyền. Nó chỉ được dùng ở phía máy chủ (đúng như code trong
> `lib/supabase.js`) và **không bao giờ** đặt vào biến có tiền tố `NEXT_PUBLIC_`.

### Bước 4 — Khai báo biến môi trường

**Trên máy:** copy `.env.example` thành `.env.local` rồi điền:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_PASSWORD=mat-khau-ban-tu-dat
```

**Trên Vercel:** project → **Settings → Environment Variables** → thêm đúng ba biến trên
(tick cả Production, Preview, Development) → **Redeploy**.

---

## 4. Trang quản trị — `/admin`

Vào `tenmien.com/admin`, nhập `ADMIN_PASSWORD`. Có năm khu:

### Activities — kho hoạt động của bạn

Thêm, sửa, ẩn, xoá từng hoạt động.

| Ô | Ý nghĩa |
|---|---|
| **Title** | Tên tổ chức hoặc chương trình — chữ lớn nhất trên thẻ |
| **Section** | Chọn 1 trong 5 chuyên mục |
| **Role / subtitle** | Vai trò của bạn, hiện bằng chữ nghiêng |
| **Period** | Thời gian dạng chữ, ví dụ `Dec 2024 – Dec 2025` |
| **Start date** | Chỉ dùng để sắp xếp — mới nhất lên trước |
| **Summary** | Một hai dòng hiện trên thẻ |
| **Story** | Đoạn dài hiện trong cửa sổ nổi |
| **Highlights** | Mỗi dòng là một gạch đầu dòng |
| **Photographs** | Upload nhiều ảnh — chính là ảnh bay ra khi rê chuột và ảnh trong cửa sổ nổi |
| **Links** | Nhãn + đường dẫn |
| **Published** | Bỏ tick để giấu hẳn khỏi web |
| **Show on portfolio** | Bỏ tick thì mục chỉ nằm ở Archive |

> **Lần đầu vào, hãy bấm "Import CV activities".** 13 hoạt động lấy từ CV đang nằm trong code
> (`lib/seed-entries.js`) nên hiện được ngay cả khi chưa có database — nhưng không sửa được ở đây.
> Bấm nút đó một lần là chúng được chép vào database và từ đó bạn sửa thoải mái.

### Sections & keywords

Đổi tên và mô tả 5 chuyên mục, sửa ba từ khoá (chữ, câu một dòng, đoạn dẫn ở trang riêng),
và **gán chuyên mục vào từ khoá** — hoặc để trống nếu chưa muốn gán.

### Numbers

Sửa 4 con số ở Home và 4 con số của mỗi chuyên mục. Viết đúng như muốn hiện: `2,000+`,
`3.69/4.0`, `100%` đều chạy được — hiệu ứng đếm tự nhận ra phần số.

### Images

Upload và căn khung cho mọi ô ảnh: nền Home, chân dung, bìa Portfolio, nền Contact, và
20 ô ảnh của các hoạt động gốc. Ảnh lưu trên Supabase Storage, hiện với tất cả mọi người,
không cần deploy lại.

### Text

Câu hook, đoạn giới thiệu, dải số liệu chạy ngang, chữ trang Contact, và toàn bộ thông tin
liên hệ kể cả link LinkedIn / Facebook.

> Mọi thay đổi ở bốn khu sau đều bấm **Save changes** ở cuối trang mới có hiệu lực.
> Nếu database trống hoặc chưa cấu hình, web tự dùng giá trị mặc định trong `lib/content.js`.

## 5. Thay ảnh

Hai loại ảnh:

- **Ảnh bố cục** — nền Home, chân dung, ảnh bìa Portfolio, nền Contact.
- **Ảnh của từng mục** — bay ra bám con trỏ khi rê vào, và lấp đầy thư viện trong cửa sổ nổi.
  Mục thêm qua `/admin` dùng ảnh bạn upload; 13 mục gốc dùng các ô ảnh khai báo trong `lib/images.js`.

### Cách 1 — Chỉnh ngay trên web

1. Bấm **`Ctrl + E`** (Mac: **`⌘ + E`**), hoặc thêm `?edit` vào cuối đường dẫn.
2. Chọn ô ảnh trong bảng bên phải (đã chia sẵn theo nhóm), hoặc bấm thẳng vào ảnh trên trang.
3. **Choose an image** → **kéo trực tiếp trên ảnh** để dời khung nhìn, hoặc dùng ba thanh trượt.
4. `Esc` để đóng.

> Ảnh ở bước này chỉ lưu trong trình duyệt của bạn.

### Cách 2 — Chốt bản chính thức

Trong bảng, phần *Make it permanent*:

1. **Download the photos** → tải về `hero.jpg`, `sihub-1.jpg`, …
2. **Download the config** → được `IMAGE_SLOTS.txt`.
3. Chép ảnh vào `public/images/`, dán config vào `lib/images.js`, `git push`.

### Gắn ảnh cho một mục gốc

Trong `lib/seed-entries.js`, mỗi mục có dòng `photos`:

```js
photos: ["sihub-1", "sihub-2"],
```

Tên phải khớp `key` khai báo trong `lib/images.js`. Muốn thêm ảnh thứ ba thì thêm một `key` mới ở
`lib/images.js` rồi bổ sung vào mảng. Tối đa 3 ảnh mỗi mục thì hiệu ứng còn đẹp.

---

## 6. Sửa chữ

Cách nhanh nhất là vào `/admin` → *Text*. Nếu muốn sửa trong code:

- **`lib/content.js`** → `defaultSettings`: thông tin cá nhân, trang Home, ba từ khoá,
  5 chuyên mục và số liệu, trang Contact. Đây là **giá trị mặc định** — những gì bạn lưu
  trong `/admin` sẽ đè lên chúng.
- **`lib/content.js`** → `ui`: các nhãn cố định không có trong form quản trị
  (chữ trên nút, tiêu đề mục, thông báo).
- **`lib/seed-entries.js`** — 13 hoạt động lấy từ CV (chỉ còn dùng cho tới khi bạn bấm
  *Import CV activities* trong `/admin`).

**Một chỗ nhớ sửa:** `metadataBase` trong `app/layout.js` — đổi thành tên miền thật khi đã có.

---

## 7. Đổi màu, font, hiệu ứng

- **Màu:** `tailwind.config.js` → `colors` (`paper`, `navy`, `azure`). Sửa hex là đổi tông cả web.
- **Font:** `app/layout.js` (thẻ `<link>` Google Fonts) và `app/globals.css`
  (`--font-sans`, `--font-display`, `--font-script`).
  Không thích chữ ký Ephesis thì đổi `--font-script` sang `Great Vibes`, `Parisienne`,
  `Sacramento` hoặc `Style Script` — nhớ sửa cả tên font trong link Google Fonts.
- **Chuyển động:** tất cả nằm trong `components/Motion.jsx`
  (`Reveal`, `Words`, `Signature`, `MaskImage`, `Parallax`, `CountUp`, `Magnetic`, `Orbs`).
  Muốn tắt một hiệu ứng ở đâu thì bỏ component bọc ở chỗ đó.
- **Tốc độ cuộn mượt:** `components/SmoothScroll.jsx` → `duration`.
- **Con trỏ:** `components/Cursor.jsx`. Thêm `data-cursor="VIEW"` vào phần tử nào thì con trỏ đổi
  thành huy hiệu có chữ đó.

---

## 8. Sổ lưu bút (đang ẩn)

Trang `/guestbook` và trang duyệt `/guestbook/admin` đã dựng xong và dùng chung database. Hiện nó
**không xuất hiện trong menu**. Gần ngày tốt nghiệp, mở `lib/content.js` và bỏ dấu chú thích ở dòng
này trong mảng `nav`:

```js
// { href: "/guestbook", label: "Guestbook" },
```

Mọi lời nhắn gửi lên đều ở trạng thái chờ duyệt; vào `/guestbook/admin` (cùng `ADMIN_PASSWORD`)
bấm cho hiện thì mới lên tường. Form có bẫy bot ẩn và giới hạn độ dài.

---

## Cấu trúc thư mục

```
app/
  layout.js                    khung chung: font, cuộn mượt, con trỏ, menu
  page.js                      Home
  portfolio/page.jsx           Portfolio
  portfolio/[keyword]/page.jsx trang riêng của mỗi từ khoá
  archive/page.jsx             Archive
  contact/page.jsx             Contact
  admin/page.jsx               kho riêng (có mật khẩu)
  guestbook/                   sổ lưu bút (đang ẩn) + trang duyệt
  api/entries/                 đọc / thêm / sửa / xoá hoạt động
  api/settings/                đọc / lưu cấu hình toàn site
  api/upload/                  upload ảnh lên Supabase Storage
  api/guestbook/               đọc / ghi / duyệt lời nhắn
components/
  HomeScreen · PortfolioScreen · KeywordScreen · ArchiveScreen · ContactScreen
  AdminScreen                  5 khu quản trị
  EntryList · EntryCard        danh sách hoạt động
  EntryModal                   cửa sổ nổi xem chi tiết
  HoverPhotos                  ảnh bay ra bám con trỏ
  Motion.jsx                   bộ hiệu ứng dùng chung
  Cursor · SmoothScroll · Marquee · Nav · Footer
  SiteProvider · EditableImage · EditPanel   chế độ chỉnh ảnh nhanh (Ctrl+E)
lib/
  content.js                   giá trị mặc định + nhãn cố định
  settings.js                  gộp cấu hình database lên mặc định
  data.js                      đọc dữ liệu phía máy chủ
  seed-entries.js              13 hoạt động lấy từ CV
  images.js                    khai báo các ô ảnh
  supabase.js                  kết nối database (chỉ chạy phía máy chủ)
supabase/schema.sql            SQL tạo bảng + bucket ảnh
public/images/                 file ảnh
```
