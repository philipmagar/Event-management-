# Eventify - The "Almost There" Group Project

*A look under the hood of what happens when ambitious ideas meet deadlines.*

---

This repository houses the code for **Eventify**, a premium event management platform. To be completely honest, this started as a group project with grand ambitions. We weren't just going to build *another* CRUD app; we were going to build the *ultimate* event experience.

Did we finish everything we dreamed of? No.  
Is it a solid, secure, and modern codebase? Absolutely.

## The Story Behind the Code

We started this with a simple rule: **No boring designs.** We wanted it to feel premium—glassmorphism, meshes, dark mode by default. We spent arguably too much time debating the exact shade of the background blur (`bg-white/10` vs `bg-surface/50`), but I stand by that decision. The aesthetics matter.

### Trade-offs & Lessons Learned
Developing in a group taught us that "merge conflict" is the scariest phrase in the English language.

- **Security wasn't an afterthought:** We made a conscious choice to adopt a "zero-trust" mindset early on. It was annoying implementing `express-rate-limit` and specific `helmet` headers when we just wanted to see if the API worked, but it means the backend is actually robust. We didn't want to build a toy.
- **The "Real-time" struggle:** We wanted live seat booking updates. We have the skeleton for it, but if I'm being real, it's reliable 90% of the time. Concurrency is hard.
- **Authentication:** We rolled our own JWT auth. In hindsight, maybe Clerk or Auth0 would have saved us time, but building it from scratch forced us to actually understand stateless sessions.

## What Actually Works?

Despite the chaos, the core is solid:
- **Responsive Design**: It actually looks good on mobile now (finally fixed that navbar).
- **Security**: Inputs are sanitized. If you try to XSS this, you'll probably fail. (Please don't try too hard).
- **Role-Based Access**: Admins have their own playground. Regular users can't touch what they shouldn't.

## Tech Stack Decisions

- **Frontend**: **React + Tailwind** (because we value our sanity and component-scoped styles are a lifesaver).
- **Backend**: **Node/Express**. It's flexible, and we all knew JavaScript.
- **Database**: **MongoDB**. We needed flexible schemas for different event types.

---

## Running This Locally

If you want to spin this up and maybe finish what we started:

### 1. The Backend
```bash
cd backend
npm install
# You'll need a .env file. Ask me for the keys, or just use your own Mongo URI.
# Don't forget JWT_SECRET, or nothing works.
npm run dev
```

### 2. The Frontend
```bash
cd frontend
npm install
npm run dev
# It runs on localhost:5173. 
```

## Future Roadmap (If we ever get back to it)
- [ ] Stripe Payment Integration (Cut due to time constraints)
- [ ] Email notifications that actually look good
- [ ] More robust "Admin" analytics

---

---
*If you're browsing this code, don't judge the inconsistent commit messages.
