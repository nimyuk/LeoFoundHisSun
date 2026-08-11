# Leo &amp; Yoonsun — April 15, 2027

A wedding website for Leo and Yoonsun, married on Thursday, April 15, 2027 at
[Sweeney Barn](https://sweeneybarn.com/) in Manassas, Virginia.

Plain HTML, CSS, and JavaScript. No build step, no package manager, no
dependencies to keep alive between now and the wedding — open `index.html` in a
browser and it works.

```
index.html            every section of the site
assets/css/styles.css palette, type, layout
assets/js/config.js   ← edit this first: names, date, RSVP link, contact
assets/js/main.js     countdown, nav, RSVP embed, scroll reveals
assets/wedding.ics    the "Add to calendar" download
assets/img/           drop photos here (see the README in that folder)
```

## Editing it

Almost everything you will want to change is in one of two places:

- **`assets/js/config.js`** — the date, the RSVP form URL, the RSVP deadline,
  and the contact email. Comments explain each field.
- **`index.html`** — all the words. Sections are separated by comment banners
  (`<!-- ===== SCHEDULE ===== -->`), and every block still holding invented
  content is marked `PLACEHOLDER` so you can grep for what needs your attention.

### Before you send this to anyone

Search the source for `PLACEHOLDER` and work through the list:

- [ ] **Our Story** — three paragraphs of invented backstory. Replace with yours.
- [ ] **Schedule times** — 4:00 pm arrival through a 10:30 pm send-off is a
      reasonable shape for the evening, but confirm against your venue contract.
- [ ] **Room block** — no block is set up yet; the three hotels listed are real
      and nearby, but unnegotiated.
- [ ] **Registry** — three dead links waiting for real URLs. If you would rather
      not have a registry, delete the whole `#registry` section and its nav link.
- [ ] **RSVP form** — see below.
- [ ] **Photos** — see `assets/img/README.md`.

## Wiring up the RSVP

1. Build the form at [forms.google.com](https://forms.google.com). Useful
   fields: name, attending yes/no, number in your party, meal choice, dietary
   restrictions, song request, and a free-text note.
2. In the form, click **Send**, then the `<>` embed tab, and copy the URL out of
   the `src="..."` attribute. It looks like
   `https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true`.
3. Paste it into `rsvpFormUrl` in `assets/js/config.js`.

Until that field is filled in the RSVP section shows an "RSVP opens soon" card
rather than a broken frame, so the site is safe to publish early. Responses land
in a Google Sheet you own — no third-party service, no account for guests.

## Publishing it

GitHub Pages, free, no configuration:

1. **Settings → Pages** in this repository.
2. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. It goes live at `https://nimyuk.github.io/Wedding-Website/` within a minute
   or two.

For a nicer address, buy a domain, point a `CNAME` record at
`nimyuk.github.io`, and enter it under **Custom domain** on that same settings
page. Anything short and memorable works — guests will be typing it off a card.

Netlify, Vercel, and Cloudflare Pages all deploy this repository as-is with no
build command, if you would rather use one of those.

## Notes on the build

- **Responsive** from 320px up; the nav collapses to a menu below 860px.
- **Accessible**: skip link, keyboard-operable menu, visible focus rings,
  semantic landmarks, and a real `<details>` accordion for the FAQ.
- **Degrades without JavaScript** — the countdown is the only thing lost, and
  the date is still stated plainly three times on the page.
- **Respects `prefers-reduced-motion`**, which switches off every animation.
- **Prints cleanly**, in case anyone wants the details on paper.
- The only external request is the Google Fonts stylesheet. If you would rather
  the site make no third-party requests at all, delete those two `<link>` tags
  in `index.html` — the fallback stack (Iowan Old Style / Georgia) is a
  deliberate near-match, not an accident.
