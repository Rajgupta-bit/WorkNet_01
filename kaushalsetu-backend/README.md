# KaushalSetu Backend

Node.js + Express + MongoDB backend for the React SIH frontend.

## Features
- JWT authentication + bcrypt
- Customer / Provider / Admin roles
- Services and provider discovery
- MongoDB 2dsphere nearby-provider queries
- Bookings, confirmation and cancellation
- Booking notifications + unread count
- Community posts, one-user-one-like, replies
- Reviews for completed bookings
- Razorpay test-mode order creation endpoint

## Run
1. Install Node.js 18+.
2. Copy `.env.example` to `.env` and fill MongoDB credentials. Razorpay keys are optional until payments are used.
3. Run:
   npm install
   npm run dev

API base: `http://localhost:5000/api`

## Frontend connection
Create a small API helper in React with `VITE_API_URL=http://localhost:5000/api`.
Send `Authorization: Bearer <token>` for protected endpoints.

### Main endpoints
POST /auth/register
POST /auth/login
GET  /auth/me
GET  /services
GET  /providers?skill=Cleaning&lat=26.8&lng=80.9&distance=10000
POST /providers
POST /bookings
GET  /bookings/mine
PATCH /bookings/:id/cancel
PATCH /bookings/:id/confirm
GET  /notifications
GET  /notifications/unread
PATCH /notifications/:id/read
PATCH /notifications/read-all
GET  /community/posts
POST /community/posts
POST /community/posts/:id/like
GET  /community/posts/:id/replies
POST /community/posts/:id/replies
POST /reviews
GET  /reviews/:providerId
POST /payments/create-order

## Payment note
`create-order` creates a Razorpay order only. For production, verify the Razorpay payment signature server-side and use webhooks before marking a booking paid/confirmed.
