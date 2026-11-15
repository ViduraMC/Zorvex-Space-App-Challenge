# Deploy

Two free pieces, both from the Space Apps Global Offers:

| Piece | Where | Offer |
|---|---|---|
| The website (static files) | Firebase Hosting (`zorvex-space-apps.web.app`), domain `zorvex.earth` | Google Cloud (Firebase Hosting is free); GoDaddy Registry: free domain |
| "Talk to the machine" AI answers | Google Cloud Run (`server/ask`), Gemini model | Google Cloud: free credit, no auto-charge |

The site works without the AI server: the chat then gives free offline answers from the facts.

## 1. Website (automatic)

Every push to `main` runs `.github/workflows/deploy.yml`: lint, type check, tests, fact check,
build, then it publishes `dist/` to **Firebase Hosting** in the Google Cloud project
`zorvex-space-apps` (free). Live at <https://zorvex-space-apps.web.app>.

The deploy signs in as the service account `github-deploy@zorvex-space-apps.iam.gserviceaccount.com`
(role: Firebase Hosting Admin only); its key is the GitHub secret `FIREBASE_SERVICE_ACCOUNT`.

Why not Porkbun Static Hosting: it is a 15-day trial, then a paid plan (no paid tiers for this project).

`zorvex.earth` points at Firebase through DNS records at Porkbun (Firebase console → Hosting →
Add custom domain gives the records; Porkbun → Domain Management → `zorvex.earth` → DNS).

## 2. AI answers (Google Cloud)

1. Claim the Google Cloud offer and start the free trial on a **new project** (for example
   `zorvex-space-apps`). The card check does not charge; there is no auto-charge after the credit.
2. Create a Gemini API key in that project (Google AI Studio → Get API key → choose the project).
3. Deploy (from the repository root):

   ```sh
   npm run ask:facts
   gcloud config set project zorvex-space-apps
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
   printf '%s' 'PASTE_THE_KEY' | gcloud secrets create gemini-key --data-file=-
   gcloud secrets add-iam-policy-binding gemini-key --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor
   gcloud run deploy zorvex-ask --source server/ask --region asia-south1 --allow-unauthenticated \
     --set-secrets GEMINI_API_KEY=gemini-key:latest --max-instances 2 \
     --set-env-vars GEMINI_MODEL=gemini-3.5-flash-lite
   ```

4. Copy the service URL, add `/ask`, and save it in GitHub → Settings → Secrets and variables →
   Actions → **Variables** → `ASK_URL`. Re-run the "Deploy site" workflow.

Limits built into the server: 30 questions per visitor per hour, 3,000 per day, answers only
from `server/ask/facts.json` (re-run `npm run ask:facts` and redeploy when facts change).
