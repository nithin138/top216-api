# Top216 Backend Starter


## Quick start


1. Copy files to a new repo.
2. `cp .env.example .env` and edit `MONGODB_URI`.
3. `npm install`
4. `npm run dev`


## Endpoints


- `POST /api/submissions` { title, description, author, category }
- Creates submission, auto-assigns `assignedCategory`, enforces 20-cap and sets `miniFinal` when full.
- `GET /api/submissions` optional query `?assignedCategory=A&miniFinal=true`
- `GET /api/submissions/:id`
- `POST /api/submissions/category/:category/pick-winners` picks 1 winner + 4 runners-up (placeholder)


## Notes & next steps


- Replace `utils/autoSort.js` with ML/judge API logic.
- Add authentication and rate-limiting.
- Add tests and CI, and a staging deploy (Vercel/Heroku/DigitalOcean).
- Add pagination for listing endpoints.