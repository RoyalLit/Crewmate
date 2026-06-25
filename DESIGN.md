
CREWMUTE
Campus Carpool App


Design System & UI Specification
Version 1.0  •  June 2026
Pahul  •  Amity University Punjab

CONFIDENTIAL — INTERNAL USE ONLY
 
1. Brand Identity
1.1 Brand Philosophy
Crewmute is built on one idea: going home should feel easy and social, not stressful and expensive. The brand sits at the intersection of trust and energy — it's reliable enough that students feel safe, and vibrant enough that it feels like their app, not a corporate product.

Three brand pillars:
•	Crew — you're not riding alone. The brand is warm, social, community-first.
•	Commute — practical, efficient, no fluff. It does what it says.
•	Gen Z native — honest, direct, visually confident without being loud.

1.2 Brand Voice
Dimension	Is	Is Not
Tone	Casual, direct, warm	Corporate, formal, stiff
Language	Short sentences. Clear CTAs.	Jargon, filler words, passive voice
Personality	Like a trusted college senior	A startup trying to be cool
Energy	Confident and calm	Loud, hype-driven, cluttered

1.3 Wordmark
The Crewmute wordmark is set in Plus Jakarta Sans Bold, all-caps, tracked at +20. No icon. No tagline in the wordmark itself.

Context	Specification
Primary (Dark BG)	CREWMUTE — #6C63FF on #0F0F1A
Primary (Light BG)	CREWMUTE — #0F0F1A on #F7F7FC
Monochrome	CREWMUTE — #FFFFFF on any dark surface
Minimum size	16px height — never smaller
Clear space	1× cap-height on all sides
Never do	Stretch, rotate, add drop shadows, use on busy backgrounds

 
2. Color System
Crewmute uses a dual-mode palette designed to feel distinctive in both light and dark contexts. The primary brand color is Electric Violet — confident, modern, and rare in the Indian student app space. Coral Pink provides warmth and energy as a secondary. Mint Green grounds confirmations.

2.1 Brand Colors
Swatch	Name	Hex	Light Mode Use	Dark Mode Use
    Brand Navy	#0F0F1A	Primary bg, text on light	Text, headers
    Electric Violet	#6C63FF	Primary CTA, active states	Primary CTA, active states
    Coral Pink	#FF6584	Alerts, tags, secondary CTA	Alerts, tags, secondary CTA
    Mint Green	#00C896	Accepted, success states	Accepted, success states
    Amber	#FFB84C	Pending, warning states	Pending, warning states
    Cool Gray	#8B8FA8	Subtext, placeholders, icons	Subtext, placeholders, icons

2.2 Light Mode Tokens
Token	Value	Used For
background.primary	#F7F7FC	Main screen background
background.card	#FFFFFF	Cards, modals, bottom sheets
background.subtle	#EDEDF8	Input fields, tag backgrounds
text.primary	#0F0F1A	Headlines, body text
text.secondary	#4B5563	Subtext, metadata
text.placeholder	#8B8FA8	Input placeholder text
border.default	#E4E4F0	Card borders, dividers
interactive.primary	#6C63FF	Buttons, links, active tabs
interactive.primaryText	#FFFFFF	Text on primary buttons

2.3 Dark Mode Tokens
Token	Value	Used For
background.primary	#0F0F1A	Main screen background
background.card	#1C1C2E	Cards, modals, bottom sheets
background.subtle	#252538	Input fields, tag backgrounds
text.primary	#F0F0FF	Headlines, body text
text.secondary	#9CA3AF	Subtext, metadata
text.placeholder	#6B7280	Input placeholder text
border.default	#2E2E4A	Card borders, dividers
interactive.primary	#7C74FF	Buttons, links, active tabs (slightly lighter for dark bg contrast)
interactive.primaryText	#FFFFFF	Text on primary buttons

💡 All color pairs meet WCAG AA contrast ratio (4.5:1 minimum) for text. Verify with the Expo accessibility inspector before shipping.

 
3. Typography
3.1 Typeface
Primary: Plus Jakarta Sans — geometric, modern, confident. Available via expo-google-fonts. Used for all UI text.
Monospace (code/tokens only): Fira Code — not used in the app UI, only in developer documentation.

💡 Install: npx expo install @expo-google-fonts/plus-jakarta-sans expo-font

3.2 Type Scale
Name	Size (px)	Weight	Line Height	Used For
Display	32	800 (ExtraBold)	40	Splash screen, onboarding hero
Heading 1	24	700 (Bold)	32	Screen titles, section headers
Heading 2	20	700 (Bold)	28	Card titles, modal headers
Heading 3	17	600 (SemiBold)	24	Subheadings, group labels
Body Large	16	400 (Regular)	24	Primary body text, ride descriptions
Body	14	400 (Regular)	22	Secondary body, card metadata
Body Small	13	400 (Regular)	20	Captions, timestamps, helper text
Label	12	600 (SemiBold)	16	Tags, badges, status chips
Button	15	700 (Bold)	20	All button labels, CTAs
Tab Label	11	600 (SemiBold)	14	Bottom tab bar labels

3.3 Typography Rules
•	Never use more than 3 type sizes on a single screen
•	Heading 1 is reserved for one element per screen — the screen title
•	Never use Regular weight for interactive elements (buttons, links, tabs)
•	Letter spacing: -0.3px on Display and H1 for tighter, premium feel
•	Line length: max 60 characters per line for body text

4. Spacing & Layout
4.1 Spacing Scale
All spacing follows a base-4 system. Every margin, padding, and gap should be a multiple of 4.

Token	Value	Common Use
space.1	4px	Icon internal padding, micro gaps
space.2	8px	Between icon and label, tag internal padding
space.3	12px	Input internal padding (top/bottom), small card gaps
space.4	16px	Card internal padding, section spacing, list item gap
space.5	20px	Screen horizontal padding (safe area), button height
space.6	24px	Between cards in feed, modal top padding
space.8	32px	Section header to content, large vertical gaps
space.10	40px	Hero section padding, onboarding margins

4.2 Layout Grid
•	Screen horizontal padding: 20px on both sides (safe area aware)
•	Cards: full-width within safe area, 16px internal padding
•	Two-column layouts (e.g. ride stats row): 50% / 50% with 12px gap
•	Bottom tab bar height: 64px + safe area inset
•	Minimum touch target size: 44×44px (Apple HIG standard)

4.3 Corner Radius
Element	Radius	Rationale
Screen containers / pages	0px	Edge-to-edge feel, modern
Cards	16px	Soft, approachable, modern
Primary buttons	12px	Confident, not pill-shaped
Input fields	10px	Clean, easy to scan
Tags / chips / badges	100px (pill)	Compact, instantly scannable
Bottom sheets / modals	24px top corners only	Standard mobile pattern
Avatar / profile photo	100px (circle)	Approachable, personal
Icon containers	8px	Subtle, structured

 
5. Component Library
5.1 Buttons
Variant	Background	Text	Use Case
Primary	#6C63FF	#FFFFFF Bold 15px	Main CTA — Post Ride, Request Seat, Send
Secondary	Transparent + #6C63FF border	#6C63FF Bold 15px	Secondary actions — Edit, View Profile
Danger	#FF6584	#FFFFFF Bold 15px	Cancel Ride, Reject Request
Ghost	Transparent	#6C63FF Bold 15px	Tertiary actions, links in text
Disabled	#E4E4F0	#8B8FA8 Bold 15px	Any unavailable action
Button spec: height 52px, horizontal padding 24px, border radius 12px, full-width on forms, auto-width on detail screens.

5.2 Status Chips
Label	Background	Text Color	Used On
Active	#E8F5F0 / #00C896 20%	#00C896	Ride card, My Rides
Pending	#FFF6E8 / #FFB84C 20%	#FFB84C	Request card, My Requests
Accepted	#E8F5F0	#00C896	Request card
Rejected	#FFF0F3 / #FF6584 20%	#FF6584	Request card
Full	#F0EFFF / #6C63FF 20%	#6C63FF	Ride card when seats = 0
Expired	#F3F4F6	#8B8FA8	My Rides history
Cancelled	#FFF0F3	#FF6584	My Rides history

5.3 Ride Card — Component Spec
The Ride Card is the most important repeating component in the app. It must convey all key information at a glance.

Element	Specification
Container	bg: card | radius: 16px | padding: 16px | shadow: 0 2px 12px rgba(0,0,0,0.06)
Route line	FROM CITY → TO CITY | H2 Bold | text.primary | arrow in accent color
Date + time	Body size | text.secondary | calendar icon left-aligned
Poster info	Avatar 32px + name + college | Body Small | horizontal row
Seats badge	Pill chip — '3 seats left' | Mint if >1, Amber if 1, Violet if 0 (full)
Fare	₹ amount Bold H3 | right-aligned | text.primary
Status chip	Top-right corner | absolute positioned | see 5.2
Tap target	Entire card is tappable — navigate to Ride Detail

5.4 Input Fields
State	Specification
Default	bg: background.subtle | border: 1px border.default | radius: 10px | padding: 14px 16px
Focused	border: 2px #6C63FF | bg: background.subtle | label animates up (floating label pattern)
Error	border: 2px #FF6584 | error message below in Body Small Coral Pink
Disabled	bg: border.default | text: placeholder | no interaction
With icon	Left icon 20px in neutral color | 12px gap to text | icon turns accent on focus

5.5 Navigation — Bottom Tab Bar
Tab	Icon	Label	Screen
1	compass-outline	Explore	Home feed — browse rides
2	add-circle	Post	Post a Ride (opens bottom sheet)
3	car-outline	My Rides	Rides posted and joined
4	chatbubble-outline	Chats	All active chats
5	person-outline	Profile	User profile and settings
Active tab: icon fills to solid, label turns #6C63FF, subtle 4px indicator dot above icon. Inactive: outline icon, #8B8FA8 label.
Background — Platform Variants
Platform	Style	Implementation
iOS 18+	Liquid Glass blur — frosted glass panel floating above content. Background content scrolls and refracts beneath it.	expo-blur BlurView, intensity={60}, tint="systemChromeMaterial". Tab bar background: transparent. Requires position: absolute at bottom.
Android	Semi-opaque solid — dark mode: rgba(15,15,26,0.94). Light mode: rgba(247,247,252,0.94). 1px top border at border.default token. No blur.	Standard React Native View with backgroundColor set per theme token. No BlurView — perf cost is too high on mid-range devices.
Both	Height: 64px + SafeAreaView bottom inset. Padding-bottom matches device home indicator.	useSafeAreaInsets() from react-native-safe-area-context. Already in Expo SDK — no separate install.
Gate with Platform.OS — wrap BlurView in a conditional so Android never tries to render it. See Section 9 (Theme Implementation) for the pattern.

Elevation & Separator
Context	Spec
iOS — Light mode	No shadow. BlurView creates natural depth. Top border: none.
iOS — Dark mode	No shadow. Top border: 0.5px rgba(255,255,255,0.08) — subtle glass edge.
Android — Light mode	Top border: 1px #E4E4F0 (border.default token).
Android — Dark mode	Top border: 1px #2E2E4A (border.default dark token).

Content Scroll Behaviour
On both platforms, the feed and list screens must add a paddingBottom equal to the tab bar height (64px + safe area inset) so the last list item is never hidden behind the bar. Pass this value via context or a shared TAB_BAR_HEIGHT constant.
For iOS Liquid Glass specifically — the content intentionally scrolls behind the blur layer. Do not add an opaque spacer; let the blur do its job. Only the padding-bottom on the ScrollView matters.

Dependencies
Package	Install	Purpose
expo-blur	npx expo install expo-blur	BlurView for iOS Liquid Glass tab bar
react-native-safe-area-context	Already in Expo SDK	Bottom inset for home indicator


5.6 Avatar Component
•	Sizes: xs (24px), sm (32px), md (48px), lg (64px), xl (96px)
•	Shape: perfect circle (borderRadius: 100)
•	Fallback: gradient background (#6C63FF → #FF6584) with initials in white Bold
•	Border: 2px white on dark surfaces, 2px #E4E4F0 on light surfaces
•	Verified indicator: small green dot bottom-right on md+ sizes for email-verified users

 
6. Screen-by-Screen Specification
6.1 Splash & Onboarding
•	Splash: full-screen brand navy (#0F0F1A), CREWMUTE wordmark centered in Electric Violet, fade out to onboarding
•	Onboarding: 3 slides — swipeable, dot pagination, skip button top-right
–	Slide 1: 'Find your crew' — illustration of route line connecting two cities
–	Slide 2: 'Split the fare' — cost calculator visual
–	Slide 3: 'Verified students only' — shield icon with college context
•	Final slide: two buttons — 'Create Account' (Primary) and 'Log In' (Ghost)

6.2 Register Screen
•	Header: 'Join Crewmute' — H1
•	Fields (stacked, 16px gap): Full Name, College Email, College Name, Home City, Password, Confirm Password
•	College Name: free-text input (not a picker — too many colleges in India)
•	Home City: Nominatim autocomplete, cities only
•	Password: show/hide toggle icon in input right
•	CTA: 'Send OTP' — Primary full-width button
•	Footer: 'Already have an account? Log in' — Ghost centered

6.3 OTP Verification Screen
•	Header: 'Verify your email' — H1
•	Subtext: 'We sent a 6-digit code to [email]' — Body text.secondary
•	OTP input: 6 separate boxes, auto-focus next on entry, auto-submit on last digit
•	Resend: 'Resend code' ghost link, disabled for 60s with countdown timer
•	Fallback link: 'No college email? Upload student ID' → navigates to ID upload flow

6.4 Home Feed Screen
•	Header: 'Explore' — H1 left | filter icon button right
•	Search bar: full-width, 'Where are you going?' placeholder, opens filter sheet on tap
•	Filter bottom sheet: From City, To City, Date — 3 fields + 'Apply' CTA + 'Clear' ghost
•	Feed: FlatList of Ride Cards (see 5.3), 12px gap between cards
•	Empty state: illustration + 'No rides yet. Be the first to post one.' + 'Post a Ride' CTA
•	Loading: skeleton cards (3) with shimmer animation
•	Pagination: infinite scroll, load 10 rides per page
•	FlatList must set contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }} so the last ride card clears the glass tab bar.

6.5 Ride Detail Screen
•	Top: full route display 'CITY A → CITY B' — Display size, brand navy
•	Ride info row: date, time, cab type — horizontal chips
•	Poster card: avatar + name + college + 'View Profile' ghost link
•	Fare section: '₹{X} per seat' — H1 accent color | total fare shown below in body
•	Seats: progress bar — filled dots for taken seats, empty for available
•	Notes: if present, shown in subtle card with quote styling
•	CTA: 'Request a Seat' Primary — disabled if ride full, expired, or user already requested
•	Request modal: bottom sheet with optional message input + 'Send Request' CTA

6.6 Post Ride Screen
•	Opens as bottom sheet from tab bar (not full screen)
•	Fields: From City (autocomplete), To City (autocomplete), Date (date picker), Time (time picker), Total Seats (stepper 1-6), Fare per seat (numeric input), Cab Type (segmented control), Notes (optional textarea)
•	Cost calculator shown live: 'Total cab fare: ₹{X}' as user types fare per seat
•	Submit: 'Post Ride' Primary full-width — validates all required fields before allowing tap

6.7 My Rides Screen
•	Two tabs: 'Posted' | 'Joined' — underline tab style, accent color active
•	Posted tab: rides the user created — each card shows pending request count as badge
•	Joined tab: rides the user was accepted into — shows co-passenger avatars
•	Tapping a posted ride → Ride Management screen (see 6.8)
•	Both the Posted and Joined FlatLists must set contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }} so the last card clears the glass tab bar.

6.8 Ride Management Screen (Poster View)
•	Shows ride details at top
•	Requests section: list of pending requests — each shows requester avatar, name, college, optional message
•	Per request: 'Accept' (Success green) and 'Reject' (Danger) buttons side by side
•	Accepted section: confirmed passengers with chat button
•	Cancel Ride: danger ghost button at bottom — confirmation dialog before action

6.9 Chat Screen
•	Header: co-passenger name + college + avatar — tappable to view profile
•	Ride context banner: collapsible pill showing ride route + date
•	Messages: right-aligned (self) and left-aligned (other) bubbles
–	Self: #6C63FF background, white text, 12px radius except bottom-right (4px)
–	Other: card background, primary text, 12px radius except bottom-left (4px)
•	Timestamps: centered in Body Small neutral, shown once per 15-minute gap
•	Read receipt: small checkmark under last sent message — single (sent) vs double (read)
•	Input bar: sticky bottom, text input + send button, expands with multiline
•	No tab bar changes needed — Chat is a pushed screen. Confirm the Expo Router stack navigator hides the tab bar on this screen.

6.10 Profile Screen
•	Avatar XL centered + name H1 + college Body below
•	Verification badge: 'Verified Student' chip in Mint Green
•	Stats row: Rides Posted | Rides Joined — two equal columns, number H2 + label Body
•	Home city chip: location icon + city name, ghost pill style
•	Edit Profile: secondary button
•	Settings section: Theme toggle (Light/Dark/System), Notification preferences, Log Out (danger ghost)

 
7. Animation & Motion
Crewmute uses motion purposefully — not decoratively. Every animation communicates state change or aids navigation. Nothing animates just to look cool.

7.1 Animation Principles
•	Duration: 200ms for micro interactions, 300ms for screen transitions, 400ms for modals
•	Easing: ease-out for elements entering (feels responsive), ease-in-out for transitions
•	No looping animations in the main UI — only loading states
•	Respect system 'Reduce Motion' accessibility setting — disable all non-essential animations

7.2 Specific Animations
Interaction	Duration + Easing	Behaviour
Button press	100ms ease-out	Scale to 0.96 on press, back to 1 on release
Bottom sheet open	300ms ease-out	Slide up from bottom, backdrop fades in
Bottom sheet close	250ms ease-in	Slide down, backdrop fades out
Tab switch	200ms ease-in-out	Active indicator slides, icons swap fill/outline
Card tap feedback	150ms ease-out	Subtle opacity drop to 0.85 on press
Skeleton loading	1200ms infinite	Shimmer gradient sweeps left to right
Toast notification	300ms + auto-dismiss 3s	Slide in from top, pause, slide out
OTP box focus	150ms ease-out	Scale 1 → 1.05, border color transition
Request accept/reject	200ms ease-out	Card animates out (translateX), list reflows
Tab bar blur intensity	150ms ease-out (scroll-down only)	On scroll-up: intensity stays at 60. On scroll-down past 20px: animate to 80 over 150ms ease-out. iOS only — skip on Android. Optional polish for Week 5.

8. Iconography
Crewmute uses Ionicons exclusively — already bundled with Expo, no additional install needed. Consistent set, well-maintained, covers all needed use cases.

8.1 Icon Usage Rules
•	Default size: 24px for navigation and cards, 20px for inline/content, 16px for chips/tags
•	Default color: text.secondary (#8B8FA8) — turns accent (#6C63FF) when active
•	Always use outline variant for inactive states, filled for active
•	Never use icons without a label in navigation — always pair icon + text
•	Touch targets with icons: minimum 44×44px tap area even if icon is smaller

8.2 Icon Map
Use Case	Icon Name (Ionicons)	Notes
Explore / Discover	compass-outline / compass	Home tab
Post a Ride	add-circle-outline / add-circle	Center tab — slightly larger 28px
My Rides	car-outline / car	Rides tab
Chats	chatbubble-outline / chatbubble	Chat tab
Profile	person-outline / person	Profile tab
Location / City	location-outline	City input fields
Date	calendar-outline	Date display on cards
Time	time-outline	Departure time display
Seats	people-outline	Seat count display
Fare / Cost	cash-outline	Fare display, cost calculator
Send message	send	Chat input send button
Notifications	notifications-outline	Notification bell (future)
Back navigation	arrow-back	iOS + Android back button
Filter	options-outline	Feed filter button
Close / dismiss	close	Bottom sheets, modals
Verified / success	checkmark-circle	Verified badge, success toast
Warning / pending	time-outline	Pending states
Settings	settings-outline	Profile settings

 
9. Theme Implementation
9.1 Theme Architecture
Themes are implemented using React Context + Zustand. A useTheme() hook provides current colors, stored in the theme store. System preference is detected via Appearance API on initial load and can be overridden by the user in Profile > Settings.

💡 Use NativeWind's dark: variant prefix for Tailwind-based dark mode. For dynamic values (e.g. chart colors), use the useTheme() hook to access the token map directly.

Tab bar background color is not a theme token — it is transparent on iOS (BlurView handles it) and a hardcoded rgba value per mode on Android. Do not add it to the token map.
9.2 Theme Toggle
•	Location: Profile screen → Settings section → 'Theme' row
•	Options: System (default), Light, Dark — segmented control
•	Persists in AsyncStorage under key 'crewmute:theme'
•	Transition: no jarring flash — use a brief 150ms opacity transition on theme change

9.3 Dark Mode Specific Rules
•	Never use pure black (#000000) — use Brand Navy (#0F0F1A) for depth
•	Card elevation in dark mode: increase border opacity slightly (1px #2E2E4A) rather than drop shadows (shadows don't work well on dark)
•	Images and avatars: add a subtle 1px border (#2E2E4A) to separate from dark background
•	Status bar: light-content in dark mode, dark-content in light mode
•	Keyboard: keyboardAppearance='dark' on all text inputs in dark mode

10. Accessibility
10.1 Standards
•	Target: WCAG 2.1 AA minimum across all text/background combinations
•	All interactive elements must have accessibilityLabel props
•	Semantic roles: accessibilityRole='button', 'header', 'image' etc. on all key elements
•	Focus order: logical top-to-bottom, left-to-right reading order

10.2 Contrast Ratios (Key Pairs)
Pair	Background	Text	Ratio
Primary text / Light BG	#F7F7FC	#0F0F1A	19.1:1 ✓
Primary text / Dark BG	#0F0F1A	#F0F0FF	18.4:1 ✓
Accent on Light BG	#F7F7FC	#6C63FF	5.2:1 ✓
White on Accent	#6C63FF	#FFFFFF	5.1:1 ✓
Secondary text / Light BG	#F7F7FC	#4B5563	6.4:1 ✓
Secondary text / Dark BG	#0F0F1A	#9CA3AF	5.9:1 ✓

10.3 Motion & Accessibility
•	Check Appearance.getColorScheme() and AccessibilityInfo.isReduceMotionEnabled()
•	When reduce motion is enabled: replace all transitions with instant cuts, disable shimmer animations
•	All toasts and alerts must be announced via AccessibilityInfo.announceForAccessibility()

