# Evaan Earth — MERN commerce platform

A modular, single-seller e-commerce starter for **Evaan Earth**. The storefront uses the supplied handmade-product imagery and the sage / olive / warm-stone colour palette. The seller can add and manage products from the dashboard; customers can browse, search, review, wishlist, manage addresses, reserve stock, and check out through Razorpay.

> This is a runnable application foundation, not a substitute for a production security review. Razorpay, SMTP, Cloudinary and Redis integrations need your own credentials. Never deploy with development secrets or expose seller seed credentials.

**Deployment:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for the Vercel frontend + Render API setup. The root `render.yaml` configures the backend service, and `frontend/vercel.json` configures Vite SPA routing.

## 1. Requirements

- Node.js 20 LTS or newer and npm 10+
- MongoDB 7+ configured as a **replica set** (transactions are required)
- Optional: Redis 7+, Cloudinary account, SMTP provider, Razorpay account

## 2. Install

```bash
# From the project root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install
```

Set `MONGODB_URI` and both JWT secrets in `backend/.env`. For local MongoDB with transactions, start it as a single-node replica set:

```bash
mongod --replSet rs0 --bind_ip localhost
# In another terminal, run once:
mongosh --eval "rs.initiate()"
```

Use this URI in `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/evaan_earth?replicaSet=rs0
```

## 3. Create the single seller and sample catalogue

Set `SEED_SELLER_EMAIL` and `SEED_SELLER_PASSWORD` in `backend/.env`, then run:

```bash
npm run seed
```

The seed command creates the one seller account, starter categories and sample products based on the supplied images. Registration through the public site can only create customer accounts. The seeded seller can add/edit/archive products and reply to reviews.

## 3.1 Seller login (one seller only)

You do **not** register a separate seller account from the website. In `backend/.env`, set the credentials you want to use for the store owner:

```env
SEED_SELLER_EMAIL=you@example.com
SEED_SELLER_PASSWORD=use-a-long-unique-password
```

From the project root, run `npm run seed` once. Then open the normal **Sign in** page and use those credentials. Public registration creates customer accounts only. The seed script does not overwrite an existing seller; if it prints `Seller already exists: ...`, sign in with that existing email and its original password (or use Forgot password if email/OTP reset is configured).

## 4. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/v1
- API health: http://localhost:5000/health
- Prometheus metrics: http://localhost:5000/metrics

## 5. Environment configuration

### Backend (`backend/.env`)

| Variable | Required | Purpose |
|---|---:|---|
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | API port, default `5000` |
| `CLIENT_URL` | Yes | Frontend origin for CORS |
| `MONGODB_URI` | Yes | Replica-set MongoDB URI |
| `JWT_ACCESS_SECRET` | Yes | Access-token signing secret (32+ random chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh-token signing secret (32+ random chars) |
| `ACCESS_TOKEN_TTL` | No | Default `15m` |
| `REFRESH_TOKEN_DAYS` | No | Default `30` |
| `SEED_SELLER_EMAIL` / `SEED_SELLER_PASSWORD` | For seed | Initial seller account |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For live payment | Razorpay Checkout and server API |
| `RAZORPAY_WEBHOOK_SECRET` | For webhooks | Set the same secret in Razorpay webhook settings |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | For email | OTP and order email delivery |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional | Product image uploads |
| `REDIS_URL` | Optional | Product-list cache |
| `TRUST_PROXY` | No | Set `true` behind a trusted reverse proxy |

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

The backend returns a development-only `devOtp` field for password-reset testing if SMTP is not configured. This field is never returned in production. For real email delivery configure SMTP and remove the development mode.

## 6. Main customer journey

1. Register or sign in as a customer.
2. Browse `/shop`, search by name/tag, or filter by category. Product detail pages display images, live stock, ratings and reviews.
3. Add items to cart or wishlist. Add delivery addresses under **Account** and choose one as primary.
4. At checkout, choose an address and confirm the order preview. The API reserves stock for five minutes using an atomic conditional decrement inside a MongoDB transaction.
5. Razorpay Checkout opens. A captured payment is verified by the checkout HMAC and also accepted through the signed webhook. A successful payment shows the full-screen confirmation tick.
6. If a payment attempt fails, retry the same order while its five-minute reservation is still active. When the reservation expires unpaid, a scheduled job releases the inventory. The customer can then create a new order.

## 7. Inventory and concurrency notes

- Product `stock` means currently available stock. Reserving an order decrements it immediately, so concurrent buyers cannot reserve the same units.
- Reservation and order creation are in one MongoDB transaction. Each product update includes `stock: { $gte: quantity }` to guard against overselling.
- A reservation is released exactly once by an order-state compare-and-set (`reservationState: active` → `released`) inside a transaction. The inventory increment is part of that same transaction.
- Successful payment changes the reservation state to `consumed`; no second inventory decrement occurs.
- A payment received after its reservation was released is marked `refund_required` rather than fulfilled against potentially sold inventory. Review and refund that edge case in the Razorpay dashboard.
- The scheduler runs every minute. The five-minute deadline is checked by the API as well, so a delayed scheduler cannot extend the checkout window.
- Test transactions using a replica set, not a standalone MongoDB server.

## 8. Backend architecture

`backend/src` is divided into `config`, `constants`, `controllers`, `docs`, `jobs`, `middlewares`, `models`, `routes`, `services`, `utils` and `validations`. It includes:

- Access JWT + rotating refresh token (httpOnly cookie), role middleware, password hashing and email OTP reset
- Product search with offset and cursor pagination, category filters and a Redis cache-aside layer when Redis is configured
- Cloudinary upload pipeline with Multer memory storage, Sharp normalization and file-signature validation
- Per-route rate limits, structured HTTP logging, Prometheus metrics and centralized errors
- MongoDB transaction-based reservation and payment-state transitions, signed Razorpay webhook and scheduled expiry release
- Customer order/address/cart/wishlist/review APIs; seller analytics and review replies

The referenced `backend-101` repository is a concept guide. This project implements the applicable ideas in the commerce domain; it does not import or vendor that repository or the Zaptro repository.

## 9. Useful API routes

All routes are prefixed with `/api/v1`.

| Area | Routes |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `GET /auth/me` |
| Products | `GET /products`, `GET /products/:slug`, seller `POST/PATCH/DELETE /products` |
| Categories | `GET /categories`, seller `POST /categories` |
| Cart / wishlist | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`, `GET /wishlist`, `POST /wishlist/:productId` |
| Addresses | `GET/POST /addresses`, `PATCH/DELETE /addresses/:id`, `PATCH /addresses/:id/primary` |
| Orders | `POST /orders/reserve`, `GET /orders/my`, `GET /orders/:id` |
| Payments | `POST /payments/:orderId/attempt`, `POST /payments/verify`, `POST /payments/webhook` |
| Reviews | `GET /reviews/product/:productId`, `POST /reviews`, seller `POST /reviews/:id/reply` |
| Seller | `GET /seller/analytics`, `GET /seller/orders`, `PATCH /seller/orders/:id/status`, `GET /reviews/seller` |
| Upload | seller `POST /uploads/product-image` and `POST /uploads/product-images` |

## 10. Before production

Configure HTTPS, real SMTP, Razorpay keys and webhooks, Cloudinary, Redis and production MongoDB replica set. Add payment reconciliation/refund automation, tax/shipping rules, privacy/terms pages, backups, monitoring, automated tests and a security review. Restrict the seeded seller credentials, enable MFA for the seller, rotate secrets, and set `NODE_ENV=production`. The included local setup uses development-only conveniences and sample products.

## 11. Responsive layout

The storefront uses fluid container widths and desktop-specific scaling for wide screens, including 16:10 displays. At widths of 2560px and above, the content width expands while keeping balanced side margins; the shop grid can show five products per row. Tablet and mobile layouts retain their smaller breakpoints.
