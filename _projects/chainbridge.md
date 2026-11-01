---
title: ChainBridge
order: 1
featured: true
tagline: A digital notary for files. It stamps a fingerprint of your document on the Cardano blockchain so anyone can check a copy later.
summary: Upload a document and ChainBridge records a unique fingerprint of it on the Cardano blockchain. Later, anyone can check for free whether their copy is exactly the original. Built at the TUM Blockchain & AI Hackathon.
context: TUM Blockchain & AI Hackathon, Oct 2026
tech: [JavaScript, Cardano, x402 payments, Masumi, Merkle trees, Meta AI]
repo: https://github.com/madhavgupta340/ChainBridge
media_title: Screenshots and demo
media_note: Recorded on Cardano’s test network. The sample documents are fictional.
media:
  - type: video
    src: /assets/projects/chainbridge/demo.mp4
    poster: /assets/projects/chainbridge/01-home.jpg
    width: 1600
    height: 1025
    alt: ChainBridge demo video
    caption: The project demo video.
  - src: /assets/projects/chainbridge/01-home.jpg
    width: 1600
    height: 1025
    alt: ChainBridge home screen with two choices, Seal a document and Check a document
    caption: "The two things ChainBridge does: seal a document (paid) or check one you received (free)."
  - src: /assets/projects/chainbridge/08-ai-facts.jpg
    width: 1600
    height: 1025
    alt: A list of facts the AI extracted from an inspection report, each with the source words it came from
    caption: The AI returns the important facts along with the exact words it took them from. You confirm or edit them.
  - src: /assets/projects/chainbridge/10-fingerprint-and-publish.jpg
    width: 1600
    height: 1025
    alt: Fingerprint screen showing what stays on your device and what gets published to Cardano
    caption: The fingerprint is made in the browser. Only the fingerprint goes on Cardano, never the file.
  - src: /assets/projects/chainbridge/11-published-and-paid.jpg
    width: 1600
    height: 1025
    alt: Confirmation screen with links to the publication and payment transactions on Cardano
    caption: Published first, paid second. Both blockchain transactions are linked.
  - src: /assets/projects/chainbridge/16-check-results.jpg
    width: 1600
    height: 1025
    alt: Check results showing four valid checks for file match, Cardano record, version link and issuer signature
    caption: "Checking a copy: four separate checks, all done in the browser."
  - src: /assets/projects/chainbridge/18-check-different-file.jpg
    width: 1600
    height: 1025
    alt: Check result warning that the file is different from the sealed version
    caption: A different file gets caught. Here an older report is checked against the newer certificate.
---

## The short version

Think of ChainBridge as a digital notary. You give it a file (a PDF, a photo, a spreadsheet) and it makes a **fingerprint** of it: a short code that changes completely if even one bit of the file changes. That fingerprint gets written onto the Cardano blockchain, a public record that nobody can quietly edit later.

Anyone who receives a copy of the file can drop it into ChainBridge’s free check page. If the fingerprint matches the one on the blockchain, the copy is identical to the original. If someone changed it, that gets caught.

## How it works

1. **Get a price.** Upload your files and get a free quote, worked out from simple counts like pages and rows (not by AI).
2. **Pay once.** Payment uses x402, a pay-per-use method on Cardano. No account, no subscription. You’re only charged after the fingerprint has been published, so if anything fails, you pay nothing.
3. **Let the AI read it.** With your permission, an AI model picks out the facts that matter, like dates, IDs and results, and shows the exact words it took each one from. You confirm or edit everything.
4. **Seal it.** The fingerprint is calculated right in your browser. Only the fingerprint goes on the blockchain. The file itself never leaves your device.
5. **Check it any time.** Anyone can check a copy for free. A certificate can also have linked versions, like a car inspection and a later re-inspection.

## Good to know

- It runs on Cardano’s test network, so all payments use test tokens with no real value.
- A fingerprint proves a file hasn’t changed since it was sealed. It doesn’t prove the contents were true in the first place.
- It’s built on the official Masumi quickstart for the hackathon’s Cardano track, and the repository includes 122 automated tests.
