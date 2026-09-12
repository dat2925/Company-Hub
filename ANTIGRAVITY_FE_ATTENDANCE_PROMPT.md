# Prompt cho Antigravity: xây FE Chấm công & Bảng lương

Hãy triển khai **chỉ phần frontend** cho tính năng Chấm công và Bảng lương trong dự án Next.js hiện tại ở thư mục `web`. Không sửa backend, Prisma hay migration. Hãy đọc và tái sử dụng kiến trúc, component, style, auth context, `next-intl`, TanStack Query, React Hook Form/Zod và API client hiện có; giao diện phải đồng nhất với AppShell hiện tại, responsive tốt trên mobile/tablet/desktop, có loading/empty/error/toast/confirmation rõ ràng.

## Phân quyền và điều hướng

- Thêm menu `attendance` (icon Clock/CalendarCheck) cho cả `ADMIN` và `EMPLOYEE`.
- Thêm menu `payrolls` (icon Wallet/Banknote) cho cả `ADMIN` và `EMPLOYEE`.
- `SUPER_ADMIN` không thấy hai menu này.
- `EMPLOYEE`: tự check-in/check-out, xem lịch sử/tổng hợp chấm công và phiếu lương của chính mình; không thấy nút tạo/sửa/xóa thủ công, cấu hình lương, tính lương hay chốt lương.
- `ADMIN`: xem và lọc toàn công ty; CRUD chấm công thủ công; cấu hình lương; tính/chốt bảng lương.
- Bổ sung đầy đủ bản dịch VI/EN, không hard-code text hiển thị.

## Quy ước API có sẵn

- Base URL và Bearer token đã được xử lý bởi `src/lib/api/client.ts`.
- Response một bản ghi: `{ success: true, data: T }`.
- Response phân trang: `{ success: true, data: T[], meta: { page, pageSize, totalItems, totalPages } }`.
- Decimal của Prisma (`baseSalary`, `allowance`, các số tiền...) có thể được JSON trả về dạng string: type FE nên dùng `string | number`, chuyển sang number chỉ khi format/tính hiển thị.
- Thêm method `put` vào API client tương tự `post`/`patch` vì API cấu hình lương dùng PUT.
- Khi gặp 400/403/404/409, hiển thị message do API trả về; 409 check-in/check-out hoặc bảng lương đã chốt không được giả lập là thành công.

## API chấm công

Enum `AttendanceStatus`: `PRESENT | LATE | HALF_DAY | ABSENT | PAID_LEAVE | UNPAID_LEAVE`.

Attendance shape:
`{ id, companyId, employeeId, workDate, checkIn, checkOut, status, workedMinutes, overtimeMinutes, note, createdAt, updatedAt, employee: { id, employeeCode, fullName } }`.

- `POST /attendance/check-in`, body `{ note?: string }` — tự chấm vào cho nhân viên đang đăng nhập.
- `POST /attendance/check-out`, body `{ note?: string }` — tự chấm ra; BE tự tính `workedMinutes` và `overtimeMinutes`.
- `GET /attendance?page=1&pageSize=10&month=YYYY-MM&employeeId=UUID` — EMPLOYEE luôn chỉ nhận dữ liệu của mình dù có truyền employeeId.
- `GET /attendance/summary?month=YYYY-MM&employeeId=UUID` — trả `{ records, workedMinutes, overtimeMinutes, byStatus: Record<AttendanceStatus, number> }`; key không có dữ liệu có thể vắng mặt.
- `GET /attendance/:id`.
- ADMIN only: `POST /attendance` body `{ employeeId, workDate: 'YYYY-MM-DD', checkIn?: ISO datetime, checkOut?: ISO datetime, status?, workedMinutes?, overtimeMinutes?, note? }`.
- ADMIN only: `PATCH /attendance/:id` với body partial như trên.
- ADMIN only: `DELETE /attendance/:id`.

Tạo trang `/attendance`:

- Phần đầu là bộ chọn tháng; ADMIN có thêm combobox nhân viên dùng `GET /employees/options/list`.
- EMPLOYEE có card trạng thái hôm nay và nút Check-in/Check-out. Suy ra trạng thái nút từ bản ghi ngày hiện tại: chưa có record → Check-in; có checkIn nhưng chưa checkOut → Check-out; đã đủ → disable và hiển thị giờ vào/ra. Sau mutation invalidate cả list và summary.
- Card tổng hợp: số bản ghi, tổng giờ làm, giờ tăng ca, số ngày hiện diện/đi muộn/nửa ngày/nghỉ. Chuyển phút thành `xh ym`.
- Bảng lịch sử: ngày, nhân viên (ADMIN), giờ vào, giờ ra, trạng thái dạng badge, giờ làm, tăng ca, ghi chú, thao tác (ADMIN).
- ADMIN có modal tạo/sửa bản ghi với validation hợp lệ; checkOut phải sau checkIn. Có confirm khi xóa.
- Dùng timezone local để hiển thị datetime, nhưng gửi datetime ISO cho API; `workDate` gửi đúng `YYYY-MM-DD`, tránh lệch ngày do `toISOString()`.

## API cấu hình lương và bảng lương

SalaryProfile shape:
`{ id, companyId, employeeId, baseSalary, allowance, overtimeHourlyRate, standardWorkingDays, standardMinutesPerDay, currency, employee: { id, employeeCode, fullName } }`.

Payroll shape:
`{ id, companyId, employeeId, year, month, baseSalary, allowance, overtimeHourlyRate, standardWorkingDays, standardMinutesPerDay, regularMinutes, paidLeaveMinutes, overtimeMinutes, attendancePay, overtimePay, deductions, netSalary, currency, status: 'DRAFT' | 'FINALIZED', calculatedAt, finalizedAt, employee: { id, employeeCode, fullName } }`.

- EMPLOYEE: `GET /salary-profiles/me`.
- ADMIN: `GET /salary-profiles?page&pageSize&search`.
- ADMIN: `GET /salary-profiles/:employeeId`.
- ADMIN: `PUT /salary-profiles/:employeeId`, body `{ baseSalary, allowance?, overtimeHourlyRate?, standardWorkingDays?, standardMinutesPerDay?, currency? }`.
- `GET /payrolls?page=1&pageSize=10&month=YYYY-MM&employeeId=UUID&search=...` — EMPLOYEE luôn chỉ nhận phiếu của mình.
- `GET /payrolls/:id` — EMPLOYEE chỉ được xem phiếu của mình.
- ADMIN: `POST /payrolls/calculate`, body `{ month: 'YYYY-MM', employeeId?: UUID, deductions?: number }`. Có employeeId thì response data là một Payroll; bỏ employeeId thì response data là Payroll[]. `deductions` chỉ được gửi khi có employeeId.
- ADMIN: `PATCH /payrolls/:id/finalize`, body `{}`. Bảng lương FINALIZED không thể tính lại.

Tạo trang `/payrolls`:

- Tab/section “Bảng lương”: bộ chọn tháng, tìm kiếm, lọc nhân viên cho ADMIN, bảng gồm nhân viên, lương cơ bản, công hưởng lương, tiền công theo chấm công, tăng ca, phụ cấp, khấu trừ, thực lĩnh, trạng thái. Click row mở drawer/modal chi tiết có breakdown công thức.
- ADMIN có nút “Tính lương toàn công ty”, và action từng nhân viên “Tính lại”/“Chốt lương”. Trước thao tác hàng loạt hoặc chốt phải confirm. Disable tính lại khi FINALIZED.
- Tab/section “Cấu hình lương” chỉ dành cho ADMIN: danh sách profile, search, tạo/cập nhật bằng cách chọn nhân viên và nhập lương cơ bản, phụ cấp, đơn giá tăng ca/giờ, ngày công chuẩn (mặc định 26), phút/ngày (mặc định 480), tiền tệ (mặc định VND). Format VND bằng `Intl.NumberFormat`.
- EMPLOYEE chỉ có danh sách phiếu của mình và chi tiết; nếu chưa có profile/payroll thì empty state thân thiện, không làm vỡ trang khi `/salary-profiles/me` trả 404.

## Công thức cần giải thích đúng trên UI

- `standardMonthMinutes = standardWorkingDays × standardMinutesPerDay`.
- Công thường = tổng phút của `PRESENT`, `LATE`, `HALF_DAY`, mỗi ngày tối đa `standardMinutesPerDay`.
- Nghỉ có lương (`PAID_LEAVE`) được cộng `standardMinutesPerDay`; `ABSENT` và `UNPAID_LEAVE` không hưởng lương.
- `attendancePay = baseSalary × min((regularMinutes + paidLeaveMinutes) / standardMonthMinutes, 1)`.
- `overtimePay = overtimeHourlyRate × overtimeMinutes / 60`.
- `netSalary = max(0, attendancePay + allowance + overtimePay - deductions)`.
- BE là nguồn dữ liệu chuẩn: FE chỉ hiển thị breakdown, không tự tạo kết quả payroll thay BE.

## Yêu cầu chất lượng

- Tạo type riêng rõ ràng, query keys ổn định, invalidate đúng sau mutation.
- Không dùng `any`, không duplicate fetch logic, không phá các màn hình cũ.
- Dùng semantic button/label, keyboard focus, aria-label cho icon button, contrast dễ đọc.
- Chạy `npm run lint` và `npm run build` trong thư mục `web`, sửa hết lỗi phát sinh trước khi bàn giao.
- Cuối cùng liệt kê file đã thay đổi và tóm tắt luồng ADMIN/EMPLOYEE đã hoàn thành.
