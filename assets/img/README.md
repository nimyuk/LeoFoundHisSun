# Images

The site ships with no photographs — it uses a soft gradient and a hand-drawn
botanical texture instead, so nothing looks broken while you wait on your
photographer. Drop files in here with these exact names to swap them in.

| File | Used for | Recommended size |
| --- | --- | --- |
| `leo.jpg` | Left sun portrait in Our Story | 600 × 600, square |
| `yoonsun.jpg` | Right sun portrait in Our Story | 600 × 600, square |
| `no.*` | The answer to "Are children invited?" in the FAQ | any, shown at 240px |
| `hero.jpg` | Full-bleed background behind the names | 2400 × 1600, landscape |
| `share.jpg` | Link preview when the site is texted or posted | 1200 × 630 |

## The FAQ image answer

`no.gif` — or `.jpg`, `.jpeg`, `.png`, `.webp`. The page tries each of those
in turn and uses the first it finds, so the extension does not have to match
anything exactly. Until one exists, the FAQ answer reads "No." as plain text,
which is also what shows for anyone using a screen reader.

An animated GIF works and will play.

## The sun portraits

`leo.jpg` and `yoonsun.jpg` are the two sun photos, shown as circles side by
side at the top of Our Story. **Both must be present** — the block stays
hidden until each one loads, so the page never shows a broken image while you
are still gathering them.

They are cropped to a circle with `object-fit: cover`, so any aspect ratio
works, but a roughly square export keeps the most of each picture. If a face
sits too high or low inside its circle, adjust `object-position` on `.sun__img`
in `styles.css` — it is set to `center 42%`, which favours the upper half of
the frame where faces usually sit.

The filenames are case-sensitive on GitHub Pages: `leo.jpg`, not `Leo.JPG`. If
your phone exported `.HEIC`, convert to JPEG first — browsers will not display
HEIC.

## The hero photograph

Drop a landscape photo at `assets/img/hero.jpg` and the landing page uses it
as a full-bleed background: a dark scrim goes over it and the text turns
white, as on the reference design. **No CSS to edit** — the page checks
whether the file loaded and switches itself.

With no file there, the landing page keeps the lilac wash and dark text, so
nothing looks broken while you are still choosing a picture.

Pick something with a calm middle: the names and the countdown sit across the
centre, and a busy subject right there fights the script type. A wide shot
with sky, water or an out-of-focus background works best.

## Sizing

Export at roughly 75% JPEG quality and keep `hero.jpg` under about 400 KB.
Guests will open this on hotel wifi.
