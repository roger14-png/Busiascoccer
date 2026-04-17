# Fix Signup Not Showing on Vercel Live (https://busiasoccer.vercel.app/)

## Current Status
- [x] Diagnosed: Web Vite app, server/ backend local-only, /api fails on Vercel static deploy
- [x] Login.tsx has signup toggle (no separate page)
- [x] Server running local :4000 (EADDRINUSE confirms)
- [ ] Live: auth fails silently → appears \"not showing\"

## Implementation Steps
- [ ] 1. Update App.tsx: Add ?mode=register URL param + Vercel prod fallback auth
- [ ] 2. Configure vercel.json for serverless backend (/api → server/index.js)
- [ ] 3. Deploy: `npx vercel --prod`
- [ ] 4. Test: https://busiasoccer.vercel.app/?mode=register → toggle shows signup, works w/o server
- [ ] 5. Optional: BusiaSoccerMobile RN (separate Expo deploy)

**Next:** Edit App.tsx → Approve to proceed?

