---
title: Needle
order: 0
featured: true
cover: /assets/projects/needle/01-dashboard.jpg       # thumbnail on project cards
cover_alt: Needle's dashboard for a sample tender, with the cost estimate, confidence score and summary
tagline: An AI assistant for construction companies that prices a new tender from their own past projects, flags unclear items and checks the quantities against the building plan. Built at the TUM.ai × Bauindustrie hackathon in Munich, 2026.
summary: Pricing a construction tender means comparing a long bill of quantities, the plans and old projects by hand. Needle reads the tender, gives every item a price from the company’s own past projects with its source, and flags what looks wrong. Built at the TUM.ai × Bauindustrie hackathon in Munich.
context: TUM.ai × Bauindustrie hackathon, Munich, Nov 2026
tech: [Python, FastAPI, Claude, Voyage AI, OpenAI vision, JavaScript]
repo: https://github.com/madhavgupta340/bauindustrie_hack
live: https://bauindustriehack-lv-mastermind-v2.vercel.app/
live_note: demo with sample data
media_title: Screenshots
media_note: The tender in the screenshots is a sample project, a new daycare centre in Munich-Riem.
media:
  - src: /assets/projects/needle/00-title.jpg
    width: 1467
    height: 825
    alt: "Needle title slide: Minutes to price. More time to negotiate."
    caption: "Our pitch in one line: minutes to price, more time to negotiate."
  - src: /assets/projects/needle/01-dashboard.jpg
    width: 1400
    height: 900
    alt: Dashboard with the project total, a confidence score of 82 percent, a written summary and the top cost drivers
    caption: The result for one tender. The total, how sure the prices are, a short summary and the items that cost the most.
  - src: /assets/projects/needle/02-how-it-works.jpg
    width: 1600
    height: 900
    alt: "Slide titled Upload. Needle checks. You decide., next to the item list with a price suggestion open for one item"
    caption: Upload the tender, Needle checks every item, and a person confirms the prices.
  - src: /assets/projects/needle/03-price-sources.jpg
    width: 1600
    height: 900
    alt: Slide showing an example price of 18.50 euros per cubic metre with its source, an earlier daycare project from 2023
    caption: Every price says which past project it came from. The AI only compares texts and never makes up a number.
  - src: /assets/projects/needle/04-architecture.jpg
    width: 1600
    height: 900
    alt: "Architecture slide: upload, dashboard, Needle engine and result, with the frontend, backend, AI and data underneath"
    caption: How it’s built. A web page, a Python backend and three AI services.
---

## The short version

When a construction company wants a job, it gets a **tender**: a long list of every piece of work in the building (a bill of quantities, or *Leistungsverzeichnis* in German), often over a thousand items, plus the building plans. To bid, someone has to put a price on every item, usually by digging through old projects by hand. That takes days.

Needle does the first pass in minutes. You upload the tender and it gives back a price for every item, where that price came from, and a list of things to check.

## What it does

- **Groups the list.** It finds items that are really the same thing and adds them up, so you can see “1,200 m² of floor” instead of forty separate lines.
- **Prices every item** from the company’s own past projects. It copies a price when the work is the same, and adjusts it when only the size or material differs.
- **Says how sure it is.** Each price gets a confidence score, and vague item descriptions are flagged, because a vague item now is an expensive surprise later.
- **Checks the plan.** It reads the construction drawing and compares it with the list, for example 71 windows on the plan but only 64 in the tender.
- **Answers questions** about the tender in a chat.

## No made-up prices

The rule we built around: **the AI never invents a price.** It only judges whether two item descriptions mean the same work. The price itself always comes from a real past project, worked out with fixed rules, and the screen shows which project it came from. A person confirms every price before anything is exported.

## Good to know

- We built it in a team of four (Jan Fahlbusch, Davin Dewanto, Chia Brehm and me) as Team Monolith, for Challenge A of the TUM.ai × Bauindustrie hackathon in Munich in November 2026.
- The live link is a demo of the dashboard with sample data. The AI backend is switched off, so uploads are locked there, but you can click through a fully priced sample project.
