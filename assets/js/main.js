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

  /* --- Active section in nav ------------------------------------------ */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = {};
  Array.prototype.forEach.call(document.querySelectorAll('.nav__menu a[href^="#"]'), function (a) {
    navLinks[a.getAttribute("href").slice(1)] = a;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = navLinks[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
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

  /* --- Countdown ------------------------------------------------------- */
  var countdownEl = document.getElementById("countdown");
  var target = cfg.ceremonyStart ? new Date(cfg.ceremonyStart) : null;

  if (countdownEl && target && !isNaN(target.getTime())) {
    var units = [
      { key: "days", label: "Days" },
      { key: "hours", label: "Hours" },
      { key: "minutes", label: "Minutes" },
      { key: "seconds", label: "Seconds" }
    ];

    // Build the markup once, then only touch the numbers on each tick.
    var nums = {};
    units.forEach(function (u) {
      var wrapEl = document.createElement("div");
      wrapEl.className = "countdown__unit";

      var num = document.createElement("span");
      num.className = "countdown__num";
      num.textContent = "--";

      var label = document.createElement("span");
      label.className = "countdown__label";
      label.textContent = u.label;

      wrapEl.appendChild(num);
      wrapEl.appendChild(label);
      countdownEl.appendChild(wrapEl);
      nums[u.key] = num;
    });

    var pad = function (n) { return n < 10 ? "0" + n : String(n); };

    var tick = function () {
      var diff = target.getTime() - Date.now();

      if (diff <= 0) {
        countdownEl.innerHTML = "";
        var msg = document.createElement("p");
        msg.className = "countdown__message";
        var end = cfg.receptionEnd ? new Date(cfg.receptionEnd) : null;
        msg.textContent =
          end && !isNaN(end.getTime()) && Date.now() < end.getTime()
            ? "Today is the day."
            : "Married — thank you for celebrating with us.";
        countdownEl.appendChild(msg);
        clearInterval(timer);
        return;
      }

      var s = Math.floor(diff / 1000);
      nums.days.textContent = String(Math.floor(s / 86400));
      nums.hours.textContent = pad(Math.floor(s / 3600) % 24);
      nums.minutes.textContent = pad(Math.floor(s / 60) % 60);
      nums.seconds.textContent = pad(s % 60);
    };

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* --- RSVP form ------------------------------------------------------- */
  var mount = document.getElementById("rsvpMount");

  if (mount) {
    var url = (cfg.rsvpFormUrl || "").trim();
    var isGoogleForm = /^https:\/\/docs\.google\.com\/forms\//.test(url);

    if (isGoogleForm) {
      var frame = document.createElement("iframe");
      frame.className = "rsvp__frame";
      frame.src = url.indexOf("embedded=true") === -1
        ? url + (url.indexOf("?") === -1 ? "?" : "&") + "embedded=true"
        : url;
      frame.title = "RSVP form";
      frame.loading = "lazy";
      frame.setAttribute("frameborder", "0");
      mount.appendChild(frame);

      var direct = document.createElement("p");
      direct.className = "section__note";
      direct.style.marginTop = "1rem";
      direct.innerHTML =
        'Form not loading? <a href="' + url.replace("&embedded=true", "").replace("?embedded=true", "") +
        '" target="_blank" rel="noopener">Open it in a new tab &rarr;</a>';
      mount.appendChild(direct);
    } else {
      var card = document.createElement("div");
      card.className = "rsvp__placeholder";
      card.innerHTML =
        "<h3>" + (mount.dataset.emptyTitle || "RSVP opens soon") + "</h3>" +
        "<p>Invitations go out ahead of the date, and the form will appear right here. " +
        "If you already know your answer, we would love to hear it early.</p>";
      mount.appendChild(card);
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
