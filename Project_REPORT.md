1. Project Overview

* What problem it solves
  This project solves remote technical interview friction. It combines coding challenge solving, live code editing, video call, and chat in one place so interviewer and candidate do not switch between multiple tools.

* Who uses it
  Primary users are interviewers, candidates, coding mentors, and pair-programming partners.

* Real-world use case
  A startup wants to interview backend engineers remotely. Interviewer creates a session, candidate joins, both discuss over video, candidate writes code, code is judged against hidden test cases, and interview history is stored.

2. Architecture Breakdown

* Frontend, Backend, Database flow
  Frontend (React + Vite): UI, auth state, routing, editor, output panels, and Stream SDK integration.
  Backend (Express): auth-protected APIs, session lifecycle, problem APIs, code execution bridge, Stream token generation, webhook processing.
  Database (MongoDB + Mongoose): stores users and interview sessions.
  Third-party systems: Clerk (auth), Stream (video/chat), Glot (remote code execution), Inngest (event-driven user sync).

* How data moves step-by-step
  1. User signs in via Clerk on frontend.
  2. Frontend gets Clerk JWT and attaches it in Authorization header for API calls.
  3. Backend middleware validates JWT with Clerk and maps Clerk user to internal MongoDB user record.
  4. For session creation, frontend sends problem + difficulty, backend creates DB session, creates Stream video call, creates Stream chat channel.
  5. For join flow, participant hits join API, backend checks rules (not host, not full, active session), updates DB, adds participant to Stream chat.
  6. For coding judge flow, frontend sends language + code + problemId to backend execute endpoint.
  7. Backend appends hidden test runner to user code, sends code to Glot API, parses CASE_x:PASS/FAIL lines, returns structured results.
  8. Frontend renders pass/fail cards and console logs.
  9. On session end, backend marks session completed and deletes Stream call/channel.

* APIs used
  Internal APIs:
  GET /api/problems
  GET /api/problems/:id
  POST /api/execute
  GET /api/sessions/active
  POST /api/sessions
  GET /api/sessions/my-recent
  GET /api/sessions/:id
  POST /api/sessions/:id/join
  POST /api/sessions/:id/end
  GET /api/chat/token
  POST /api/webhooks/clerk

  External APIs/services:
  Clerk: authentication middleware and user identity.
  Stream: video call and chat channels.
  Glot API: remote language runtime execution.
  Inngest: event-driven async functions for user sync.

3. Tech Stack Explanation

For each technology used:

* React
  Why it is used: Component-based UI, fast development, routing integration.
  Alternatives: Vue, Angular, Svelte.
  Why this is better here: Team likely using JS ecosystem; React has strong Clerk/Stream SDK support.

* Vite
  Why it is used: Fast local dev server and modern build pipeline.
  Alternatives: CRA, Webpack manual setup, Parcel.
  Why this is better here: Faster HMR and simpler config than older React setups.

* TailwindCSS + DaisyUI
  Why it is used: Rapid UI styling with utility classes and ready components.
  Alternatives: Material UI, Chakra UI, plain CSS modules.
  Why this is better here: Quick iteration for hackathon/MVP speed.

* Clerk
  Why it is used: Handles login, session tokens, auth UI quickly.
  Alternatives: Auth0, Firebase Auth, custom JWT auth.
  Why this is better here: Fastest production-ready auth with low backend auth code.

* Express.js
  Why it is used: Lightweight REST API server with middleware ecosystem.
  Alternatives: Fastify, NestJS, Koa.
  Why this is better here: Simplicity and low learning curve for MVP.

* MongoDB + Mongoose
  Why it is used: Flexible schema for user/session documents.
  Alternatives: PostgreSQL + Prisma, MySQL, DynamoDB.
  Why this is better here: Session model is document-friendly and easy to evolve quickly.

* Stream (video/chat)
  Why it is used: Managed infra for realtime video and chat.
  Alternatives: Twilio Video, Agora, Daily, custom WebRTC.
  Why this is better here: Avoids heavy complexity of building scalable WebRTC backend.

* React Query
  Why it is used: Server-state caching, loading/error handling, mutation lifecycle.
  Alternatives: SWR, Redux Toolkit Query, manual state.
  Why this is better here: Clean API call lifecycle for dashboard/session pages.

* Monaco Editor
  Why it is used: Real code-editor experience in browser.
  Alternatives: CodeMirror, Ace.
  Why this is better here: Better language tooling feel and interview UX.

* Inngest
  Why it is used: Event-driven background processing for user create/delete sync.
  Alternatives: BullMQ, RabbitMQ workers, serverless cron/webhooks.
  Why this is better here: Very low operational overhead for async flows.

* Glot API
  Why it is used: Executes user code safely outside core app infra.
  Alternatives: Judge0, Piston self-hosted, custom Docker sandbox.
  Why this is better here: Quick integration for MVP without building sandboxing infra.

4. Code Flow (VERY IMPORTANT)

* Step-by-step execution (like tracing)

  Flow A: User opens site and signs in
  1. Browser loads React app.
  2. ClerkProvider initializes auth context.
  3. App checks isLoaded and isSignedIn.
  4. If signed out, shows landing page.
  5. After sign-in, App sets Axios interceptor to inject Bearer token from Clerk.
  6. Protected routes become accessible (dashboard, problems, sessions).

  Flow B: User creates an interview session
  1. User opens dashboard.
  2. Dashboard triggers active/recent session queries.
  3. User opens create session modal.
  4. Modal fetches problem list from backend.
  5. User chooses problem and clicks create.
  6. Frontend calls POST /api/sessions with problem config.
  7. Backend protect middleware validates user.
  8. Backend creates MongoDB Session document.
  9. Backend creates Stream video call and Stream chat channel.
  10. Backend returns session payload.
  11. Frontend navigates to /session/:id.

  Flow C: Participant joins and runs code
  1. Participant opens session URL.
  2. Frontend fetches session details.
  3. If user is not host/participant, frontend auto-calls join endpoint.
  4. Backend validates constraints and assigns participant.
  5. Frontend initializes Stream video client + chat client using /api/chat/token.
  6. Candidate writes code in Monaco editor.
  7. Click Run triggers executeCode(language, code, problemId).
  8. Backend appends hidden test runner to candidate code and sends to Glot.
  9. Glot returns stdout/stderr.
  10. Backend parses CASE lines and returns structured test results.
  11. Frontend renders test pass/fail and console output.

  Flow D: Session ends
  1. Host clicks End Session.
  2. Backend confirms host authority.
  3. Backend deletes Stream call and chat channel.
  4. Backend marks session status completed in DB.
  5. Clients detect completed state and redirect to dashboard.

* What happens when user opens site → performs action → gets result
  Open site: app bootstraps auth and routing.
  Perform action: action calls backend via Axios/fetch.
  Backend validates auth and business rules.
  Backend coordinates DB and third-party services.
  Response comes back as JSON.
  UI updates with loading-success-error feedback.

5. Important Concepts

* Core CS concepts involved (DB, API, auth, caching, etc.)

  Authentication and Authorization:
  Clerk handles identity; backend middleware enforces protected routes.
  Example: only authenticated user can create/join/end session.

  REST API Design:
  Resource-oriented endpoints for sessions/problems/chat token.
  Example: POST /sessions/:id/end models state transition.

  Document Data Modeling:
  Session stores host, participant, status, and callId.
  Example: participant is nullable until someone joins.

  Realtime Systems Integration:
  Stream handles low-latency video/chat.
  Example: same callId binds video room and chat channel.

  Async External Execution:
  Code runs on external service, not on app server process.
  Example: backend sends wrapped code to Glot and parses output.

  Hidden Test Evaluation Pattern:
  Test runner is appended server-side to prevent easy cheating.
  Example: candidate sees problem but not exact validation code.

  Caching and Server State:
  React Query caches active/recent sessions and refreshes.
  Example: session detail polling every 5 seconds detects completion.

  Event-Driven Architecture:
  Webhook + Inngest decouples auth events from user DB sync.
  Example: user.created event creates Mongo user + Stream user.

  Access Control Rules:
  Business constraints prevent invalid transitions.
  Example: host cannot join as participant; full session blocks joins.

  Error Handling Contract:
  APIs return status + message; UI shows toast feedback.
  Example: join full session returns 409 and frontend shows failure toast.

6. Viva Questions (STRICT MODE)

Generate:

* 15 basic questions

1. What is the main purpose of this project?
Answer: To conduct remote coding interviews with video, chat, and code execution in one platform.

2. Which framework is used for frontend?
Answer: React with Vite.

3. Which framework is used for backend?
Answer: Express.js.

4. Which database is used?
Answer: MongoDB with Mongoose.

5. How is user authentication handled?
Answer: Clerk handles sign-in and backend token verification.

6. What is stored in the Session model?
Answer: problem, difficulty, host, participant, status, and callId.

7. How does code execution happen?
Answer: Backend sends wrapped user code to Glot API and parses result.

8. Why do we need a callId?
Answer: It uniquely links Stream video call and chat channel to one session.

9. What is React Query used for?
Answer: Fetching, caching, and managing server state.

10. What is Monaco Editor used for?
Answer: Browser-based coding editor with syntax support.

11. Which endpoint returns all problems?
Answer: GET /api/problems.

12. Which endpoint creates a session?
Answer: POST /api/sessions.

13. What does protectRoute middleware do?
Answer: It ensures request has valid Clerk auth and mapped DB user.

14. What happens when host ends session?
Answer: Stream call/chat are deleted and session status becomes completed.

15. Why are hidden tests useful?
Answer: They reduce cheating and validate real correctness.

* 15 intermediate questions

1. Why is Clerk ID stored in User model?
Answer: It connects external auth identity to internal DB records and Stream user identity.

2. Why use Stream instead of custom WebRTC implementation?
Answer: Faster delivery, less infra complexity, and better reliability at scale.

3. Explain session join validation logic.
Answer: API checks session exists, is active, user is not host, and slot is available.

4. How is secure code judging partially enforced?
Answer: Test runner logic is kept server-side and not sent in problem details API.

5. Why is server-state library needed here?
Answer: Multiple async views (dashboard/session) need automatic loading/error/refetch behavior.

6. What is the role of Inngest in this project?
Answer: It processes user-created/deleted events and syncs user data asynchronously.

7. Why is CORS configured?
Answer: To restrict browser API calls to allowed frontend origins.

8. What is the risk of hardcoded localhost API URLs in frontend?
Answer: Production breakage and inconsistent environments.

9. Why does backend generate Stream token instead of frontend?
Answer: Token generation uses server secret and must never happen on client.

10. Why do we parse stdout with CASE_ markers?
Answer: It converts raw execution logs into deterministic pass/fail test objects.

11. What is the tradeoff of polling session data every 5 seconds?
Answer: Simpler implementation, but more network load than websocket state sync.

12. Why use ObjectId references in Session model?
Answer: It enables relational lookup via populate for host and participant data.

13. What is the difference between authentication and authorization here?
Answer: Authentication proves identity; authorization checks role/rules like host-only end session.

14. How does frontend know user is in current session?
Answer: It compares current Clerk user ID with host.clerkId or participant.clerkId.

15. Why can this architecture become expensive at scale?
Answer: Third-party video/chat/execution APIs and polling can increase per-session cost.

* 10 advanced questions

1. Identify a critical backend bug in execute endpoint.
Answer: After sending response, route still calls another res.status(201).json, causing double-response/header errors.

2. Identify a critical integration bug in Inngest delete flow.
Answer: deleteStreamUser is called but not imported, causing runtime failure on user.deleted event.

3. Where is a data contract mismatch causing empty dashboard lists?
Answer: Frontend expects sessions field, but backend returns data field for active/recent APIs.

4. Why can SessionPage fail to load problem details?
Answer: It expects session.problemId, but session schema stores problem string only; problemId is not persisted.

5. What auth-data mapping bug exists in chat token response?
Answer: Backend returns userImage from req.user.image, but schema uses profileImage.

6. What is the architectural risk of mixed HTTP clients and URL styles?
Answer: Axios instance uses env base URL, but several pages hardcode localhost with raw axios/fetch, creating environment drift.

7. What consistency issue exists in difficulty handling?
Answer: Backend enum expects lowercase easy/medium/hard while problem source often uses title-case Easy/Medium/Hard; requires normalization everywhere.

8. What security gap exists in webhook handling?
Answer: Webhook endpoint does not verify Clerk signature, so spoofed events are possible.

9. What scalability issue exists in session state updates?
Answer: Polling every 5 seconds scales poorly; should use websocket/event push for state transitions.

10. What reliability concern exists with external judge dependency?
Answer: Single external execution provider can become bottleneck/failure point; needs retries, fallback, queueing, and circuit breaker.

For each question:

* Give a PERFECT answer (short + to the point)
  Provided above.

7. Weakness & Improvements

* What is poorly designed
  1. API response contracts are inconsistent (data vs sessions keys).
  2. Frontend mixes env-based API client and hardcoded localhost URLs.
  3. Session domain model is inconsistent (problem title stored, but some flows require problemId).
  4. execute endpoint has double-response bug.
  5. Inngest delete flow has missing import bug.
  6. Webhook endpoint lacks signature verification.
  7. Output contract mismatch between pages/components exists (some places pass object, some expect split props).
  8. No clear central error schema across APIs.

* What would a senior engineer change
  1. Introduce shared API contracts (OpenAPI or Zod schema) and enforce in frontend/backend.
  2. Store both problemId and problemTitle in session model; use immutable problem snapshot for interview reproducibility.
  3. Replace hardcoded URLs with one API client and environment config.
  4. Fix controller bugs and add integration tests for critical routes.
  5. Add webhook signature verification and idempotency checks.
  6. Replace polling with event-driven realtime updates for session status.
  7. Add structured logging, tracing, retry policies, and dead-letter handling.
  8. Add role-based authorization logic for future interviewer/candidate role separation.

* Scalability issues
  1. Polling session detail every 5s does not scale with high concurrent users.
  2. External judge calls per run can become expensive and rate-limited.
  3. No queue around judge execution means burst traffic can overload API.
  4. Stream and Clerk dependency outages can degrade core flow without graceful fallbacks.
  5. Session writes and joins can have race conditions without transactional/locking strategy.

8. Resume Explanation

* How to explain this project in 30 seconds
  I built a remote interview platform where two users can join a coding room, talk over live video, chat, and run code against hidden test cases. I used React, Express, MongoDB, Clerk auth, and Stream video/chat. The backend manages session lifecycle, secure token-based access, and code execution via an external judge API.

* How to explain in 2 minutes
  This project solves remote interview workflow fragmentation by combining coding, communication, and evaluation in one system. On the frontend, I used React with React Query for server state, Clerk for auth UI, and Monaco for coding experience. On the backend, Express APIs manage sessions and enforce business rules like host-only session ending and one participant per room. Data is stored in MongoDB using Mongoose models for users and sessions.

  For realtime collaboration, I integrated Stream Video and Stream Chat so each session has a shared call and channel linked by callId. For code judging, the frontend sends code and language to a backend execution endpoint. The backend appends hidden tests, executes through Glot API, parses structured pass/fail outputs, and returns result objects for UI rendering.

  I also integrated Clerk webhooks with Inngest to asynchronously sync user creation/deletion into MongoDB and Stream. The main engineering challenges were consistency across API contracts, auth-to-user mapping, and robustness of external service dependencies. If I were production-hardening this further, I would add schema-driven contracts, signature verification, queue-based execution, and event-driven session updates.

9. File Output

This complete report is generated in this file.
