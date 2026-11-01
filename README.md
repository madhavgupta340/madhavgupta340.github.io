# madhavgupta340.github.io

My personal site: projects, writing, and a small pixel-art version of me in the corner.

Live at **https://madhavgupta340.github.io**

It's a plain [Jekyll](https://jekyllrb.com) site with a dark theme set in Geist. GitHub Pages builds it automatically on every push to `main`, so there is no build step to run yourself. Everything you'd normally want to change is a Markdown or YAML file.

## Updating content

| What | Where |
|---|---|
| Name, intro details, email, GitHub | `_config.yml` (the `author:` block) |
| Home page intro text | `index.html` |
| About page | `about.md` |
| Contact page | `contact.md` |
| Header links | `_data/navigation.yml` |
| Projects | `_projects/*.md` (one file per project) |
| Blog posts | `_posts/` (drafts in `_drafts/`) |
| Photos (page hidden for now) | `_data/photos.yml` + `assets/photos/` |

### Add a project

1. Create `_projects/my-project.md`. Copy `_projects/papertrade.md` as a starting point.
2. Fill in the front matter:
   ```yaml
   title: My Project
   order: 3                # position in lists (lower = earlier)
   featured: true          # also show it on the home page
   tagline: One sentence shown under the title on its own page.
   summary: Two sentences for the project list.
   context: Personal project, 2026
   tech: [Python, JavaScript]
   repo: https://github.com/madhavgupta340/my-project
   live: https://example.com          # optional, adds a "Live demo" button
   live_short_note: sign-in only      # optional, small note on that button
   demo_video: true                   # optional, adds a "Watch demo" button (needs a video in media)

   # The big preview shown on cards and at the top of the project page.
   # Leave these out and a neutral "Preview coming soon" card is shown instead.
   cover: /assets/projects/my-project/screenshot.jpg
   cover_width: 1600
   cover_height: 1000
   cover_label: Dashboard              # shown in the little window bar
   cover_alt: What the screenshot shows, for people using screen readers
   cover_caption: Optional caption under the preview on the project page.

   media:                      # optional extra screenshots / videos for the gallery
     - label: Settings         # shown in the window bar
       src: /assets/projects/my-project/settings.jpg
       width: 1600
       height: 1000
       alt: What the screenshot shows
       caption: Optional caption.
       wide: true              # optional: span the full gallery width
     - type: video
       label: Demo
       src: /assets/projects/my-project/demo.mp4
       poster: /assets/projects/my-project/screenshot.jpg
       alt: Short description of the video
   ```
3. Write the plain-language explanation below the `---` in normal Markdown.
4. Put images in `assets/projects/my-project/`. Around 1600px-wide JPGs at a 16:10-ish ratio look best; cards show the top of the image in a 16:10 frame, and the gallery shows images uncropped.

Clicking any screenshot on a project page opens it larger. Use ← / → to move between them and Esc to close.

The project gets its own page at `/projects/my-project/` automatically.

### Write a post

1. Create `_posts/YYYY-MM-DD-short-title.md`, for example `_posts/2026-11-15-first-week-of-lectures.md`.
2. Start it with:
   ```yaml
   ---
   title: First week of lectures
   description: Optional one-liner shown in the list and under the title.
   ---
   ```
3. Write the post in Markdown and push. There's an example in `_drafts/example-post.md`. Drafts are never published.

Images for posts go in `assets/posts/` and are added with `![description](/assets/posts/file.jpg)`.

### Turn on the photography page

1. Add photos to `assets/photos/` and list them in `_data/photos.yml` (format explained at the top of that file).
2. In `photography/index.html`, change `published: false` to `published: true`.
3. Add it to `_data/navigation.yml`:
   ```yaml
   - title: Photography
     url: /photography/
   ```

## Running it locally

You only need this to preview changes before pushing.

The macOS system Ruby is too old, so install a current one first:

```bash
brew install ruby
```

Then, from this folder:

```bash
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000. Pages rebuild when you save (restart the server after editing `_config.yml`). Add `--drafts` to preview posts in `_drafts/`.

## The pixel companion

Pixel me lives in `assets/js/buddy.js`. It's drawn in code on a 48×56 canvas, so there are no image files to manage.

**Where it lives**
- On wide screens (1240px and up), it roams the empty right margin of the window: it walks along the bottom edge, bounces off the side ("BOING!"), climbs the wall and slides down ("WHEEE!"), and flies a rocket pack. That layer is click-through, so it never covers text or blocks clicks.
- On smaller screens, it gets its own strip below the footer and runs edge to edge there. The strip's height is reserved up front, so nothing jumps around.

**What it does**
- Tennis ("POW!"), piano, lifting, yawning and napping ("Zzz…"), replying with a GIF, getting bonked by Newton's apple ("BONK!", then "AHA!"), and juggling.
- It reacts to the page. Its eyes follow your cursor, it says hey when the cursor comes close, it notices fast scrolling ("WHOA!") and the end of the page, and it says hi when you come back to the tab.
- Click it to say hi. Click a few more times and see what happens.
- Comic bubbles show up now and then for about 1.5 seconds. They never flash.

**Controls**
- **Pause / Play** freezes it in place. **Hide** removes it, and "Bring back pixel me" in the footer brings it back. Both choices are remembered.
- It starts paused for anyone whose system asks for reduced motion, and stops completely when the tab is hidden.

**Changing it**
- Colours (skin, shirt, shoes…) are in the `P` object at the top of the file.
- Poses and props are in `ANIMS`. Things it does and where it goes are in `BEHAVIOURS`, each with a `weight` for how often it happens.
- Preview from the browser console: `buddy.do("rocket")` runs a behaviour; `buddy.pose("apple", 20)` freezes on a single frame. `buddy.behaviours` and `buddy.poses` list the names.

## Credits

Project screenshots of ChainBridge and its demo video come from the [ChainBridge repository](https://github.com/madhavgupta340/ChainBridge). PaperTrade screenshots were taken from a local copy running in demo mode with simulated prices.
