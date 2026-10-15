/* ==========================================================================
   RSVP form — rsvp.html

   HOW THIS WORKS
   The guest fills in a form on our own page. On submit, the answers are
   posted to the Google Form's /formResponse endpoint, which records them in
   the same spreadsheet as before — the admin dashboard needs no changes.

   The post targets a hidden iframe rather than using fetch(). Google does not
   send CORS headers on that endpoint, so a fetch response is unreadable
   either way; a form posting to an iframe submits cleanly, keeps the guest on
   our page, and works without JavaScript modules or any library.

   WHAT THIS MEANS IN PRACTICE
   Because the response is cross-origin, we cannot read it. A submission that
   Google rejects — a required question we did not send, a multiple-choice
   value that does not match its options exactly — looks identical to a
   successful one from here. That is why the config's attendingYes/No and
   meals must match the Google Form exactly, and why those questions are
   better left optional in Google itself, with this page enforcing what is
   required.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.WEDDING_CONFIG || {};
  var form = cfg.rsvpForm || {};
  var entries = form.entries || {};
  var $ = function (id) { return document.getElementById(id); };

  /* --- Work out where to post ------------------------------------------ */
  // The form id sits in the viewform URL already in config, so it is not
  // asked for twice.
  var formId = (function () {
    var m = /\/forms\/d\/e\/([^/]+)\//.exec(cfg.rsvpFormUrl || "");
    return m ? m[1] : "";
  })();

  var postUrl = formId
    ? "https://docs.google.com/forms/d/e/" + formId + "/formResponse"
    : "";

  var configured = !!postUrl && !!(entries.name || "").trim() && !!(entries.attending || "").trim();

  /* --- Shared bits ----------------------------------------------------- */
  var deadlineEl = $("rsvpDeadline");
  if (deadlineEl && cfg.rsvpDeadlineLabel) deadlineEl.textContent = cfg.rsvpDeadlineLabel;

  var emailLink = $("fallbackEmail");
  if (emailLink && cfg.contactEmail) {
    emailLink.href = "mailto:" + cfg.contactEmail;
    emailLink.textContent = cfg.contactEmail;
  }

  /* --- Not wired up yet ------------------------------------------------ */
  if (!configured) {
    $("notReady").hidden = false;
    return;
  }

  /* --- Build the choice lists from config ------------------------------ */
  var yesLabel = form.attendingYes || "Joyfully accepts";
  var noLabel = form.attendingNo || "Regretfully declines";

  function addChoice(host, name, value, label) {
    var wrap = document.createElement("label");
    wrap.className = "choice";

    var input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = value;

    var text = document.createElement("span");
    text.textContent = label;

    wrap.appendChild(input);
    wrap.appendChild(text);
    host.appendChild(wrap);
    return input;
  }

  var attendingHost = $("attendingChoices");
  addChoice(attendingHost, "attending", yesLabel, "Joyfully accepts — we would not miss it");
  addChoice(attendingHost, "attending", noLabel, "Regretfully declines — we cannot make it");

  var mealHost = $("mealChoices");
  var meals = Array.isArray(form.meals) ? form.meals : [];
  meals.forEach(function (meal) { addChoice(mealHost, "meal", meal, meal); });

  /* --- Show only the questions this form actually has ------------------
     A field with no entry id has nowhere to send its answer, so asking for
     it would be worse than useless — the guest would type something that
     silently went nowhere. Every optional field hides itself unless the
     config names an entry for it.
     --------------------------------------------------------------------- */
  var optionalFields = {
    email: "emailField",
    party: "partyField",
    meal: "mealField",
    dietary: "dietaryField",
    song: "songField",
    note: "noteField"
  };

  Object.keys(optionalFields).forEach(function (key) {
    var el = $(optionalFields[key]);
    if (!el) return;
    var present = !!(entries[key] || "").trim();
    if (key === "meal") present = present && meals.length > 0;
    el.hidden = !present;
  });

  var hasEmail = !!(entries.email || "").trim();
  var hasParty = !!(entries.party || "").trim();
  var askNames = hasParty && form.askPartyNames !== false;
  $("partyNamesField").hidden = !askNames;

  /* --- Show the party questions only to a yes -------------------------- */
  var ifAttending = $("ifAttending");

  function syncAttending() {
    var picked = document.querySelector('input[name="attending"]:checked');
    var isYes = picked && picked.value === yesLabel;
    // Nothing inside this block applies to a decline. If none of its fields
    // exist on this form, the block never needs to appear at all.
    var anyInside = [hasParty, !$("mealField").hidden,
                     !$("dietaryField").hidden, !$("songField").hidden]
                    .some(Boolean);
    ifAttending.hidden = !isYes || !anyInside;
  }

  attendingHost.addEventListener("change", function () {
    syncAttending();
    clearError("attending");
  });

  /* --- Validation ------------------------------------------------------ */
  function setError(key, message) {
    var box = $("e-" + key);
    var input = $("f-" + key);
    if (box) { box.textContent = message; box.hidden = false; }
    if (input) input.classList.add("is-invalid");
  }

  function clearError(key) {
    var box = $("e-" + key);
    var input = $("f-" + key);
    if (box) box.hidden = true;
    if (input) input.classList.remove("is-invalid");
  }

  ["name", "email", "party", "partyNames"].forEach(function (key) {
    var input = $("f-" + key);
    if (input) input.addEventListener("input", function () { clearError(key); });
  });

  function validate() {
    var problems = [];
    ["name", "email", "party", "partyNames", "attending"].forEach(clearError);

    if (!$("f-name").value.trim()) {
      setError("name", "Please tell us who is replying.");
      problems.push("name");
    }

    var email = $("f-email").value.trim();
    if (hasEmail) {
      if (!email) {
        setError("email", "We need an email address in case anything changes.");
        problems.push("email");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("email", "That does not look like an email address.");
        problems.push("email");
      }
    }

    var attending = document.querySelector('input[name="attending"]:checked');
    if (!attending) {
      setError("attending", "Please let us know either way.");
      problems.push("attending");
    }

    if (attending && attending.value === yesLabel && hasParty) {
      var party = $("f-party").value.trim();
      var n = parseInt(party, 10);
      if (!party || isNaN(n) || n < 1) {
        setError("party", "How many of you should we seat?");
        problems.push("party");
      } else if (n > 12) {
        setError("party", "That is more than we can seat on one reply — please email us.");
        problems.push("party");
      } else if (askNames && n > 1) {
        // One guest is already named at the top of the form; two or more are not.
        var namesGiven = $("f-partyNames").value
          .split(/[\n,]+/)
          .filter(function (x) { return x.trim(); }).length;
        if (namesGiven < n - 1) {
          setError("partyNames", "Please list everyone coming with you, so we can name their seats.");
          problems.push("partyNames");
        }
      }
    }

    return problems;
  }

  /* --- Submit ---------------------------------------------------------- */
  var formEl = $("rsvpForm");
  var sink = $("gformSink");
  var submitBtn = $("submitBtn");
  var formError = $("formError");
  var sending = false;
  var watchdog = null;

  formEl.hidden = false;

  function fieldValue(key) {
    if (key === "attending" || key === "meal") {
      var picked = document.querySelector('input[name="' + key + '"]:checked');
      return picked ? picked.value : "";
    }

    // The form has one question for the party, so the count and the names are
    // joined into it: "3 — Amy Chen, Ben Ortiz". The number stays first so the
    // dashboard still reads it as the seat count.
    if (key === "party" && askNames) {
      var count = $("f-party").value.trim();
      var names = $("f-partyNames").value
        .split(/[\n,]+/)
        .map(function (n) { return n.trim(); })
        .filter(Boolean)
        .join(", ");
      if (!count) return names;
      return names ? count + " \u2014 " + names : count;
    }

    var input = $("f-" + key);
    return input ? input.value.trim() : "";
  }

  // The visible form is never the thing that posts. A throwaway form carrying
  // only Google's entry.NNN fields is built here and submitted instead, so the
  // payload contains exactly what Google expects and nothing else — the
  // visible inputs can keep whatever names read well in the markup.
  function submitToGoogle() {
    var payload = document.createElement("form");
    payload.action = postUrl;
    payload.method = "POST";
    payload.target = "gformSink";
    payload.style.display = "none";

    var attending = fieldValue("attending");
    var isYes = attending === yesLabel;

    Object.keys(entries).forEach(function (key) {
      var entryName = (entries[key] || "").trim();
      if (!entryName) return;

      // A decline should not carry a party size or a meal with it.
      if (!isYes && (key === "party" || key === "meal" || key === "dietary" || key === "song")) return;

      var value = fieldValue(key);
      if (!value) return;

      var hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = entryName;
      hidden.value = value;
      payload.appendChild(hidden);
    });

    document.body.appendChild(payload);
    payload.submit();
    document.body.removeChild(payload);
  }

  function showDone() {
    var attending = fieldValue("attending");
    var isYes = attending === yesLabel;

    $("doneTitle").textContent = isYes ? "Wonderful" : "Thank you for letting us know";
    $("doneBody").textContent = isYes
      ? "Your reply is in. We cannot wait to see you on April 15th."
      : "We are sorry to miss you, and glad you told us. We will raise a glass to you anyway.";

    formEl.hidden = true;
    $("done").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  formEl.addEventListener("submit", function (e) {
    // This form never posts itself; submitToGoogle() sends a built payload.
    e.preventDefault();
    if (sending) return;

    var problems = validate();
    if (problems.length) {
      formError.hidden = true;
      var first = $("f-" + problems[0]) || $("e-" + problems[0]);
      if (first && first.scrollIntoView) first.scrollIntoView({ behavior: "smooth", block: "center" });
      if (first && first.focus) first.focus({ preventScroll: true });
      return;
    }

    sending = true;
    formError.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    submitToGoogle();

    // The iframe's load event is the only signal we get. If it never comes —
    // offline, or the request hangs — hand the form back rather than leaving
    // the guest staring at "Sending…".
    watchdog = setTimeout(function () {
      if (!sending) return;
      sending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Send our reply";
      formError.textContent =
        "That did not go through — please check your connection and try again, " +
        "or email us and we will add you by hand.";
      formError.hidden = false;
    }, 12000);
  });

  sink.addEventListener("load", function () {
    // Fires once when the page loads with the frame empty; ignore that one.
    if (!sending) return;
    clearTimeout(watchdog);
    sending = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Send our reply";
    showDone();
  });

  $("againBtn").addEventListener("click", function () {
    $("done").hidden = true;
    formEl.hidden = false;
    formEl.reset();
    syncAttending();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  syncAttending();
})();
