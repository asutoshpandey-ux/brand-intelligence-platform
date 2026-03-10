# Brand Intelligence Platform 🧬

A powerful, AI-driven platform that instantly extracts the "Brand DNA" of any website. Just provide a URL, and the platform crawls the site to uncover its color palette, typography, logo variations, and uses Google's Gemini AI to analyze the brand's voice and tone.

## 🚀 Features

*   **🎨 Color Extraction**: Analyzes CSS to find primary, secondary, and accent colors, providing Hex codes and click-to-copy swatches.
*   **🔤 Typography Discovery**: Identifies custom fonts and Google Fonts used across the site.
*   **🖼️ Logo Detection**: Intelligently locates logos via OpenGraph tags, image analysis, and favicons.
*   **🧠 AI Brand Voice Analysis**: Uses the Gemini API to analyze website copy, meta descriptions, and CTAs to determine the brand's personality, tone, and target audience.
*   **🔐 Role-Based Access Control**: Features a tier system (Admin, Pro, Free, Guest). Free users use credits to crawl, while Admins have unlimited access and user management capabilities.
*   **💾 Cloud Sync**: All analyses are saved securely to your profile using Firebase Firestore.

## 🛠️ Technology Stack

*   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
*   **Backend / API**: Next.js Route Handlers
*   **Web Scraping**: Cheerio (Server-side HTML/CSS parsing)
*   **AI Engine**: Google Gemini API (`@google/generative-ai`)
*   **Authentication & Database**: Firebase (Auth, Firestore)
*   **Hosting**: Designed for Vercel

## 🔄 User Flow

1.  **Sign Up / Login**: Users create an account using email and password via Firebase Auth. New users start with 10 free credits.
2.  **The Input**: On the homepage, the user pastes a target website URL (e.g., `stripe.com`) and clicks "Analyze Brand".
3.  **The Crawl (Backend)**:
    *   The Next.js API route fetches the website's HTML.
    *   Cheerio extracts CSS content, image tags, meta tags, and text content.
    *   Regex patterns identify colors and fonts.
4.  **The AI Analysis (Backend)**:
    *   Extracted text snippets are sent to the Gemini API with a specific prompt to analyze the brand's voice, tone, and target audience.
5.  **Credit Deduction**: 1 credit is deducted from the user's account in Firestore.
6.  **The Result**: The extracted Brand DNA is saved to Firestore under the user's ID, and the user is redirected to the Brand Profile page.
7.  **The Display**: The user views the beautiful, structured Brand DNA profile, where they can copy colors or export the entire profile as JSON.

## ⚙️ Getting Started (Local Development)

1.  Clone the repository:
    ```bash
    git clone https://github.com/asutoshpandey-ux/brand-intelligence-platform.git
    cd brand-intelligence-platform
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables in `.env.local`:
    ```env
    GEMINI_API_KEY=your_gemini_key
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.
