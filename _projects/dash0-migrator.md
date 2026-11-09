---
title: Dash0 Migrator
order: 0
featured: true
cover: /assets/projects/dash0-migrator/02-upload.jpg       # thumbnail on project cards
cover_alt: The Migrate app's start screen, titled Datadog to Dash0, with sample files ready to convert
tagline: A tool that moves a company’s monitoring dashboards and alerts from Datadog to Dash0 automatically, using fixed rules instead of AI guesses. 3rd place at THINC! Hack Munich 2026.
summary: Moving from one monitoring service to another usually means rebuilding every dashboard and alert by hand. Our tool translates them automatically with fixed rules and says exactly what it couldn’t move. 3rd place at THINC! Hack Munich.
context: THINC! Hack Munich, Nov 2026 · 3rd place
tech: [Python, PromQL, Perses, OpenTelemetry, JavaScript]
repo: https://github.com/madhavgupta340/thinchackdash
live: https://thinchackdash.vercel.app/
live_note: demo preview
media_title: Demo and screenshots
media_note: Recorded from the local app converting a fictional online-shop example.
media:
  - type: video
    src: /assets/projects/dash0-migrator/demo.mp4
    poster: /assets/projects/dash0-migrator/01-what-it-does.jpg
    width: 1920
    height: 1080
    alt: Two-minute demo of the Migrate app converting a sample online-shop dashboard and alert
    caption: The two-minute demo film, with a voice assistant giving the tour.
  - src: /assets/projects/dash0-migrator/01-what-it-does.jpg
    width: 1600
    height: 900
    alt: "Diagram: Datadog JSON files go into Migrate's fixed rules and come out as Dash0 dashboards and alert rules"
    caption: "The whole idea in one picture: Datadog files in, fixed rules, Dash0 dashboards out."
  - src: /assets/projects/dash0-migrator/02-upload.jpg
    width: 1600
    height: 900
    alt: Start screen with two sample files ready to convert and a list of example inputs
    caption: Drop in your Datadog files, or try one of the samples.
  - src: /assets/projects/dash0-migrator/03-results.jpg
    width: 1600
    height: 900
    alt: Conversion results sorted into three columns, translated, converted with remarks, and blocked
    caption: Every chart and alert lands in one of three piles. Translated, translated with a note to review, or blocked with the reason.
  - src: /assets/projects/dash0-migrator/04-what-moved.jpg
    width: 1600
    height: 900
    alt: Summary screen with a ring chart showing 44 percent translated one to one
    caption: An honest summary at the end. Here 4 of 9 items moved one to one.
---

## The short version

Companies keep an eye on their servers with **dashboards** (live charts of things like traffic, errors and memory) and **alerts** (rules like “warn us if errors go above 5%”). Over time a company can end up with hundreds of them.

If that company wants to switch from Datadog to Dash0, two monitoring services, all of those normally have to be rebuilt by hand. That’s slow, boring, and easy to get wrong.

Our tool does the translation automatically. You give it the Datadog files, and it gives back dashboards and alert rules that Dash0 understands.

## No guessing

The big rule we set ourselves: **no AI in the translation.** Every query is converted with explicit rules and a hand-checked list of which Datadog metric matches which Dash0 metric. The same input always gives exactly the same output.

When something can’t be translated safely, the tool doesn’t make something up. It marks it as blocked and explains why, so a person can handle it. For monitoring that matters: a wrong alert is worse than a missing one.

## What’s in it

- **A command-line tool** that converts, publishes to Dash0 and can download dashboards from Datadog.
- **A local web app** where you drop in files and see the results sorted into translated, needs review and blocked.
- **A voice assistant** (Jarvis, built with ElevenLabs) that gives a tour of the app and answers questions.
- **Lots of tests**, including comparisons against real data sent to both services at the same time.

## Good to know

- We built it in a team of four (Felix Bischof, Sofia Armstrong, Bjarne Zachaiae and me) for the Dash0 challenge at THINC! Hack Munich 2026, and came 3rd.
- It covers the most common chart types and alerts. Anything outside that is blocked on purpose rather than half-converted.
