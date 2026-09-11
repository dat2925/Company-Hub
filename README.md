# Company Management

Hệ thống quản lý nhiều công ty theo kiến trúc đơn giản:

```text
Next.js web (3001) -> NestJS REST API (3000) -> Prisma -> PostgreSQL (5432)
```

Backend áp dụng tenant isolation ở từng truy vấn bằng `currentUser.companyId`; `companyId` từ request body không được chấp nhận. Ba role duy nhất là `SUPER_ADMIN`, `ADMIN`, `EMPLOYEE`.

## Chạy bằng Docker

```bash
docker compose up --build
```

- Web: http://localhost:3011
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs
- PostgreSQL: localhost:5432

Container backend tự chạy migration và seed trước khi khởi động.

## Chạy local

Yêu cầu Node.js 22+, npm, PostgreSQL 16+.

```bash
npm run install:all
cd backend
cp .env.example .env
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

Mở terminal khác:

```bash
cd web
cp .env.example .env.local
npm run dev
```

## Tài khoản demo

Mật khẩu chung: `Demo@123`

| Role | Email |
|---|---|
| SUPER_ADMIN | superadmin@system.com |
| ADMIN công ty 1 | admin@company1.com |
| EMPLOYEE công ty 1 | employee@company1.com |
| ADMIN công ty 2 | admin@company2.com |
| EMPLOYEE công ty 2 | employee@company2.com |

Seed tạo 3 công ty. Mỗi công ty có ADMIN, EMPLOYEE, phòng ban, dự án, cuộc họp, bảng tin và thông báo.

## Kiểm tra

```bash
npm run build
npm test
cd backend
npx prisma validate
```

Sau khi PostgreSQL, migration, seed và backend đang chạy, có thể chạy test HTTP tích hợp:

```powershell
./test/integration.ps1
```

Script kiểm tra login cho ba role, role guard, Company CRUD, CRUD tất cả module nghiệp vụ và hai trường hợp truy cập chéo tenant.

## Cấu trúc

```text
company-management/
  backend/  # NestJS, Prisma, JWT, Swagger, test
  web/      # Next.js App Router, Tailwind, TanStack Query, RHF/Zod, next-intl
```

Frontend dùng một API client tập trung tại `web/src/lib/api/client.ts`, tự gắn access token, refresh token khi gặp 401 và chuẩn hóa lỗi. Dữ liệu server được quản lý bằng TanStack Query. Giao diện có VI/EN, sidebar theo role, list/search/pagination, form create/edit, detail, confirmation dialog, toast và layout mobile/tablet/desktop.
