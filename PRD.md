
CREWMUTE
Campus Carpool App


Product Requirements Document
Version 1.0  •  June 2026
Pahul  •  Amity University Punjab

CONFIDENTIAL — INTERNAL USE ONLY
 
1. Executive Summary
Crewmute is a mobile-first carpool platform designed specifically for Indian college students who travel home on weekends and holidays. Students currently rely on fragmented WhatsApp groups and personal networks to find co-passengers for shared cabs — a process that is slow, unreliable, and limited to existing contacts.

Crewmute solves this by providing a structured, trusted platform where students can post rides or browse available seats, coordinate with verified co-passengers, and split cab costs transparently — all from a single mobile app.

Problem Statement
Every weekend, thousands of Indian college students travel home via shared cabs. Finding co-passengers today means posting in WhatsApp groups, waiting for responses, coordinating manually, and hoping the timing aligns. There is no dedicated product for this specific use case — intercity student travel to home cities on weekends and holidays.

Solution
A React Native mobile app (Android + iOS) with a Node.js/Express/MongoDB backend, enabling students to post rides, browse matches by route and date, request seats, coordinate via in-app chat, and split costs transparently.

Target Users
•	Indian college students aged 18–24
•	Traveling intercity to home cities on weekends and public holidays
•	Using shared cabs (not personal vehicles) as the primary mode
•	Seeking to reduce cost and find trusted co-passengers

 
2. Goals & Success Metrics
2.1 Product Goals
•	Enable students to find verified co-passengers for intercity weekend travel
•	Reduce per-person cab cost through transparent fare splitting
•	Build a trusted community through college-based identity verification
•	Deliver a polished, production-quality mobile app for portfolio and internship impact

2.2 Learning Goals
•	Build a complete REST API from scratch using Node.js, Express, and MongoDB
•	Learn React Native and Expo end-to-end with real-world complexity
•	Implement real-time features using Socket.io
•	Integrate third-party services: Google Maps, Expo Push Notifications, Cloudinary
•	Practice proper DevOps: Railway deployment, GitHub branching, environment management

2.3 Success Metrics (MVP)
Metric	Target	Timeframe
Test users (beta)	25–50 students	Week 6
Rides posted	20+ in first week	Post-launch
Successful matches	10+ confirmed rides	Post-launch
App crash rate	< 1%	Ongoing
API response time	< 300ms (p95)	Ongoing

3. Scope
3.1 In Scope (MVP)
Authentication & Onboarding
•	Register with college email (auto-verified via email OTP)
•	Fallback: student ID photo upload for colleges without institutional email
•	Profile setup: name, college, home city, profile photo
•	JWT-based session management with refresh tokens

Ride Posting
•	Post a ride: from city, to city, date, departure time, total seats, cab type
•	Set fare per seat (manual input with cost split calculator helper)
•	Edit or cancel a posted ride
•	Ride expires automatically after departure time

Ride Discovery
•	Browse rides filtered by route (from + to) and date
•	Search with city autocomplete (Nominatim/OpenStreetMap)
•	View ride card: poster's college, home city, seats left, fare, departure time
•	View poster's profile before requesting

Ride Requests
•	Request to join a ride (seats pending acceptance)
•	Poster accepts or rejects requests
•	Push notification on request, acceptance, or rejection
•	Seat count updates in real time after acceptance

In-App Chat
•	One-on-one chat between matched riders (post-acceptance only)
•	Real-time messaging via Socket.io
•	Basic chat: text messages, timestamps, read receipts

Cost Split Calculator
•	Input total cab fare, auto-calculates per-person share
•	Displayed on ride card and in chat for reference
•	No in-app payment processing — settlement happens offline

Ratings & Reviews
•	Leave a 1 to 5 star rating and optional text review for co-passengers and posters after a ride has departed
•	View a user's average rating and total review count on their profile
•	View a dedicated screen listing all past reviews a user has received

3.2 Out of Scope (MVP)
•	In-app payments or UPI integration
•	Driver/cab booking functionality
•	Group rides with more than one cab
•	Ride tracking / live GPS
•	Web version
•	Admin dashboard

 
4. User Personas
Persona 1 — The Weekend Traveler
Name	Arjun, 20
College	Amity University Punjab
Home	Delhi
Problem	Travels home every 2–3 weekends. WhatsApp groups are chaotic. Pays ₹800 solo vs ₹200 shared.
Goal	Find 2–3 co-passengers heading to Delhi on Friday evening without the hassle.

Persona 2 — The Holiday Planner
Name	Priya, 21
College	Chandigarh University
Home	Ludhiana
Problem	Plans travel 3–4 days in advance. Wants to know co-passengers are verified students.
Goal	Book a confirmed seat early, know who she's traveling with, split the cost fairly.

5. Feature Requirements
5.1 Authentication
#	Feature	Description	Priority
F01	Email Registration	Register with college email, OTP verification via Nodemailer	P0
F02	ID Fallback	Upload student ID photo for colleges without institutional email	P0
F03	JWT Auth	Access + refresh token pair, 15min access / 7d refresh	P0
F04	Profile Setup	Name, college, home city, profile photo (Cloudinary)	P0
F05	Logout	Invalidate refresh token on logout	P0

5.2 Ride Management
#	Feature	Description	Priority
F06	Post Ride	From, to, date, time, seats, fare per seat, cab type	P0
F07	Edit Ride	Update seat count or fare before any requests	P1
F08	Cancel Ride	Cancel ride, notify all pending/accepted requestors	P0
F09	Auto-expire	Rides auto-expire after departure datetime	P1
F10	My Rides	View rides posted and rides joined	P0

5.3 Ride Discovery
#	Feature	Description	Priority
F11	Browse Feed	Paginated list of active rides, newest first	P0
F12	Route Filter	Filter by from city + to city	P0
F13	Date Filter	Filter by travel date	P0
F14	City Autocomplete	Nominatim (OpenStreetMap) for city input fields	P0
F15	Ride Detail View	Full ride info + poster's college profile	P0

5.4 Requests & Matching
#	Feature	Description	Priority
F16	Send Request	Request a seat on a ride (status: pending)	P0
F17	Accept/Reject	Poster accepts or rejects each request	P0
F18	Seat Counter	Available seats decrement on acceptance in real time	P0
F19	Request Status	Requester sees pending / accepted / rejected status	P0
F20	Withdraw Request	Requester can withdraw a pending request	P1

5.5 Chat & Notifications
#	Feature	Description	Priority
F21	In-App Chat	Real-time 1:1 chat between matched riders via Socket.io	P0
F22	Push Notifications	Notify on: new request, acceptance, rejection, message	P0
F23	Read Receipts	Show message read status	P1
F24	Cost Calculator	Auto-calculates per-person share shown in ride detail	P0

Priority Legend:
•	P0 — Must have for MVP launch
•	P1 — Should have, included if time permits
•	P2 — Future release

 
6. Tech Stack
6.1 Mobile (Frontend)
Technology	Version	Purpose
React Native	0.81	Cross-platform mobile framework
Expo	SDK 54	Build tooling, EAS builds, OTA updates
Expo Router	v6	File-based navigation
NativeWind	v4	Tailwind CSS utility classes for RN
TanStack Query	v5	Server state management (caching, pagination, mutations)
Zustand	v4	Minimal global state (auth, theme, notifications)
Socket.io Client	4.x	Real-time chat connection
Expo Notifications	latest	Push notification handling
React Native Maps	latest	City search + route preview (Nominatim for autocomplete)
expo-blur	SDK 54 compatible	iOS Liquid Glass tab bar blur effect
expo-image	3.x	Image caching and performance
React Native Reanimated	4.x	Animation library (onboarding, transitions)

6.2 Backend
Technology	Version	Purpose
Node.js	20 LTS	Runtime
Express.js	4.x	REST API framework
MongoDB	7.x	Primary database
Mongoose	8.x	ODM for MongoDB
Socket.io	4.x	Real-time WebSocket server
JWT + bcrypt	latest	Auth — access/refresh tokens + password hashing
Nodemailer	latest	OTP email delivery
Cloudinary SDK	latest	Profile photo storage
Pino	9.x	Structured JSON logging
express-rate-limit	latest	Rate limiting (auth: 10/15min, general: 100/15min)
prom-client	latest	Prometheus metrics at GET /metrics
Zod	4.x	Environment variable validation at startup
express-mongo-sanitize	latest	NoSQL injection prevention

6.3 Infrastructure & DevOps
Tool	Plan	Purpose
Railway	Hobby (free)	Backend deployment (auto-deploy on main push)
MongoDB Atlas	Free tier	Cloud database (daily backups)
Cloudinary	Free tier	Media storage (profile photos, student IDs)
Expo EAS	Free tier	APK + IPA builds + OTA updates
GitHub Actions	Free	CI pipeline (typecheck + lint + test on push/PR)
Docker	Local	Containerized backend (multi-stage, node:20-alpine)
UptimeRobot	Free	Health check pings to prevent Railway cold starts

7. User Flows
7.1 Onboarding Flow
•	App launch → Splash screen → Login / Register screen
–	Register: Enter name, college email → Receive OTP → Verify → Set password
–	Fallback: No college email → Upload student ID photo → Manual approval (simple flag in DB)
•	Profile setup: Upload photo (optional) → Set home city → Done → Home feed

7.2 Post a Ride Flow
•	Tap '+' on home screen → Post Ride form
–	From city (autocomplete) → To city (autocomplete) → Date picker → Time picker
–	Total seats → Fare per seat (calculator shown) → Cab type (optional) → Submit
•	Ride appears in feed immediately → Poster receives confirmation notification

7.3 Find & Join a Ride Flow
•	Home feed → Filter by route + date → Browse ride cards
•	Tap ride card → Ride detail screen → View poster profile → Tap 'Request Seat'
•	Notification sent to poster → Poster accepts/rejects → Requester notified
•	On acceptance: chat unlocked between matched riders

7.4 Manage Requests Flow (Poster)
•	Notification: 'New request from [Name]' → Tap → View requester profile
•	Accept or Reject → Seat count updates → Chat opened on accept

 
8. Non-Functional Requirements
8.1 Performance
•	API response time: < 300ms for 95th percentile under normal load
•	App cold start: < 3 seconds on mid-range Android device
•	Real-time message delivery: < 500ms latency
•	Tab bar BlurView must not be rendered on Android — gated with Platform.OS === 'ios'. Android solid fallback must not cause jank on Snapdragon 680-class devices (target: 0 dropped frames during tab switch).

8.2 Security
•	All passwords hashed with bcrypt (salt rounds: 12)
•	JWT access tokens expire in 15 minutes
•	Refresh tokens stored in httpOnly cookies on web; secure storage on mobile
•	All API routes protected with auth middleware except register/login
•	Input validation on all endpoints using express-validator
•	Rate limiting on auth endpoints (express-rate-limit)

8.3 Reliability
•	Zero-downtime deployments via Railway
•	MongoDB Atlas automatic backups (free tier: daily)
•	Error logging via console.error → upgrade to Sentry post-MVP

8.4 Compatibility
•	Android: 8.0+ (API 26+)
•	iOS: 14.0+
•	Screen sizes: 5" – 6.7" phones, portrait mode primary
•	Liquid Glass blur tab bar requires iOS 15+ (BlurView systemChromeMaterial tint). On iOS 14 — which is in scope — fall back to the Android solid style. Gate with Platform.Version.

9. Build Timeline
Total: 6 weeks at 20+ hours/week.

Week	Phase	Deliverables
1	Backend Core	Project setup, Express boilerplate, MongoDB connection, Auth endpoints (register, login, OTP, refresh, logout), JWT middleware, Postman collection
2	Backend Features	Ride CRUD endpoints, Request endpoints, User profile endpoints, Cloudinary integration, Input validation, Rate limiting, GitHub Actions CI
3	Mobile Foundation	Expo project setup, Expo Router navigation, NativeWind config, Auth screens (register, login, OTP), Profile setup screen, API integration (Axios)
4	Mobile Core	Home feed, Ride detail, Post ride form, Request flow, My rides screen, Nominatim autocomplete, Cost calculator UI
5	Real-time & Polish	Socket.io chat, Push notifications (Expo), Read receipts, Error states, Loading skeletons, Edge case handling
6	Ship	EAS build (APK + IPA), Railway backend deploy, MongoDB Atlas production setup, README, demo video, GitHub cleanup

 
10. Risks & Mitigations
Risk	Likelihood	Mitigation
React Native learning curve delays mobile build	High	Start with Expo, use NativeWind for familiar syntax, mock API in Week 3
Free Nominatim Tier	Medium	Keep request volume low, cache results where possible
College email not available for all Indian students	High	Student ID fallback implemented as P0
Socket.io complexity on mobile	Medium	Use Expo managed workflow, test on real device from day one
Railway free tier cold starts	Low	Add keep-alive ping via cron job or UptimeRobot (free)
BlurView performance on Android mid-range devices.	Medium	BlurView is iOS-only in implementation. Android uses a solid semi-opaque fallback. No BlurView code path executes on Android.

11. Future Roadmap (Post-MVP)
v1.1
•	Ride history with basic stats
•	Gender preference filter (opt-in)

v1.2
•	In-app UPI payment via Razorpay
•	Verified college badge system
•	Group chat for rides with 3+ passengers

v2.0
•	Live ride tracking via Google Maps
•	Emergency contact sharing feature
•	Admin dashboard for moderation
•	iOS App Store + Google Play Store submission

12. Competitive Landscape
App	Target	Model	Gap Crewmute Fills
BlaBlaCar	General public	Driver-owned cars	No student-specific trust model, not built for shared cabs
QuickRide	Office commuters	Daily carpool	Not designed for intercity weekend/holiday travel
sRide	Professionals	Office carpools	Corporate-focused, not student-centric
WhatsApp Groups	Everyone	Manual coordination	No structure, no verification, no seat management

Crewmute's differentiation: the only platform built specifically for Indian college students doing intercity travel home on weekends and holidays, with college-based identity verification and shared cab coordination as core features.

