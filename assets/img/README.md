# Images

The site ships with no photographs — it uses a soft gradient and a hand-drawn
botanical texture instead, so nothing looks broken while you wait on your
photographer. Drop files in here with these exact names to swap them in.

| File | Used for | Recommended size |
| --- | --- | --- |
| `hero.jpg` | Full-bleed background behind the names | 2400 × 1600, landscape |
| `share.jpg` | Link preview when the site is texted or posted | 1200 × 630 |

## Turning on the hero photo

Open `assets/css/styles.css`, find `.hero__bg`, and add the photo as the last
layer of the `background` shorthand — the gradients above it stay in place as a
scrim so the text remains readable:

```css
.hero__bg {
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(175deg, rgba(250,246,239,0.55) 0%, rgba(242,235,223,0.75) 100%),
    url("../img/hero.jpg") center/cover no-repeat;
}
```

Check the contrast on a phone before you commit — a busy photo behind large
serif type is the single easiest way to make a wedding site hard to read.

## Sizing

Export at roughly 75% JPEG quality and keep `hero.jpg` under about 400 KB.
Guests will open this on hotel wifi.
