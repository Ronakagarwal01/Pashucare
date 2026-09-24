# 🚀 PashuCare AI — Cloudflare डिप्लॉयमेंट गाइड (Cloudflare Deployment Guide)

यह गाइड आपको **PashuCare AI** को **Cloudflare** पर आसानी से डिप्लॉय करने की पूरी प्रक्रिया समझाती है।

---

## आर्किटेक्चर समझें (Understanding Architecture)

- **Frontend (React + Vite)**: **Cloudflare Pages** पर होस्ट होगा (अल्ट्रा-फास्ट ग्लोबल CDN, फ्री SSL, ऑटो-डिप्लॉयमेंट)।
- **SPA Routing**: `public/_redirects` फाइल जोड़ दी गई है ताकि `/dashboard`, `/consultation`, `/animals`, आदि पेज रिफ्रेश करने पर 404 एरर न आए।
- **Backend API Proxy**: `functions/api/[[path]].js` जोड़ दी गई है — यह क्लाउडफ्लेयर एज (Cloudflare Edge) पर चलता है और बिना किसी CORS समस्या के सीधे आपके बैकएंड से जुड़ता है।
- **Backend (FastAPI + Python)**: इसे Render, Railway, Fly.io, VPS, या **Cloudflare Tunnel (`cloudflared`)** के जरिए डिप्लॉय किया जा सकता है।

---

## भाग 1: Frontend को Cloudflare Pages पर डिप्लॉय करना (Frontend Deployment)

### तरीका 1: GitHub / Git के जरिए (सबसे आसान और अनुशंसित • Recommended)

1. अपने प्रोजेक्ट को GitHub पर पुश (Push) करें:
   ```bash
   git add .
   git commit -m "Configure for Cloudflare Pages deployment"
   git push origin main
   ```

2. [Cloudflare Dashboard](https://dash.cloudflare.com/) में लॉगिन करें।
3. बाईं ओर मेनू से **Workers & Pages** पर जाएं > **Create application** > **Pages** टैब चुनें > **Connect to Git** पर क्लिक करें।
4. अपना GitHub रिपॉजिटरी चुनें (`pashucare`)।
5. **Build settings** में निम्नलिखित भरें:
   - **Project name**: `pashucare` (या आपकी पसंद का नाम)
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. **Environment variables (पर्यावरण चर)**:
   - `BACKEND_URL`: आपके बैकएंड सर्वर का URL (उदा. `https://pashucare-api.onrender.com` या Cloudflare Tunnel URL)
   *(वैकल्पिक: यदि आप डायरेक्ट कॉल करना चाहते हैं तो `VITE_API_URL` भी सेट कर सकते हैं)*
7. **Save and Deploy** पर क्लिक करें।
8. 1-2 मिनट में आपकी वेबसाइट `https://pashucare.pages.dev` पर लाइव हो जाएगी!

---

### तरीका 2: Wrangler CLI के जरिए (Direct Terminal Deployment)

यदि आप गिटहब के बिना सीधे अपने कंप्यूटर से डिप्लॉय करना चाहते हैं:

1. `frontend` फोल्डर में जाएं:
   ```bash
   cd frontend
   ```
2. प्रोडक्शन बिल्ड तैयार करें:
   ```bash
   npm run build
   ```
3. Wrangler CLI से डिप्लॉय करें:
   ```bash
   npx wrangler pages deploy dist --project-name=pashucare
   ```
   *(पहली बार चलाने पर यह ब्राउज़र में Cloudflare लॉगिन मांगेगा)*

---

## भाग 2: Backend (FastAPI) को डिप्लॉय करना (Backend Deployment)

FastAPI (Python) को डिप्लॉय करने के लिए 2 सबसे आसान विकल्प हैं:

### विकल्प A: Render / Railway पर 1-क्लिक डिप्लॉय (Free & Easy)

1. [Render.com](https://render.com/) पर जाएं > **New** > **Web Service** चुनें।
2. अपना GitHub रिपॉजिटरी चुनें।
3. सेटिंग्स भरें:
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   - `OPENAI_API_KEY`: आपकी OpenAI API Key (वैकल्पिक, ऑफलाइन ट्रायेज बिना इसके भी काम करता है)
   - `OPENAI_MODEL`: `gpt-4o-mini`
   - `CORS_ORIGINS`: `https://pashucare.pages.dev` (आपके Cloudflare Pages का URL)
5. डिप्लॉय होने के बाद आपको एक URL मिलेगा (जैसे: `https://pashucare-api.onrender.com`)।
6. अब Cloudflare Pages के डैशबोर्ड में जाकर **Settings > Variables and Secrets** में `BACKEND_URL = https://pashucare-api.onrender.com` सेट कर दें।

---

### विकल्प B: Cloudflare Tunnel के जरिए अपने कंप्यूटर या VPS से चलाना

यदि आप अपने लोकल कंप्यूटर या किसी VPS को क्लाउडफ्लेयर के जरिए सुरक्षित तरीके से इंटरनेट पर लाइव करना चाहते हैं:

1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) पर जाएं > **Networks** > **Tunnels**।
2. **Create a Tunnel** पर क्लिक करें और नाम दें (उदा. `pashucare-tunnel`)।
3. दिए गए `cloudflared` कमांड को अपने सर्वर/कंप्यूटर पर रन करें।
4. **Public Hostname** जोड़ें:
   - Subdomain: `api`
   - Domain: `yourdomain.com`
   - Service Type: `HTTP`
   - URL: `localhost:8000`
5. अब आपका बैकएंड `https://api.yourdomain.com` पर सुरक्षित रूप से लाइव हो जाएगा!

---

## प्रोजेक्ट में जोड़े गए Cloudflare अनुकूलन (Files Added)

1. `frontend/public/_redirects`:
   - यह सुनिश्चित करता है कि Cloudflare Pages पर React SPA रूटिंग (Dashboard, Consultation, History आदि) बिना 404 एरर के काम करे।
2. `frontend/public/_headers`:
   - बेहतर सिक्योरिटी और एसेट कैशिंग (Asset Caching) के लिए हेडर।
3. `frontend/functions/api/[[path]].js`:
   - Cloudflare Pages Functions रिवर्स प्रॉक्सी जो `/api/*` रिक्वेस्ट को बिना किसी CORS समस्या के बैकएंड तक पहुंचाती है।
4. `frontend/wrangler.jsonc`:
   - Wrangler CLI डिप्लॉयमेंट कॉन्फ़िगरेशन।
5. `backend/Dockerfile`:
   - किसी भी क्लाउड प्लेटफॉर्म पर बैकएंड को 1-क्लिक में कंटेनराइज़ करके चलाने के लिए।
6. `backend/app/main.py`:
   - CORS सेटिंग्स में `*.pages.dev` और `*.workers.dev` को ऑटोमैटिक अनुमति दी गई है।
