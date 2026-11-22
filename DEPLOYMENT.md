# Evaan Earth deployment: Vercel + Render

This repository is a monorepo. Deploy the **React/Vite frontend to Vercel** and the **Express/MongoDB API to Render**. Keep the code in one GitHub repository; configure a different Root Directory on each platform.

## 0. Before deploying

- Push this project to a GitHub repository. Do not commit `.env` files; `.gitignore` already excludes them.
- Create a MongoDB Atlas database using a replica-set-capable cluster (Atlas replica sets support the transactions used by checkout).
- Have a Razorpay account ready. Start with test keys; switch to live keys only after testing orders and webhooks.
- Use Node.js 20 or newer (the backend/frontend package metadata pins the supported major range).

### Push the project to GitHub

From the project root in PowerShell (create an empty GitHub repository first):

```powershell
git init
git add .
git commit -m "Prepare Evaan Earth for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository URL. Check `git status` and confirm no `.env` file is staged before pushing.

## 1. Deploy the backend to Render

The repository includes `render.yaml` as a Render Blueprint. It names the service `evaan-earth-api`, which gives the default origin `https://evaan-earth-api.onrender.com`. Keep this service name unless you also update the Vercel proxy destination. In Render:

1. Choose **New → Blueprint**, connect the GitHub repository and select the branch.
2. Render reads `render.yaml` and creates the `evaan-earth-api` Node web service. The blueprint sets:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`
3. When prompted for values marked `sync: false`, enter:
   - `CLIENT_URL`: use the Vercel production origin you plan to use, e.g. `https://evaan-earth.vercel.app` (no trailing slash). You can update it after Vercel creates the project URL. Multiple exact origins can be comma-separated.
   - `MONGODB_URI`: your MongoDB Atlas connection URI, e.g. `mongodb+srv://.../evaan_earth?retryWrites=true&w=majority`.
   - `SEED_SELLER_EMAIL` and `SEED_SELLER_PASSWORD`: the one seller account you will use to sign in.
4. The blueprint generates `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. Do not reuse development secrets.
5. Wait for the first deploy to become **Live**. Copy the service URL, e.g. `https://evaan-earth-api.onrender.com`.
6. Test `https://YOUR-RENDER-SERVICE.onrender.com/health`. It should return JSON with `success: true`.

Render supplies `PORT` automatically; do not hard-code it. The service is configured with `COOKIE_SECURE=true` and `TRUST_PROXY=true`. The browser sends API requests to the Vercel origin at `/api/v1`. Vercel proxies `/api/*` to the Render API, so refresh cookies remain first-party and use `SameSite=Lax`. The API also uses credentialed CORS for the exact origins in `CLIENT_URL`.

### Configure the remaining Render environment variables

In Render → your API service → **Environment**, add the ones you use, then save and redeploy:

| Key | Value |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay test key ID (`rzp_test_...`) initially |
| `RAZORPAY_KEY_SECRET` | Matching Razorpay test secret; keep private |
| `RAZORPAY_WEBHOOK_SECRET` | A strong webhook secret you choose and also enter in Razorpay |
| `SMTP_HOST` | Your SMTP provider host |
| `SMTP_PORT` | Usually `587` (provider-specific) |
| `SMTP_SECURE` | `false` for STARTTLS on 587; `true` if your provider requires implicit TLS |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials |
| `MAIL_FROM` | Sender address verified with your email provider |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials for seller image uploads |
| `REDIS_URL` | Optional Redis connection URL; caching is disabled when omitted |

Do not add a `VITE_` prefix to backend secrets. Never put `RAZORPAY_KEY_SECRET`, JWT secrets, SMTP credentials, or Cloudinary API secrets in Vercel.

### MongoDB Atlas network access

In Atlas, add a database user and allow network access from Render. For a quick staging test, Atlas Network Access can allow `0.0.0.0/0` with a strong database password. For production, use a Render plan with static outbound IPs (where available) and restrict the Atlas allowlist to those addresses. Never expose the database user password in frontend variables or source control.

### Create the seller account once

Run the seed command once **after** Atlas and the Render environment variables are configured. The easiest route is from your own computer: in your local `backend/.env`, temporarily set `MONGODB_URI` to the same Atlas URI and set the same `SEED_SELLER_EMAIL` / `SEED_SELLER_PASSWORD` values that you saved in Render. Then run:

```powershell
cd backend
npm run seed
```

This connects directly to Atlas and creates the one seller, starter categories and example products. You can restore your local MongoDB URI afterwards. Alternatively, use the Render service Shell (when available) and run `npm run seed` from the service Root Directory (`backend`). The seed is safe to rerun for sample categories/products, but it does not overwrite an existing seller's password. If it reports `Seller already exists`, use that existing email/password or use password reset after SMTP has been configured.

## 2. Deploy the frontend to Vercel

1. In Vercel choose **Add New → Project**, import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Choose Framework Preset **Vite**.
4. Confirm:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install` (or Vercel's detected npm install)
5. Add these Vercel Environment Variables for Production (and Preview only if you want preview deployments to call the same API):

```env
VITE_API_URL=/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

`VITE_RAZORPAY_KEY_ID` is a public checkout key ID. Never add the Razorpay secret here. `VITE_API_URL=/api/v1` uses the external-origin rewrite in `frontend/vercel.json` to proxy requests to `https://evaan-earth-api.onrender.com`. If you rename the Render service, update that destination in `frontend/vercel.json`, then redeploy Vercel.

6. Deploy. Vercel uses `frontend/vercel.json` to proxy `/api/*` to the Render API and route client-side paths such as `/shop`, `/auth`, `/checkout` and `/account` back to `index.html`.
7. Copy the final Vercel production URL, e.g. `https://evaan-earth.vercel.app`.

## 3. Connect the two deployments

Go back to Render → API service → Environment and set `CLIENT_URL` to the exact Vercel production origin, with no path and no trailing slash:

```env
CLIENT_URL=https://your-project.vercel.app
```

For a second allowed origin, use a comma-separated list:

```env
CLIENT_URL=https://your-project.vercel.app,https://www.your-custom-domain.com
```

Save and redeploy the Render service. The backend only allows those exact browser origins; it does not use `*` with credentialed cookies.

**Cookie note:** The browser calls the Vercel domain, not the Render domain, because `/api/*` is reverse-proxied by Vercel. This keeps the refresh cookie first-party while Render remains the API host behind the proxy. Keep `VITE_API_URL=/api/v1`; do not point the frontend directly at the `onrender.com` URL unless you intentionally change cookie/CORS handling.

## 4. Configure Razorpay webhooks

In Razorpay Dashboard → Webhooks, set the webhook URL to:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/v1/payments/webhook
```

Use the same value as `RAZORPAY_WEBHOOK_SECRET` in Render. Enable at least `payment.captured` and `payment.failed`. The app also verifies the checkout signature on the client return path; the webhook is the server-to-server confirmation route. Test with Razorpay test mode before switching to live mode.

## 5. Production checks

After both deployments are live:

- Open the Vercel URL and verify the home page and direct navigation to `/shop` and `/auth`.
- Register a customer, sign out, sign in again, refresh the page, and confirm the session remains authenticated.
- Sign in with the seeded seller account and add a test product with a Cloudinary upload.
- Add a customer address and place a test order with Razorpay test mode.
- Test failed payment, retry within five minutes, and stock restoration after expiry.
- Confirm Render logs show no MongoDB, CORS, cookie, or Razorpay errors.
- Set up SMTP before relying on password-reset OTP delivery.

### Important Render free-plan limitation

Render free web services can spin down while idle. That means the in-process minute-by-minute reservation cleanup worker pauses while the service is asleep. This project also performs a targeted expiry sweep for products during the next checkout request, so a stale hold on a requested product is released before stock is checked. For predictable background cleanup and a real customer-facing store, use an always-on Render web-service plan or create a separate Render Cron Job running the reservation-expiry script every minute. Do not treat a sleeping free service as a production payment/inventory service.

## 6. Local development remains unchanged

The existing local setup continues to use:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api/v1`
- `backend/.env` with `CLIENT_URL=http://localhost:5173`
- `frontend/.env` with `VITE_API_URL=http://localhost:5000/api/v1`

Run `npm run dev` from the repository root as before.
