# Architecture & operational contracts

## Stock reservation state machine

`payment_pending + active` is the only state eligible for payment retries. The reservation has an absolute `reservationExpiresAt` deadline. Stock decrement and order creation share one MongoDB transaction. The expiry worker performs a compare-and-set from `active` to `released`; only the transaction that changes the state restores stock. Payment capture performs the compare-and-set from `active` to `consumed`. Therefore release and capture cannot both win.

If capture arrives after release, the order is marked `refund_required` and is not fulfilled. The payment service attempts a Razorpay refund; if that fails, the order remains auditable for manual reconciliation.

## Request / trust boundaries

- Only registration may create `customer`; role is immutable in the user model. The seller is established by the one-time seed script.
- Access JWT is short-lived. Refresh JWT is stored only as a SHA-256 hash and rotated on refresh in an httpOnly cookie.
- Checkout amount is calculated from current database prices; client-submitted prices are ignored.
- Razorpay Checkout signature and raw-body webhook signature are verified on the backend.
- Product uploads are MIME-sniffed, normalized by Sharp and stored in Cloudinary. A user-provided image URL remains supported for local demo assets.

## Scaling notes

The in-process scheduler is adequate for a single API instance. In a horizontally scaled production deployment, move reservation expiry to a singleton worker/queue (BullMQ or a database lease) and make webhook processing idempotent by persisting Razorpay event IDs. Redis cache is optional and is deliberately treated as disposable.
