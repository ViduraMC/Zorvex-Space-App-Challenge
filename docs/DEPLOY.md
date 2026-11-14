# Deploy

Two free pieces, both from the Space Apps Global Offers:

| Piece | Where | Offer |
|---|---|---|
| The website (static files) | `zorvex.earth`, Porkbun Static Hosting | GoDaddy Registry: free domain and website hosting |
| "Talk to the machine" AI answers | Google Cloud Run (`server/ask`), Gemini model | Google Cloud: free credit, no auto-charge |

The site works without the AI server: the chat then gives free offline answers from the facts.

## 1. Website (automatic after setup)

Every push to `main` runs `.github/workflows/deploy.yml`: lint, type check, tests, fact check,
build, then it publishes `dist/` to the **`site`** branch (built files at the root).

One-time setup in Porkbun:

1. Porkbun → Domain Management → `zorvex.earth` → **Website** (house icon) → choose **Static Hosting**.
2. On the Static Hosting page, scroll to **GitHub Connect** → **Connect** → authorise GitHub.
3. Repository: `ViduraMC/Zorvex-Space-App-Challenge`, branch: **`site`**.
4. Wait for the SSL certificate, then open <https://zorvex.earth>.

Manual fallback: `npm run build`, zip the contents of `dist/` (not the folder), and use
**Upload Zip File** on the Static Hosting page (limit 40 MB; our build is about 17 MB).

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
   gcloud run deploy zorvex-ask --source server/ask --region asia-south1 --allow-unauthenticated \
     --set-secrets GEMINI_API_KEY=gemini-key:latest --max-instances 2 \
     --set-env-vars GEMINI_MODEL=gemini-3.5-flash-lite
   ```

4. Copy the service URL, add `/ask`, and save it in GitHub → Settings → Secrets and variables →
   Actions → **Variables** → `ASK_URL`. Re-run the "Deploy site" workflow.

Limits built into the server: 30 questions per visitor per hour, 3,000 per day, answers only
from `server/ask/facts.json` (re-run `npm run ask:facts` and redeploy when facts change).
