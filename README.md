# madhavgupta340.github.io

My personal site: projects, writing, and a small pixel-art version of me in the corner.

Live at **https://madhavgupta340.github.io**

It's a plain [Jekyll](https://jekyllrb.com) site with a calm, black-and-white layout and indie pixel-game touches: Pixelify Sans headings, JetBrains Mono text, Silkscreen for tiny labels, dithered dividers, a ▶ menu cursor and a pixel mouse pointer. GitHub Pages builds it automatically on every push to `main`, so there is no build step to run yourself. Everything you'd normally want to change is a Markdown or YAML file.

## Updating content

| What | Where |
|---|---|
| Name, intro details, email, GitHub | `_config.yml` (the `author:` block) |
| Home page intro text and the "Player 1" card | `index.html` |
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
   live: https://example.com   # optional
   media:                      # optional screenshots / videos
     - src: /assets/projects/my-project/screenshot.jpg
       width: 1600
       height: 1000
       alt: What the screenshot shows, for people using screen readers
       caption: Optional caption.
     - type: video
       src: /assets/projects/my-project/demo.mp4
       poster: /assets/projects/my-project/screenshot.jpg
       alt: Short description of the video
   ```
3. Write the plain-language explanation below the `---` in normal Markdown.
4. Put images in `assets/projects/my-project/`. Around 1600px wide JPGs keep pages fast.

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

It lives in `assets/js/buddy.js` and is drawn in code on a 32×28 canvas, so there are no image files.

- Click it to see a new activity: tennis, piano, lifting, yawning and napping, GIF texting, Newton's apple, juggling, and waving.
- **Pause/Play** sits under it. The choice is remembered, and it starts paused for anyone whose system asks for reduced motion.
- It stops animating when the tab is hidden or it's scrolled out of view.
- On wide screens it sits in the empty right margin, drawn at 4× size. On smaller screens it moves into the footer so it never covers anything.

Preview a single activity from the browser console with `buddy.play("gif")` or `buddy.show("tennis", 4)`. To add one, write a new entry in `ACTS` and add its name to `PLAYLIST`.

## Credits

Project screenshots of ChainBridge and its demo video come from the [ChainBridge repository](https://github.com/madhavgupta340/ChainBridge). PaperTrade screenshots were taken from a local copy running in demo mode with simulated prices.
