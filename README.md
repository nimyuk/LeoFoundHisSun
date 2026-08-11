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

## The RSVP dashboard

`admin.html` is a private view of your responses, reached from the **Admin**
button in the public site's footer, or directly at:

```
https://nimyuk.github.io/LeoFoundHisSun/admin.html
```

The password is `Leo1234`.

It carries a `noindex` tag so it stays out of search results, but the footer
button means guests can find it. That is fine — the password screen is what
holds them off, and the dashboard has nothing in it to take (see below). To
make it discreet again, delete the `.footer__admin` paragraph from
`index.html`; the page keeps working at its URL.

### Read this before you rely on it

**The password is a curtain, not a lock.** This is a static site with no
server, so the password check runs in the visitor's browser — anyone who opens
View Source can read `assets/js/admin.js` and work out how to get past it. That
is a property of static hosting, not something a different implementation would
fix. A real login needs a server.

The page is built so that this does not matter: **it stores no guest data.**
Nothing about your RSVPs is committed to this repository or served from this
website. You load the CSV yourself, it is parsed in your browser, and it lives
in memory for that session. Someone who defeats the password finds an empty
dashboard and a file-upload box.

Your actual RSVP records sit in Google Sheets behind your Google account, which
is genuine authentication. That is where the real protection lives, and why the
weak gate here is an acceptable trade rather than a hole.

The password is stored as a salted SHA-256 digest rather than plain text, so
the literal string is not sitting readable in a public repository. To change
it, run this and paste the result into `PASSWORD_HASH` at the top of
`assets/js/admin.js`:

```sh
node -e "console.log(require('crypto').createHash('sha256').update('leo-yoonsun-2027::' + 'YOUR_NEW_PASSWORD').digest('hex'))"
```

### Using it

1. Open your Google Form's responses and click **View in Sheets**.
2. In the sheet: **File → Download → Comma Separated Values (.csv)**.
3. Drop that file onto the dashboard (or paste the text).

It then shows headcount against your 60-seat plan, meal tallies, dietary needs
and allergies pulled out as a list for the caterer, song requests, and a
searchable table of every reply, plus a **Copy emails** button for whatever is
currently filtered.

Column names are auto-detected from your form's question wording. Detection is
a guess — dropdowns at the top let you correct any column it gets wrong.

Answers are classified as attending/declined by pattern, handling the phrasings
Google Forms produces ("Joyfully accepts", "Regretfully declines", "will not be
attending"). Anything it cannot classify confidently is counted as an **unclear
reply** and shown as its own stat rather than being guessed at — if that number
is not zero, look at those rows by hand.

There is a **remember on this device** checkbox. Leaving it off means
re-loading the CSV each visit; turning it on stores the data in your browser's
local storage. Leave it off on a shared computer.

## Publishing it

The plan is GitHub Pages, which is free and needs no build configuration. Two
settings changes, both in this repository's **Settings** tab:

**1. Make the repository public.** Pages will not serve a private repository
unless you pay for GitHub Pro. Go to **Settings → General → Danger Zone →
Change repository visibility → Make public**. GitHub will ask you to type the
repository name to confirm. This publishes the *source code*, which for a
wedding site is the same information the site itself shows anyone with the
link.

**2. Turn on Pages.** Go to **Settings → Pages**:

- Source: **Deploy from a branch**
- Branch: `claude/wedding-website-april-2027-e3ppvr` (already the default
  branch, so it should be preselected), folder **`/ (root)`**
- Click **Save**

Give it one to two minutes. The URL appears at the top of that same page:

```
https://nimyuk.github.io/LeoFoundHisSun/
```

Every push to that branch redeploys automatically — edit a file, commit, and
the live site updates within a minute.

### The URL comes from the repository name

A GitHub Pages project site is always served at
`<username>.github.io/<repository-name>/`. There is no separate setting for the
path — to change the URL you rename the repository, under
**Settings → General → Repository name**.

Renaming is safe: GitHub redirects the old repository URL, the old Pages URL,
and existing `git remote` URLs to the new name, so nothing breaks and no local
clone needs repairing. Two things do *not* follow automatically, and both are
already handled in this repository:

- the `og:image` URL in `index.html`, which must be absolute and therefore
  contains the repository name
- this README

If you rename the repository again, update those two together.

### Keeping it out of Google

`index.html` carries a `<meta name="robots" content="noindex, nofollow">` tag,
which is what actually keeps the site out of search results. There is
deliberately **no `robots.txt`** in this repository: on a GitHub Pages project
site the only `robots.txt` that counts lives at `nimyuk.github.io/robots.txt`,
which this repository does not control — and worse, a `Disallow` rule would
stop crawlers from ever reading the `noindex` tag that does the real work. The
meta tag alone is the correct tool here.

The site is unlisted, not secret. Anyone with the link can open it, so treat
the URL the way you would treat the invitation itself.

### Adding a custom domain later

Buy a domain, then on **Settings → Pages** enter it under **Custom domain**.
At your registrar, add a `CNAME` record pointing `www` to `nimyuk.github.io`
(or four `A` records to GitHub's IPs for the bare domain — GitHub shows the
current list when you save). Tick **Enforce HTTPS** once the certificate
provisions, which takes up to an hour. Nothing in the site needs to change,
except the `og:image` URL in `index.html`.

### Other hosts

Netlify, Vercel, and Cloudflare Pages all deploy this repository as-is with no
build command and will serve it while the repository stays private, if you
would rather not make it public.

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
