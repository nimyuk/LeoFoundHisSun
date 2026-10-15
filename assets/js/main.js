/* ==========================================================================
   Leo & Yoonsun — site behaviour
   No dependencies. Everything degrades gracefully if this file fails to load.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.WEDDING_CONFIG || {};

  document.documentElement.classList.remove("no-js");

  /* --- Mobile nav ------------------------------------------------------ */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Close the menu after tapping a link on mobile.
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* --- Nav shadow once scrolled --------------------------------------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- Reveal on scroll ------------------------------------------------ */
  var revealables = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-visible"); });
  } else {
    var revealer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          setTimeout(function () { el.classList.add("is-visible"); }, i * 70);
          obs.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    Array.prototype.forEach.call(revealables, function (el) { revealer.observe(el); });
  }

  /* --- Countdown -------------------------------------------------------
     One line, as on the landing page: "182 DAYS TO THE EVENT".
     --------------------------------------------------------------------- */
  var countLine = document.getElementById("countdownLine");
  var target = cfg.ceremonyStart ? new Date(cfg.ceremonyStart) : null;

  if (countLine && target && !isNaN(target.getTime())) {
    var end = cfg.receptionEnd ? new Date(cfg.receptionEnd) : null;

    var renderCount = function () {
      var diff = target.getTime() - Date.now();

      if (diff <= 0) {
        countLine.textContent =
          end && !isNaN(end.getTime()) && Date.now() < end.getTime()
            ? "Today is the day"
            : "Married";
        clearInterval(countTimer);
        return;
      }

      // Round up, so the last day before the wedding reads "1 day", not "0".
      var days = Math.ceil(diff / 86400000);
      countLine.textContent = days === 1 ? "1 DAY TO THE EVENT" : days + " DAYS TO THE EVENT";
    };

    renderCount();
    // Once a minute is plenty for a figure that changes daily, and it keeps
    // the line correct across midnight without a timer per second.
    var countTimer = setInterval(renderCount, 60000);
  }

  /* --- Hero photograph --------------------------------------------------
     The white-text treatment is only switched on once the photo has really
     loaded. Setting it in CSS up front would leave white text on a pale
     background whenever the file is missing.
     --------------------------------------------------------------------- */
  var hero = document.querySelector(".hero");

  if (hero) {
    var heroImg = new Image();
    heroImg.onload = function () {
      hero.style.setProperty("--hero-photo", 'url("assets/img/hero.jpg")');
      hero.classList.add("hero--photo");
    };
    heroImg.src = "assets/img/hero.jpg";
  }

  /* --- FAQ image answer -------------------------------------------------
     Tries each candidate filename in turn and shows the first that loads,
     so the upload's extension does not have to be guessed correctly. The
     text answer stands in until one succeeds, and stays if none do.
     --------------------------------------------------------------------- */
  var meme = document.getElementById("kidsMeme");
  var memeImg = document.getElementById("kidsMemeImg");
  var memeFallback = document.getElementById("kidsMemeFallback");

  if (meme && memeImg) {
    var candidates = [
      "assets/img/no.gif",
      "assets/img/no.jpg",
      "assets/img/no.jpeg",
      "assets/img/no.png",
      "assets/img/no.webp"
    ];
    var attempt = 0;

    memeImg.addEventListener("load", function () {
      meme.hidden = false;
      if (memeFallback) memeFallback.hidden = true;
    });

    memeImg.addEventListener("error", function () {
      attempt++;
      if (attempt < candidates.length) {
        memeImg.src = candidates[attempt];
      }
      // Out of candidates: the figure stays hidden and the text answer stands.
    });

    memeImg.src = candidates[0];
  }

  /* --- Sun portraits ---------------------------------------------------
     The block stays hidden until both photographs load. If either file is
     missing the section simply reads as it did before, rather than showing a
     pair of broken-image icons.
     --------------------------------------------------------------------- */
  var suns = document.getElementById("suns");

  if (suns) {
    var sunImgs = [document.getElementById("sunLeo"), document.getElementById("sunYoonsun")];
    var loaded = 0;
    var failed = false;

    var settle = function () {
      if (!failed && loaded === sunImgs.length) suns.hidden = false;
    };

    sunImgs.forEach(function (img) {
      if (!img) { failed = true; return; }

      // An image cached before this script ran is already complete.
      if (img.complete) {
        if (img.naturalWidth > 0) { loaded++; } else { failed = true; }
        return;
      }

      img.addEventListener("load", function () { loaded++; settle(); });
      img.addEventListener("error", function () { failed = true; suns.hidden = true; });
    });

    settle();
  }

  /* --- Timeline photographs ---------------------------------------------
     Each slot stays hidden until its file is confirmed to load, so the
     captions can go up long before the pictures do.
     --------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".tl__photo"), function (fig) {
    var img = fig.querySelector("img");
    if (!img) return;

    var show = function () { if (img.naturalWidth > 0) fig.hidden = false; };

    if (img.complete) { show(); return; }
    img.addEventListener("load", show);
    img.addEventListener("error", function () { fig.hidden = true; });
  });

  /* --- Honeymoon fund -------------------------------------------------- */
  var giftMount = document.getElementById("giftMount");

  if (giftMount) {
    var gift = cfg.honeymoon || {};
    var venmo = (gift.venmo || "").trim();
    var links = [];

    if (venmo) {
      // Accept either a full URL or a bare @handle.
      var venmoUrl = /^https?:\/\//i.test(venmo)
        ? venmo
        : "https://venmo.com/u/" + venmo.replace(/^@/, "");
      links.push({ label: "Give via Venmo", url: venmoUrl, primary: true });
    }

    if ((gift.otherUrl || "").trim() && (gift.otherLabel || "").trim()) {
      links.push({ label: gift.otherLabel.trim(), url: gift.otherUrl.trim(), primary: false });
    }

    if (links.length) {
      var row = document.createElement("div");
      row.className = "gift__actions";

      links.forEach(function (link) {
        var a = document.createElement("a");
        a.className = "btn " + (link.primary ? "btn--solid" : "btn--ghost");
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = link.label;
        row.appendChild(a);
      });

      giftMount.appendChild(row);
    } else {
      var soon = document.createElement("p");
      soon.className = "gift__soon";
      soon.textContent =
        "We are still setting this up — a link will appear here before the invitations go out.";
      giftMount.appendChild(soon);
    }
  }

  /* --- Config-driven text --------------------------------------------- */
  var deadlineEl = document.getElementById("rsvpDeadline");
  if (deadlineEl && cfg.rsvpDeadlineLabel) {
    deadlineEl.textContent = cfg.rsvpDeadlineLabel;
  }

  var emailLink = document.getElementById("contactEmailLink");
  if (emailLink && cfg.contactEmail) {
    emailLink.href = "mailto:" + cfg.contactEmail;
    emailLink.textContent = cfg.contactEmail;
  }
})();
