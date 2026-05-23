# Instagram Sentiment Analysis — Influencer Audience Insights

A real-time web application that analyzes audience sentiment from Instagram post captions using NLP (VADER). Built to help influencers understand their brand health and audience perception.

## Features

- **Connect Instagram** — Securely authenticate with your Instagram account to scan real public profiles.
- **Scan Profile** — Enter any public Instagram handle to fetch their recent posts and get a sentiment breakdown (Positive / Neutral / Negative) with a Brand Health Score.
- **Analyze Post** — Paste any caption to instantly classify its sentiment with detailed polarity scores.
- **Interactive Charts** — Doughnut chart visualization of sentiment distribution using Chart.js.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, Flask-CORS |
| NLP | VADER (vaderSentiment) |
| Scraper | Instaloader |
| Frontend | HTML5, CSS3, JavaScript |
| Charts | Chart.js |

## Setup

```bash
pip install flask flask-cors vaderSentiment instaloader nltk
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

## Project Structure

```
├── app.py                  # Flask backend with API routes
├── sentiment_analyzer.py   # VADER-based NLP preprocessing and scoring
├── instagram_scraper.py    # Real-time Instagram scraper using Instaloader
├── templates/
│   └── index.html          # Main web page
├── static/
│   ├── style.css           # Premium glassmorphic dark theme
│   └── script.js           # Frontend logic and API calls
├── .gitignore
└── README.md
```

## How It Works

1. Authenticate with your Instagram credentials (used locally, never stored).
2. The scraper fetches recent posts from any public profile.
3. Each caption is cleaned (URLs, mentions removed) and scored using NLTK's VADER model.
4. Results are displayed in real-time with interactive charts and sentiment badges.
