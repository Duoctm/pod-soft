[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnguyentrungtin1709%2Fsaleor-storefront&env=NEXT_PUBLIC_SALEOR_API_URL&envDescription=Full%20Saleor%20GraphQL%20endpoint%20URL%2C%20eg%3A%20https%3A%2F%2Fstorefront1.saleor.cloud%2Fgraphql%2F&project-name=my-saleor-storefront&repository-name=my-saleor-storefront&demo-title=Saleor%20Next.js%20Storefront&demo-description=Starter%20pack%20for%20building%20performant%20e-commerce%20experiences%20with%20Saleor.&demo-url=https%3A%2F%2Fstorefront.saleor.io%2F&demo-image=https%3A%2F%2Fstorefront-d5h86wzey-saleorcommerce.vercel.app%2Fopengraph-image.png%3F4db0ee8cf66e90af)
[![Xem Demo](https://img.shields.io/badge/XEM%20DEMO-DFDFDF?style=for-the-badge)](https://storefront.saleor.io)

![Saleor Storefront](./public/screenshot.png)

<div align="center">
  <h1>Saleor Next.js Storefront</h1>
  Nền tảng khởi đầu để xây dựng trải nghiệm thương mại điện tử hiệu năng cao với <a href="https://github.com/saleor/saleor">Saleor</a>.
</div>

<div align="center">
  <a href="https://saleor.io/">Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x">Tài liệu</a>
  <span> • </span>
  <a href="https://saleor.io/roadmap">Lộ trình</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">Twitter</a>
  <span> • </span>
  <a href="https://saleor.io/discord">Discord</a>
</div>

<br/>

<div align="center">

[![Lộ trình Storefront](https://img.shields.io/badge/ROADMAP-EFEFEF?style=for-the-badge)](https://saleor.io/roadmap)
[![Discord Badge](https://dcbadge.vercel.app/api/server/unUfh24R6d)](https://discord.gg/unUfh24R6d)

</div>

> [!MẸO]
> Có câu hỏi hoặc vấn đề? Kiểm tra kênh [Discord](https://saleor.io/discord) của chúng tôi để được hỗ trợ.

## Tổng quan về dự án

Saleor Storefront là một giải pháp giao diện người dùng (frontend) hiện đại cho thương mại điện tử được xây dựng dựa trên nền tảng Saleor - một hệ thống thương mại điện tử mã nguồn mở, hiệu suất cao. Dự án này cung cấp một điểm khởi đầu hoàn chỉnh để xây dựng cửa hàng trực tuyến với các tính năng mạnh mẽ và khả năng tùy biến cao.

### Công nghệ chính

- **Next.js 14**: Framework React hiện đại với định tuyến dựa trên tệp, React 18, Fast Refresh và tối ưu hóa hình ảnh
- **App Router**: Sử dụng React Server Components, Data Cache và các thành phần bất đồng bộ
- **TypeScript**: Hệ thống định kiểu mạnh mẽ cho mã nguồn và các payload GraphQL
- **GraphQL**: Sử dụng GraphQL Codegen và TypedDocumentString để giảm boilerplate và kích thước bundle
- **TailwindCSS**: Framework CSS có thể tùy chỉnh và mở rộng

## Tính năng

**Tính năng chung:**
- Menu động
- Menu hamburger
- Tối ưu hóa SEO

**Thanh toán:**
- Thanh toán trên một trang (bao gồm đăng nhập)
- Có thể chuyển sang các framework khác (không sử dụng thành phần Next.js)
- Tích hợp Adyen
- Tích hợp Stripe
- Sổ địa chỉ khách hàng
- Phiếu giảm giá và thẻ quà tặng

**Danh mục sản phẩm:**
- Quản lý danh mục
- Lựa chọn biến thể sản phẩm
- Thuộc tính sản phẩm
- Tối ưu hóa hình ảnh

**Tài khoản của người dùng:**
- Hoàn tất đơn hàng
- Xem chi tiết đơn hàng

## Hướng dẫn cài đặt với Docker

Cách đơn giản nhất để chạy Saleor Storefront là sử dụng Docker và Docker Compose.

### Yêu cầu

- Docker và Docker Compose đã được cài đặt
- Git

### Bước 1: Clone repository

```bash
git clone https://github.com/nguyentrungtin1709/saleor-storefront.git
cd saleor-storefront
```

### Bước 2: Khởi động ứng dụng với Docker Compose

#### Môi trường production

```bash
docker-compose up -d --build
```

Sau khi hoàn tất, ứng dụng Storefront sẽ chạy tại địa chỉ [http://localhost:3000](http://localhost:3000).

#### Môi trường phát triển (development)

Để phát triển nhanh hơn với hot-reload, không cần build lại toàn bộ ứng dụng mỗi khi có thay đổi:

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

Ứng dụng sẽ chạy ở chế độ development tại [http://localhost:3000](http://localhost:3000) và tự động cập nhật khi bạn thay đổi code.

