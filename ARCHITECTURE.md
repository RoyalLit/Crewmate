
CREWMUTE
Campus Carpool App


Technical Architecture Document
Version 1.0  •  June 2026
Pahul  •  Amity University Punjab

CONFIDENTIAL — INTERNAL USE ONLY
 
1. System Overview
Crewmute is a mobile-first application consisting of two primary components: a React Native (Expo) mobile client targeting Android and iOS, and a RESTful Node.js/Express backend with Socket.io for real-time features. The system is stateless at the API layer, with all persistence handled by MongoDB Atlas and media by Cloudinary.

1.1 High-Level Architecture
Layer	Technology	Responsibility
Mobile Client	React Native + Expo SDK	UI, navigation, local state, push notifications
API Server	Node.js + Express.js	Business logic, auth, REST endpoints, Socket.io
Database	MongoDB Atlas (Mongoose)	All persistent data: users, rides, requests, messages
Real-time	Socket.io	Live chat, seat count updates, notification events
Media Storage	Cloudinary	Profile photos, student ID uploads
Push Notifications	Expo Push Notification Service	FCM/APNs delivery via Expo
Maps & Places	Nominatim API	City autocomplete in ride forms
Deployment	Railway (backend) + EAS (mobile)	Production hosting and app builds

1.2 Communication Flow
•	Mobile client communicates with backend over HTTPS REST (Axios)
•	Real-time chat and seat updates use WebSocket via Socket.io
•	Push notifications flow: server triggers Expo Push API → Expo routes to FCM (Android) or APNs (iOS)
•	Media uploads: client uploads directly to Cloudinary via signed URL, stores URL in MongoDB

 
2. Repository Structure
2.1 Backend — crewmute-api
backend/
├── src/
│   ├── config/          # env.ts (Zod validation), constants.ts
│   ├── db/
│   │   ├── models/      # Mongoose schemas (User, Ride, RideRequest, Message, Report)
│   │   └── connection.ts # MongoDB connection + graceful shutdown + slow-query plugin
│   ├── features/        # Feature-first directory structure
│   │   ├── auth/        # Register, login, OTP, refresh, logout, forgot/reset password
│   │   ├── rides/       # CRUD, browse, filter, auto-expiry cron
│   │   ├── requests/    # Send, accept/reject, withdraw, atomic transactions
│   │   ├── chats/       # Socket.io events, message loading
│   │   ├── users/       # Profile CRUD, push token registration, file upload
│   │   ├── safety/      # Block/report users
│   │   └── notifications/ # Expo push notification service
│   ├── middleware/       # auth, errorHandler, rateLimiter, validate, requestContext, requestLogger, metrics, notFound
│   ├── routes/          # index.ts — mounts all feature routes with rate limiters
│   ├── shared/          # logger.ts (pino), errors.ts (AppError hierarchy), response.ts, costCalc.ts, mailer.ts, asyncHandler.ts, types.ts
│   └── app.ts           # Express app factory (Helmet, CORS, parsers, sanitize, routes, error handler)
├── tests/
│   └── e2e/             # Integration + E2E tests (13 tests, 3 suites)
├── .env.example
├── Dockerfile           # Multi-stage, node:20-alpine
├── jest.config.ts
└── package.json

2.2 Mobile — crewmute-app
mobile/
├── app/                 # Expo Router — file-based routes
│   ├── (auth)/          # index (onboarding 4 screens + auth), login, register, verify, forgot-password, reset-password
│   ├── (tabs)/          # index (Explore feed), post, rides, chats, profile
│   ├── ride/            # [id].tsx — Ride detail screen
│   ├── chat/            # [rideId]/[otherUserId].tsx — Chat screen
│   ├── edit-profile.tsx # Profile editing
│   ├── report/          # Report user / ride
│   └── _layout.tsx      # Root layout, auth guard, font loading, asset preload
├── src/
│   ├── api/             # TanStack Query hooks per domain (auth, rides, chats, requests, users, safety)
│   ├── components/      # Shared UI components (RideCard, ChatRow, Avatar, EmptyState, etc.)
│   │   └── onboarding/  # Screen1-4, AuthScreen, shared.tsx (extracted from 867-line monolith)
│   ├── config/          # env.ts (typed config), constants.ts, featureFlags.ts
│   ├── context/         # AuthContext, SocketContext (React Context providers)
│   ├── design/          # tokens.ts (208 lines), theme.tsx, typography.ts, useReducedMotion.ts
│   ├── hooks/           # useColorScheme
│   ├── lib/             # api.ts (Axios), queryClient.ts, storage.ts (SecureStore)
│   ├── shared/          # types.ts (shared interfaces)
│   ├── store/           # Zustand stores: authStore, themeStore
│   └── utils/           # imageAssets.ts, logger.ts, notifications.ts, rideUtils.ts
├── assets/              # Images, fonts, screenshots
├── app.json
├── metro.config.js
├── tailwind.config.js
└── package.json

 
3. Database Schema
All collections are stored in MongoDB Atlas. Mongoose is used as the ODM. Relationships are handled via ObjectId references with selective population.

3.1 Users Collection
users
Field	Type	Required	Notes
_id	ObjectId	Auto	MongoDB default
name	String	Yes	Full name, trimmed, indexed
email	String	Yes	Unique, lowercase, indexed
password	String	Yes	bcrypt hash (12 rounds), never returned
college	String	Yes	Free text
homeCity	String	Yes	Default destination city
profilePhoto	String	No	Cloudinary URL
studentIdPhoto	String	No	Cloudinary URL (fallback verification)
isVerified	Boolean	Yes	Default false, true after OTP
verificationMethod	String (enum)	Yes	'email' | 'studentId'
expoPushToken	String	No	Updated on each login
refreshTokenHashes	String[]	Yes	SHA-256 hashes (rotated on use)
tokenVersion	Number	Yes	Incremented on global logout
otpCode	String	No	bcrypt hashed, cleared after verify
otpExpiresAt	Date	No	OTP expiry (10 min)
createdAt	Date	Auto	Mongoose timestamps
updatedAt	Date	Auto	Mongoose timestamps

3.2 Rides Collection
rides
Field	Type	Required	Notes
_id	ObjectId	Auto	
posterId	ObjectId (ref: User)	Yes	Indexed — ride creator
fromCity	String	Yes	Indexed for route queries
toCity	String	Yes	Indexed for route queries
departureDate	Date	Yes	Indexed for date filtering
departureTime	String	Yes	'HH:MM' format (regex validated)
totalSeats	Number	Yes	Min 1, max 6
availableSeats	Number	Yes	Decrements on accept (real-time via Socket.io)
farePerSeat	Number	Yes	In INR
cabType	String	No	'Sedan' | 'SUV' | 'Auto' | 'Other'
status	String (enum)	Yes	'active' | 'full' | 'cancelled' | 'expired'
notes	String	No	Optional, max 200 chars
stops	String[]	No	Intermediate cities
createdAt / updatedAt	Date	Auto	Mongoose timestamps
Indexes: { fromCity, toCity, departureDate } compound. { posterId } for My Rides. { status } for feed + cron.

3.3 Requests Collection
requests
Field	Type	Required	Notes
_id	ObjectId	Auto	
rideId	ObjectId (ref: Ride)	Yes	Indexed
requesterId	ObjectId (ref: User)	Yes	Indexed
posterId	ObjectId (ref: User)	Yes	Denormalized for query efficiency
status	String (enum)	Yes	'pending' | 'accepted' | 'rejected' | 'withdrawn'
message	String	No	Optional, max 100 chars
acceptedAt	Date	No	Set when status → 'accepted'
createdAt / updatedAt	Date	Auto	Mongoose timestamps
Unique: { rideId, requesterId } — one request per user per ride.

3.4 Messages Collection
messages
Field	Type	Required	Notes
_id	ObjectId	Auto	
chatId	ObjectId (ref: Chat)	Yes	Indexed
senderId	ObjectId (ref: User)	Yes	
content	String	Yes	Max 1000 chars
readBy	ObjectId[]	Yes	User IDs who read the message
createdAt	Date	Auto	Used for message ordering

3.5 Chats Collection
chats
Field	Type	Required	Notes
_id	ObjectId	Auto	
rideId	ObjectId (ref: Ride)	Yes	Parent ride context
participants	ObjectId[] (ref: User)	Yes	Always [poster, requester] — 2 participants
lastMessage	ObjectId (ref: Message)	No	Chat list preview
lastMessageAt	Date	No	For sorting chat list
createdAt / updatedAt	Date	Auto	Mongoose timestamps
Created automatically when a request is accepted (in MongoDB transaction). Queried via aggregate pipeline for performance.

 
4. API Endpoints
Base URL: https://crewmute-api.railway.app/api/v1
All protected routes require Authorization: Bearer <access_token> header.

4.1 Auth Routes — /auth (rate limited: 10 req / 15 min)
Method	Endpoint	Auth	Description
POST	/auth/register	Public	Register with email, name, college, homeCity, password. Sends OTP email.
POST	/auth/verify-otp	Public	Verify email OTP (bcrypt comparison). Returns access + refresh tokens.
POST	/auth/login	Public	Email + password login. Returns access + refresh tokens.
POST	/auth/refresh	Public	Exchange refresh token for new access + refresh pair (rotation).
POST	/auth/logout	Protected	Remove refresh token hash from user document.
POST	/auth/logout-global	Protected	Increment tokenVersion — invalidates all refresh tokens.
POST	/auth/verify-token	Protected	Verify current access token is still valid.
POST	/auth/forgot-password	Public	Send OTP email for password reset.
POST	/auth/reset-password	Public	Verify OTP + set new password.
POST	/auth/upload-student-id	Protected	Upload student ID photo to Cloudinary. Sets verificationMethod to 'studentId'.
POST	/auth/register-push-token	Protected	Register Expo push token for notifications.

4.2 User Routes — /users (rate limited: 100 req / 15 min)
Method	Endpoint	Auth	Description
GET	/users/me	Protected	Get current user profile (full).
PATCH	/users/me	Protected	Update name, college, homeCity, profilePhoto. Whitelist-validated.
GET	/users/:id	Protected	Get public profile (name, college, homeCity, photo only).
PATCH	/users/me/push-token	Protected	Update Expo push token.

4.3 Ride Routes — /rides (rate limited: 100 req / 15 min)
Method	Endpoint	Auth	Description
GET	/rides	Protected	List active rides. Query: fromCity, toCity, date, page, pageSize. Paginated. Escaped regex city search.
POST	/rides	Protected	Create a new ride. Validates time format (HH:MM), seats (1-6), fare > 0.
GET	/rides/my/posted	Protected	Get rides posted by current user. Paginated.
GET	/rides/my/joined	Protected	Get rides current user has been accepted into. Paginated.
GET	/rides/:id	Protected	Get single ride with poster info and available seats.
PATCH	/rides/:id	Protected	Update ride (poster only). Blocked after pending/accepted requests exist.
DELETE	/rides/:id	Protected	Cancel ride (poster only). Notifies all accepted requestors. Sets status to 'cancelled'.

4.4 Request Routes — /requests (rate limited: 100 req / 15 min)
Method	Endpoint	Auth	Description
POST	/requests	Protected	Send a seat request. Body: { rideId, message? }. Unique enforced per (ride, requester) — 409 on duplicate.
GET	/requests/ride/:rideId	Protected	Get all requests for a ride (poster only).
GET	/requests/my	Protected	Get all requests sent by current user. Paginated.
GET	/requests/incoming	Protected	Get all incoming requests (rides posted by current user). Paginated.
PATCH	/requests/:id/accept	Protected	Accept a request (poster only). Atomic transaction: decrements availableSeats, creates chat. Pushes seat count via Socket.io.
PATCH	/requests/:id/reject	Protected	Reject a request (poster only). Status checked — rejects non-pending.
DELETE	/requests/:id	Protected	Withdraw a pending request (requester only). Validates ownership.

4.5 Chat Routes — /chats (rate limited: 100 req / 15 min)
Method	Endpoint	Auth	Description
GET	/chats	Protected	Get all chats for current user (via aggregate pipeline).
GET	/chats/:id/messages	Protected	Get paginated messages for a chat. Query: page, pageSize, offset.
POST	/chats/:id/read	Protected	Mark all unread messages in chat as read. Updates lastMessage read status.
Note: Messages are sent and received via Socket.io, not REST. REST endpoints are for loading history and metadata only.

 
5. Real-time Architecture (Socket.io)
Socket.io runs on the same Express HTTP server. On connection, the client authenticates by sending its JWT access token. The server validates the token and attaches the user object to the socket. Connections use the WebSocket transport only (no long-polling fallback).

5.1 Connection & Auth
```typescript
// Client connects with auth token
const socket = io(API_URL, {
  auth: { token: accessToken },
  transports: ['websocket'],
});

// Server middleware validates token — implemented in sockets/auth.ts
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyAccessToken(token);
  if (!user) return next(new Error('Unauthorized'));
  socket.data.user = user;
  next();
});
```

5.2 Rooms
Room Name	Format	Purpose
User room	user:{userId}	Personal notifications (request received, accepted, rejected)
Chat room	chat:{chatId}	Real-time messages between matched riders
Ride room	ride:{rideId}	Seat count updates for all viewers of a ride

5.3 Socket Events
Direction	Event	Payload	Description
Client → Server	send_message	{ rideId, receiverId, content }	Send a chat message (content validated: 1-1000 chars)
Client → Server	mark_read	{ messageId }	Mark a single message as read
Server → Client	new_message	{ message object }	Broadcast new message to chat room
Server → Client	seats_updated	{ rideId, availableSeats }	Live seat count change (emitted when request accepted)

Note: Event naming uses `snake_case` for socket events to distinguish from REST camelCase. Client joins appropriate rooms via Socket.io's automatic room assignment — the server tracks which rooms each client belongs to internally.

6. Authentication Flow
6.1 Token Strategy
•	Access token: JWT, signed with ACCESS_TOKEN_SECRET, expires in 15 minutes, verified in requireAuth middleware
•	Refresh token: JWT, signed with REFRESH_TOKEN_SECRET, expires in 7 days, rotated on each use
•	Refresh token SHA-256 hashes stored in user document (supports up to 10 concurrent devices — REFRESH_TOKEN_ARRAY_MAX)
•	On refresh: old hash removed, new hash pushed — no old token remains valid after rotation
•	On logout: specific hash removed; global logout increments tokenVersion, invalidating all hashes

6.2 Registration Flow
Step	Action	Detail
1	POST /auth/register	Validate inputs with express-validator. Check email uniqueness (409 on duplicate). Hash password with bcrypt (12 rounds). Generate 6-digit OTP, hash with bcrypt. Store user with isVerified: false. Send OTP via Nodemailer. In development mode, log OTP and allow magic OTP 123456.
2	POST /auth/verify-otp	Find user by email. Check otpExpiresAt. Compare submitted OTP against stored bcrypt hash. Magic OTP 123456 bypasses hash comparison in development.
3	Verify success	Set isVerified: true. Clear otpCode + otpExpiresAt. Return access + refresh tokens. Access token payload: { userId, tokenVersion }. Refresh token: same payload + SHA-256 hash stored in user document.

6.3 Student ID Fallback
•	User registers without college email (uses personal email)
•	After registration, uploads student ID photo via POST /auth/upload-student-id
•	Photo stored in Cloudinary under /crewmute/student-ids/ folder
•	verificationMethod set to 'studentId', isVerified set to true immediately for MVP
Note: For MVP, student ID upload is self-serve trust. Post-MVP, manual review or AI verification can be added.

 
7. Key Business Logic
7.1 Accept Request — Atomic Operation
When a poster accepts a request, three things must happen atomically to prevent race conditions:
•	Request status updated to 'accepted'
•	Ride's availableSeats decremented by 1
•	If availableSeats reaches 0, ride status set to 'full'
•	Chat document created between poster and requester
Implementation: Use a MongoDB session (transaction) wrapping the above operations. If any step fails, the entire transaction rolls back.

7.2 Cost Split Calculator
Location: backend/src/shared/costCalc.ts
```typescript
function calculateFarePerSeat(totalFare: number, seats: number): number {
  return Math.ceil(totalFare / seats); // Round up to nearest rupee
}

function calculateTotalFare(farePerSeat: number, seats: number): number {
  return farePerSeat * seats;
}
```

7.3 Ride Auto-expiry
•	A cron job runs every 30 minutes (node-cron)
•	Queries rides where departureDate < now AND status is 'active' or 'full'
•	Updates matching rides to status: 'expired'
•	Expired rides are excluded from the feed but remain in My Rides history

7.4 Push Notification Service
Location: backend/src/features/notifications/notification.service.ts
```typescript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(expoPushToken, title, body, data) {
  if (!Expo.isExpoPushToken(expoPushToken)) return;
  const message = { to: expoPushToken, sound: 'default', title, body, data };
  await expo.sendPushNotificationsAsync([message]);
}
```

Notifications triggered on:
•	New seat request → poster notified
•	Request accepted → requester notified
•	Request rejected → requester notified
•	Ride cancelled → all accepted requestors notified

 
8. Environment Variables
8.1 Backend (.env)
Variable	Required	Purpose
PORT	No (default: 5000)	Express server port
NODE_ENV	No (default: development)	'development' | 'production' | 'test'
MONGO_URI	✅	MongoDB Atlas connection string
ACCESS_TOKEN_SECRET	✅ (min 32 chars)	JWT access token signing key
REFRESH_TOKEN_SECRET	✅ (min 32 chars)	JWT refresh token signing key
EMAIL_HOST	For OTP	Nodemailer SMTP host (optional in dev)
EMAIL_USER	For OTP	Sender email address
EMAIL_PASS	For OTP	SMTP app password
CLOUDINARY_CLOUD_NAME	For uploads	Cloudinary account name (optional)
CLOUDINARY_API_KEY	For uploads	Cloudinary API key
CLOUDINARY_API_SECRET	For uploads	Cloudinary API secret
CLIENT_URL	No (default: *)	Mobile app URL for CORS

8.2 Mobile (.env)
Variable	Required	Purpose
EXPO_PUBLIC_API_URL	Yes	Base URL for backend API (e.g., http://localhost:5001)

9. DevOps & Deployment
9.1 GitHub Strategy
•	Single repo: Crewmute (monolith with backend/ + mobile/ directories)
•	Branch strategy: main (production), dev (integration), feature/* (individual features)
•	All feature branches PR into dev. Dev merged into main on milestone completion.
•	Conventional Commits: feat:, fix:, chore:, refactor:, test:, docs:, perf:

9.2 GitHub Actions CI
File: .github/workflows/ci.yml
Triggers: push to main/dev, PR to main
Jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 (node 20, cache: npm)
      - working-directory: backend
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test (with CI env vars)
  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 (node 20, cache: npm)
      - working-directory: mobile
      - run: npm ci
      - run: npm run typecheck

9.3 Railway Deployment
•	Connect Railway to GitHub repo; root directory = backend/
•	Build command: npm run build; Start command: npm start
•	Auto-deploy on push to main
•	Environment variables set in Railway dashboard (not in repo)
•	Health endpoint: GET /health → { status: 'ok', uptime } (liveness)
•	Readiness endpoint: GET /health/ready → checks MongoDB connection
•	Prometheus metrics: GET /metrics
•	UptimeRobot pings /health every 5 minutes to prevent cold starts on free tier

9.4 Expo EAS Build
•	eas build --platform android → APK for beta testing
•	eas build --platform ios → IPA for TestFlight
•	eas.json defines build profiles: development, preview, production
•	OTA updates via expo-updates for JS-only changes post-launch

 
10. Security Checklist
Security Measure	Status	Layer
Passwords hashed with bcrypt (rounds: 12)	✅	Backend
JWT access tokens expire in 15 minutes	✅	Backend
Refresh token rotation on each use	✅	Backend
SHA-256 hashed refresh tokens in DB (not plaintext)	✅	Backend
OTP hashed with bcrypt before storage	✅	Backend
All inputs validated with express-validator	✅	Backend
Rate limiting on auth endpoints (10 req/15min)	✅	Backend
Rate limiting on general endpoints (100 req/15min)	✅	Backend
CORS restricted to configured client origin	✅	Backend
Helmet.js security headers	✅	Backend
NoSQL injection sanitizer (express-mongo-sanitize)	✅	Backend
Tokens stored in SecureStore (not AsyncStorage)	✅	Mobile
User profile data restricted (public vs private)	✅	Backend
File upload size + MIME type validation	✅	Backend
Zod environment validation on startup	✅	Backend
Error responses never expose stack traces in production	✅	Backend
Logging redacts passwords, tokens, OTPs, secrets	✅	Backend
Prometheus /metrics endpoint (restrict in production)	✅	Backend
AsyncLocalStorage request tracing	✅	Backend
Graceful shutdown (HTTP drain → DB disconnect)	✅	Backend
Unhandled rejection + exception handlers	✅	Backend
MongoDB Atlas IP allowlist	⚠️	Infrastructure (needs config)
Sentry error monitoring	🔲	Post-MVP

