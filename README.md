# Iovine Brothers — Email Signup & Referral Tracking

Live at [signup.iovine.com](https://signup.iovine.com) — feel free to sign up for the newsletter if you want.

---

## What this is

A custom email signup form built for [Iovine Brothers Produce](https://iovine.com) in Philadelphia. The owner wanted a way to grow their Mailchimp list, but also wanted to know *who* was driving signups — whether it was a team member handing out a QR code or a link on the website.

So each referral source gets its own URL with a `?ref=` parameter. Same form, different URLs. When someone submits, that ref value gets stored in Mailchimp alongside their contact info. There's also a small internal dashboard that pulls from the Mailchimp API and shows a leaderboard of who's brought in the most signups over a given period.

---

## Stack

- **Frontend** — Plain HTML/CSS/JS, no framework. Hosted on Netlify at a custom subdomain.
- **Serverless function** — Netlify function acting as a proxy to the Mailchimp API (gets around CORS, keeps the API key off the browser)
- **Analytics dashboard** — Google Apps Script web app, pulls directly from Mailchimp via `UrlFetchApp`
- **DNS** — Network Solutions, pointed to Netlify via CNAME

---

## How the referral tracking works

Each source gets its own URL:

```
https://signup.iovine.com/?ref=alice
https://signup.iovine.com/?ref=bob
https://signup.iovine.com/?ref=website
```

On load, the form reads the `ref` param from the URL and drops it into a hidden input. On submit, the Netlify function sends it to Mailchimp as a custom merge field (`REF`). From there you can filter and segment in Mailchimp, or just look at the dashboard.

---

## Dashboard

A lightweight Google Apps Script web app that hits the Mailchimp API and shows:

- Total signups for the selected period
- Top referrer
- Leaderboard with all ref sources ranked
- Daily signup trend chart

Filterable by week, month, year, or all time. Deployed as a private GAS web app — no hosting cost, scales to zero.

> **Planned:** Rewrite in Python/Flask or Node/Express, containerize with Docker, and deploy to Google Cloud Run.

---

## Project structure

```
signup-form/
├── index.html                          # The form
├── assets/
│   ├── IBP_Header_-_Google_Forms.png   # Banner
│   ├── IO_Logo-Circle_B-4C-01-01.png   # Success screen logo
│   └── IO_Logo-Icons_Full-C-01.png     # Favicon
└── netlify/
    └── functions/
        └── subscribe.js                # Mailchimp proxy

gas-dashboard/
├── Code.gs                             # Backend — Mailchimp API calls
└── Index.html                          # Frontend — dashboard UI
```

---

## Setup

### Netlify function

Add these as environment variables in your Netlify site settings:

| Variable | Value |
|---|---|
| `MAILCHIMP_API_KEY` | Your API key |
| `MAILCHIMP_SERVER` | The prefix in your Mailchimp URL (e.g. `us21`) |
| `MAILCHIMP_AUDIENCE` | Your audience/list ID |

### Mailchimp merge fields

You'll need two custom merge fields in your Mailchimp audience:

- `REF` — stores the referral source
- `PHONE` — optional phone number field

### GAS dashboard

Paste your credentials into the top of `Code.gs`, then deploy as a Web App (Execute as: Me, Access: Only myself).

---

## Background

I spent about ten years in restaurants — bartending, cooking, managing. Left the industry three years ago to get into tech. I'm currently working in produce wholesale, managing warehouse operations while building tools to modernize the place. Most of what I build is solving real problems my workplace actually has, which is a pretty good way to learn.

This project came out of a real ask — the business needed a better way to grow their email list and track where signups were coming from. Figured it was also worth doing it right and putting it in the portfolio.

---

## Contributing

Not really open for contributions but if you want to see what it looks like from the user side, [go sign up](https://signup.iovine.com). It's a real newsletter.