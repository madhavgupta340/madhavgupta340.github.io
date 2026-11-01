---
title: PaperTrade
order: 2
featured: true
cover: /assets/projects/papertrade/dashboard.jpg       # thumbnail on project cards
cover_alt: PaperTrade dashboard in demo mode with a simulated portfolio value and allocation breakdown
tagline: Practise trading stocks with pretend money, so mistakes cost nothing.
summary: A stock-trading simulator. You get a pretend balance, buy and sell stocks at live or demo prices, and see how your picks would have done without risking a cent.
context: Personal project, 2026
tech: [Python, JavaScript, HTML & CSS, SQLite, Postgres, Twelve Data API, Vercel]
repo: https://github.com/madhavgupta340/PaperTrade
live: https://papertrade-viue.vercel.app
live_note: my personal copy, so it’s password-protected
media_note: Taken from a copy running on my laptop in demo mode, so the prices are made up.
media:
  - src: /assets/projects/papertrade/dashboard.jpg
    width: 1600
    height: 1000
    alt: PaperTrade dashboard showing a simulated portfolio value, an allocation breakdown by stock, and cash, invested and profit totals
    caption: "The dashboard: portfolio value, where your money is, and how it’s doing today."
  - src: /assets/projects/papertrade/stock.jpg
    width: 1600
    height: 1000
    alt: Stock page for NVIDIA with a one-day price chart and a buy and sell panel
    caption: A stock page with an interactive price chart and the order panel.
  - src: /assets/projects/papertrade/history.jpg
    width: 1600
    height: 1000
    alt: History page listing five simulated buy transactions with dates, prices and cash remaining
    caption: Every simulated trade, filterable and exportable as CSV.
---

## The short version

Investing is easier to learn when mistakes don’t cost anything. PaperTrade gives you a pretend balance (anywhere from $1,000 to $10 million) and lets you trade stocks with it. Prices come from a real market-data service, or from a built-in demo mode with made-up prices if you don’t set one up. It never connects to a real broker and never places real orders.

## What you can do

- See your portfolio at a glance: total value, cash, profit or loss, and today’s change.
- Search for any stock by ticker or company name. It works from the keyboard too: press `/` to start searching.
- Open a stock page with an interactive chart, from one day up to five years.
- Place **market orders** (buy or sell right now) or **limit orders** (only at a price you choose), with a preview before you confirm.
- Keep a watchlist, look back through your history, and export it as a spreadsheet (CSV).

## Under the hood

- The server is plain Python using only the standard library. No frameworks, and nothing to install to run it locally.
- Your account is stored in SQLite on your own computer, or in Postgres when it’s hosted on Vercel.
- If the app was asleep when a limit order should have gone through, it works that out afterwards from price history and shows a “While you were away” summary.
- Free market-data plans have tight limits, so it caches prices and always labels them clearly as Live, Delayed or Demo.
