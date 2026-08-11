/* ==========================================================================
   RSVP Dashboard — admin.html

   WHAT THIS IS
   A private-ish view of your RSVP responses. You export the CSV from the
   Google Sheet behind your form, drop it here, and this file turns it into
   counts, breakdowns, and a searchable table.

   WHAT IT IS NOT
   Secure. This is a static site: the password check below runs in the
   visitor's browser, so anyone who opens View Source can read this file and
   work out how to get past it. That is a property of static hosting, not a
   bug to be fixed here — a real login needs a server.

   The design compensates by making the gate not matter: no guest data is
   stored in this repository or on this website. Everything you see is parsed
   from the file you loaded, in memory, in your browser. Your real records
   live in Google Sheets behind your Google account, which is properly
   authenticated. Someone who defeats the password below finds an empty
   dashboard.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     CONFIG
     To change the password: run this in any terminal with node installed,
     then paste the result into PASSWORD_HASH.

       node -e "console.log(require('crypto').createHash('sha256')\
         .update('leo-yoonsun-2027::' + 'YOUR_NEW_PASSWORD').digest('hex'))"

     The password is stored as a salted SHA-256 digest rather than plain
     text, so the literal string is not sitting in a public repository. This
     raises the effort required, it does not make it secret — a short
     password like this one falls to a brute-force in seconds by anyone who
     bothers. Treat it as a doorknob, not a deadbolt.
     --------------------------------------------------------------------- */
  var SALT = "leo-yoonsun-2027::";
  var PASSWORD_HASH = "9512c126eb210360fe1eb3b8212c5c1f5baab4b851bafdab8d1cd93dfe70cb42";

  var CAPACITY = 60;              // seats you are planning for
  var AUTH_KEY = "ly-admin-session";
  var DATA_KEY = "ly-admin-data";
  var MAP_KEY = "ly-admin-map";
  var MAX_ATTEMPTS = 5;

  var $ = function (id) { return document.getElementById(id); };

  /* =====================================================================
     AUTH
     ===================================================================== */
  var lock = $("lock");
  var dash = $("dash");
  var lockForm = $("lockForm");
  var lockError = $("lockError");
  var attempts = 0;

  function showError(msg) {
    lockError.textContent = msg;
    lockError.hidden = false;
  }

  function sha256Hex(str) {
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.reject(new Error("insecure-context"));
    }
    var bytes = new TextEncoder().encode(str);
    return window.crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) { return ("00" + b.toString(16)).slice(-2); })
        .join("");
    });
  }

  function unlock() {
    lock.hidden = true;
    dash.hidden = false;
    try { sessionStorage.setItem(AUTH_KEY, "1"); } catch (e) { /* private mode */ }
    restoreSavedData();
  }

  lockForm.addEventListener("submit", function (e) {
    e.preventDefault();
    lockError.hidden = true;

    if (attempts >= MAX_ATTEMPTS) {
      showError("Too many attempts. Reload the page to try again.");
      return;
    }

    sha256Hex(SALT + $("pw").value).then(
      function (hex) {
        if (hex === PASSWORD_HASH) {
          unlock();
        } else {
          attempts++;
          $("pw").value = "";
          showError(
            attempts >= MAX_ATTEMPTS
              ? "Too many attempts. Reload the page to try again."
              : "That is not the password."
          );
        }
      },
      function () {
        showError(
          "This page needs to be opened over https:// (or localhost) — the " +
          "browser will not run the password check on a plain file:// page."
        );
      }
    );
  });

  try {
    if (sessionStorage.getItem(AUTH_KEY) === "1") { unlock(); }
  } catch (e) { /* private mode — just show the lock screen */ }

  $("lockBtn").addEventListener("click", function () {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {}
    location.reload();
  });

  /* =====================================================================
     CSV PARSING
     Handles quoted fields, escaped quotes, and newlines inside cells —
     all of which show up the moment a guest writes a paragraph in a
     "notes" box.
     ===================================================================== */
  function parseCSV(text) {
    var rows = [], row = [], field = "", i = 0, inQuotes = false;
    // Google's CSV export starts with a UTF-8 byte-order mark.
    text = String(text).replace(/^\uFEFF/, "");

    while (i < text.length) {
      var c = text.charAt(i);

      if (inQuotes) {
        if (c === '"') {
          if (text.charAt(i + 1) === '"') { field += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        }
        field += c; i++; continue;
      }

      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ",") { row.push(field); field = ""; i++; continue; }
      if (c === "\r") { i++; continue; }
      if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      field += c; i++;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }

    return rows.filter(function (r) {
      return r.some(function (cell) { return String(cell).trim() !== ""; });
    });
  }

  /* =====================================================================
     COLUMN DETECTION
     Your form's question wording is unknown to me, so every field is
     guessed from the header text and then exposed as a dropdown you can
     correct.
     ===================================================================== */
  var FIELDS = [
    { key: "name",      label: "Name",        hints: ["full name", "your name", "name", "guest", "who"] },
    { key: "attending", label: "Attending?",  hints: ["attend", "rsvp", "will you", "coming", "accept", "join", "regret"] },
    { key: "party",     label: "Party size",  hints: ["how many", "number of", "party size", "number in", "headcount", "total guests"] },
    { key: "meal",      label: "Meal",        hints: ["meal", "entree", "entrée", "dinner choice", "main course", "food choice"] },
    { key: "dietary",   label: "Dietary",     hints: ["dietar", "allerg", "restriction", "intoleran"] },
    { key: "email",     label: "Email",       hints: ["email", "e-mail"] },
    { key: "song",      label: "Song request",hints: ["song", "music", "playlist", "dance floor"] },
    { key: "note",      label: "Note",        hints: ["note", "message", "comment", "anything else", "well wish"] },
    { key: "timestamp", label: "Submitted",   hints: ["timestamp", "submitted", "date"] }
  ];

  function detectColumns(headers) {
    var lower = headers.map(function (h) { return String(h).toLowerCase().trim(); });
    var used = {};
    var map = {};

    FIELDS.forEach(function (field) {
      var best = -1, bestScore = 0;

      lower.forEach(function (header, idx) {
        if (used[idx]) return;
        field.hints.forEach(function (hint) {
          if (header.indexOf(hint) === -1) return;
          // Longer hints are more specific, so they win ties.
          var score = hint.length;
          if (score > bestScore) { bestScore = score; best = idx; }
        });
      });

      if (best !== -1) { map[field.key] = best; used[best] = true; }
    });

    return map;
  }

  /* =====================================================================
     VALUE INTERPRETATION
     ===================================================================== */
  // Two families of pattern here, and the difference matters. Whole words get
  // \b on both ends so "no" does not fire on "nothing". Stems get \b only at
  // the front, because Google Forms answers inflect them — "Regretfully
  // declines" must match "regret" and "declin".
  var DECLINE_WORDS = /\b(no|nope|not|nay|cannot|can't|cant|won't|wont|unable|sadly)\b/;
  var DECLINE_STEMS = /\b(regret|declin|apolog|afraid)/;
  var ACCEPT_WORDS = /\b(yes|yep|yeah|yay|sure|definitely)\b/;
  var ACCEPT_STEMS = /\b(accept|attend|joyful|delight|coming|count me|will be there|wouldn't miss)/;

  function parseAttending(value) {
    var s = String(value || "").toLowerCase();
    if (!s.trim()) return "unknown";
    // Declines are tested first: "will not be attending" carries both signals.
    if (DECLINE_WORDS.test(s) || DECLINE_STEMS.test(s)) return "no";
    if (ACCEPT_WORDS.test(s) || ACCEPT_STEMS.test(s)) return "yes";
    return "unknown";
  }

  function parseParty(value) {
    var m = String(value || "").match(/\d+/);
    if (!m) return null;
    var n = parseInt(m[0], 10);
    return isNaN(n) || n < 0 ? null : n;
  }

  /* =====================================================================
     STATE
     ===================================================================== */
  var state = { headers: [], rows: [], map: {} };

  function cell(row, key) {
    var idx = state.map[key];
    return idx === undefined || idx === null ? "" : String(row[idx] || "").trim();
  }

  function buildGuests() {
    return state.rows.map(function (row) {
      var status = state.map.attending === undefined ? "yes" : parseAttending(cell(row, "attending"));
      var party = parseParty(cell(row, "party"));
      return {
        row: row,
        name: cell(row, "name") || "(no name given)",
        status: status,
        // A "yes" with no party column is one person. A decline seats nobody.
        seats: status === "yes" ? (party === null ? 1 : party) : 0,
        partyRaw: party,
        meal: cell(row, "meal"),
        dietary: cell(row, "dietary"),
        email: cell(row, "email"),
        song: cell(row, "song"),
        note: cell(row, "note"),
        timestamp: cell(row, "timestamp")
      };
    });
  }

  /* =====================================================================
     RENDERING
     Everything below builds nodes and sets textContent. Guests type into
     these fields, so their text is never interpolated into innerHTML.
     ===================================================================== */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderStats(guests) {
    var attendingSeats = 0, declined = 0, unknown = 0;

    guests.forEach(function (g) {
      if (g.status === "yes") attendingSeats += g.seats;
      else if (g.status === "no") declined++;
      else unknown++;
    });

    var stats = [
      { num: guests.length, label: "Responses" },
      { num: attendingSeats, label: "Guests attending", mod: "stat--yes" },
      { num: declined, label: "Parties declined", mod: "stat--no" },
      { num: Math.max(0, CAPACITY - attendingSeats), label: "Seats left" }
    ];
    if (unknown) stats.push({ num: unknown, label: "Unclear replies" });

    var host = $("stats");
    host.textContent = "";
    stats.forEach(function (s) {
      var box = el("div", "stat" + (s.mod ? " " + s.mod : ""));
      box.appendChild(el("span", "stat__num", String(s.num)));
      box.appendChild(el("span", "stat__label", s.label));
      host.appendChild(box);
    });

    var pct = CAPACITY ? Math.min(100, (attendingSeats / CAPACITY) * 100) : 0;
    var fill = $("capacityFill");
    fill.style.width = pct + "%";
    fill.classList.toggle("is-over", attendingSeats > CAPACITY);
    $("capacityLabel").textContent =
      attendingSeats + " of " + CAPACITY + " seats" +
      (attendingSeats > CAPACITY ? " — over by " + (attendingSeats - CAPACITY) : "");

    $("statsPanel").hidden = false;
  }

  function renderTally(host, title, guests, key) {
    var counts = {}, total = 0;

    guests.forEach(function (g) {
      if (g.status !== "yes") return;
      var v = g[key];
      if (!v) return;
      var seats = g.seats || 1;
      counts[v] = (counts[v] || 0) + seats;
      total += seats;
    });

    var block = el("div", "breakdown");
    block.appendChild(el("h3", null, title));

    var names = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    if (!names.length) {
      block.appendChild(el("p", "breakdown__empty", "No column mapped, or nothing chosen yet."));
      host.appendChild(block);
      return;
    }

    names.forEach(function (name) {
      var row = el("div", "breakdown__row");
      row.appendChild(el("span", "breakdown__name", name));
      row.appendChild(el("span", "breakdown__count", String(counts[name])));
      block.appendChild(row);

      var bar = el("div", "breakdown__bar");
      var inner = el("i");
      inner.style.width = (total ? (counts[name] / total) * 100 : 0) + "%";
      bar.appendChild(inner);
      block.appendChild(bar);
    });

    host.appendChild(block);
  }

  function renderNotesList(host, title, guests, key, emptyText) {
    var block = el("div", "breakdown");
    block.appendChild(el("h3", null, title));

    var items = guests.filter(function (g) { return g[key] && g.status !== "no"; });
    if (!items.length) {
      block.appendChild(el("p", "breakdown__empty", emptyText));
      host.appendChild(block);
      return;
    }

    var list = el("ul", "breakdown__list");
    items.forEach(function (g) {
      var li = el("li");
      li.appendChild(el("strong", null, g.name));
      li.appendChild(document.createTextNode(g[key]));
      list.appendChild(li);
    });
    block.appendChild(list);
    host.appendChild(block);
  }

  function renderBreakdowns(guests) {
    var host = $("breakdowns");
    host.textContent = "";
    renderTally(host, "Meal choices", guests, "meal");
    renderNotesList(host, "Dietary needs & allergies", guests, "dietary",
      "Nothing flagged — worth double-checking before you send numbers to the caterer.");
    renderNotesList(host, "Song requests", guests, "song", "No requests yet.");
    $("breakdownPanel").hidden = false;
  }

  var COLUMNS = [
    { key: "name",      label: "Name" },
    { key: "status",    label: "Response" },
    { key: "seats",     label: "Seats" },
    { key: "meal",      label: "Meal" },
    { key: "dietary",   label: "Dietary" },
    { key: "song",      label: "Song" },
    { key: "note",      label: "Note" },
    { key: "email",     label: "Email" },
    { key: "timestamp", label: "Submitted" }
  ];

  function visibleColumns() {
    return COLUMNS.filter(function (c) {
      if (c.key === "name" || c.key === "status") return true;
      if (c.key === "seats") return state.map.party !== undefined;
      return state.map[c.key] !== undefined;
    });
  }

  function renderTable(guests) {
    var table = $("table");
    var cols = visibleColumns();
    table.textContent = "";

    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");
    cols.forEach(function (c) { headRow.appendChild(el("th", null, c.label)); });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    guests.forEach(function (g) {
      var tr = document.createElement("tr");
      cols.forEach(function (c) {
        var td = document.createElement("td");

        if (c.key === "name") {
          td.className = "cell--name";
          td.textContent = g.name;
        } else if (c.key === "status") {
          var label = g.status === "yes" ? "Attending" : g.status === "no" ? "Declined" : "Unclear";
          var mod = g.status === "yes" ? "pill--yes" : g.status === "no" ? "pill--no" : "pill--maybe";
          td.appendChild(el("span", "pill " + mod, label));
        } else if (c.key === "seats") {
          td.textContent = g.status === "yes" ? String(g.seats) : "—";
        } else {
          td.textContent = g[c.key] || "—";
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    $("tableEmpty").hidden = guests.length > 0;
    $("tablePanel").hidden = false;
  }

  /* =====================================================================
     FILTERING
     ===================================================================== */
  function currentGuests() {
    var all = buildGuests();
    var q = ($("search").value || "").toLowerCase().trim();
    var f = $("filter").value;

    return all.filter(function (g) {
      if (f === "yes" && g.status !== "yes") return false;
      if (f === "no" && g.status !== "no") return false;
      if (!q) return true;
      return g.row.join(" ").toLowerCase().indexOf(q) !== -1;
    });
  }

  function refresh() {
    var all = buildGuests();
    renderStats(all);
    renderBreakdowns(all);
    renderTable(currentGuests());
  }

  $("search").addEventListener("input", function () { renderTable(currentGuests()); });
  $("filter").addEventListener("change", function () { renderTable(currentGuests()); });

  $("copyEmails").addEventListener("click", function () {
    var emails = currentGuests()
      .map(function (g) { return g.email; })
      .filter(Boolean)
      .join(", ");

    var btn = $("copyEmails");
    if (!emails) { btn.textContent = "No emails"; }
    else if (navigator.clipboard) {
      navigator.clipboard.writeText(emails).then(
        function () { btn.textContent = "Copied"; },
        function () { window.prompt("Copy these:", emails); }
      );
    } else {
      window.prompt("Copy these:", emails);
    }
    setTimeout(function () { btn.textContent = "Copy emails"; }, 1800);
  });

  /* =====================================================================
     COLUMN MAPPING UI
     ===================================================================== */
  function renderMapping() {
    var grid = $("mappingGrid");
    grid.textContent = "";

    FIELDS.forEach(function (field) {
      var wrap = el("div", "mapping__field");

      var label = el("label", null, field.label);
      label.setAttribute("for", "map-" + field.key);
      wrap.appendChild(label);

      var select = document.createElement("select");
      select.id = "map-" + field.key;

      var none = el("option", null, "— not in my form —");
      none.value = "";
      select.appendChild(none);

      state.headers.forEach(function (header, idx) {
        var opt = el("option", null, header || "(column " + (idx + 1) + ")");
        opt.value = String(idx);
        if (state.map[field.key] === idx) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener("change", function () {
        if (select.value === "") delete state.map[field.key];
        else state.map[field.key] = parseInt(select.value, 10);
        persistIfWanted();
        refresh();
      });

      wrap.appendChild(select);
      grid.appendChild(wrap);
    });

    $("mapping").hidden = false;
  }

  /* =====================================================================
     LOADING DATA
     ===================================================================== */
  function loadError(msg) {
    var box = $("loadError");
    box.textContent = msg;
    box.hidden = false;
  }

  function ingest(text, rememberRaw) {
    $("loadError").hidden = true;

    var rows = parseCSV(text);
    if (rows.length < 2) {
      loadError(
        "That did not look like a responses CSV — I need a header row plus at " +
        "least one response. Make sure you exported from the Sheet, not the form."
      );
      return false;
    }

    state.headers = rows[0];
    state.rows = rows.slice(1);
    state.map = detectColumns(state.headers);

    if (state.map.name === undefined && state.map.attending === undefined) {
      loadError(
        "I could not recognise any columns in that file. Check it is the right " +
        "export, then use the dropdowns below to point me at the right columns."
      );
    }

    $("loader").hidden = true;
    $("changeDataBtn").hidden = false;
    renderMapping();
    refresh();

    if (rememberRaw !== false) persistIfWanted(text);
    return true;
  }

  function persistIfWanted(rawText) {
    var remember = $("rememberData").checked;
    try {
      if (!remember) {
        localStorage.removeItem(DATA_KEY);
        localStorage.removeItem(MAP_KEY);
        return;
      }
      if (rawText) localStorage.setItem(DATA_KEY, rawText);
      localStorage.setItem(MAP_KEY, JSON.stringify(state.map));
    } catch (e) {
      // Storage full or blocked — the dashboard still works for this session.
    }
  }

  function restoreSavedData() {
    var saved;
    try { saved = localStorage.getItem(DATA_KEY); } catch (e) { return; }
    if (!saved) return;

    $("rememberData").checked = true;
    if (!ingest(saved, false)) return;

    try {
      var savedMap = JSON.parse(localStorage.getItem(MAP_KEY) || "null");
      if (savedMap && typeof savedMap === "object") {
        state.map = savedMap;
        renderMapping();
        refresh();
      }
    } catch (e) { /* fall back to auto-detection */ }
  }

  /* --- File drop / picker ---------------------------------------------- */
  var drop = $("drop");
  var fileInput = $("fileInput");

  function readFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () { ingest(String(reader.result)); };
    reader.onerror = function () { loadError("That file could not be read."); };
    reader.readAsText(file);
  }

  drop.addEventListener("click", function () { fileInput.click(); });
  drop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener("change", function () { readFile(fileInput.files[0]); });

  ["dragenter", "dragover"].forEach(function (evt) {
    drop.addEventListener(evt, function (e) {
      e.preventDefault();
      drop.classList.add("is-over");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    drop.addEventListener(evt, function (e) {
      e.preventDefault();
      drop.classList.remove("is-over");
    });
  });
  drop.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) readFile(e.dataTransfer.files[0]);
  });

  // Stop a stray drop anywhere else on the page from navigating away from it.
  window.addEventListener("dragover", function (e) { e.preventDefault(); });
  window.addEventListener("drop", function (e) { e.preventDefault(); });

  $("pasteBtn").addEventListener("click", function () {
    var text = $("pasteArea").value.trim();
    if (!text) { loadError("Nothing pasted yet."); return; }
    ingest(text);
  });

  $("rememberData").addEventListener("change", function () {
    if (!$("rememberData").checked) {
      try {
        localStorage.removeItem(DATA_KEY);
        localStorage.removeItem(MAP_KEY);
      } catch (e) {}
    } else if (state.rows.length) {
      // Re-persisting needs the raw text, which we no longer hold; rebuild it.
      persistIfWanted(toCSV());
    }
  });

  function toCSV() {
    var esc = function (v) {
      var s = String(v === undefined || v === null ? "" : v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return [state.headers].concat(state.rows)
      .map(function (row) { return row.map(esc).join(","); })
      .join("\n");
  }

  $("changeDataBtn").addEventListener("click", function () {
    $("loader").hidden = false;
    $("mapping").hidden = true;
    $("statsPanel").hidden = true;
    $("breakdownPanel").hidden = true;
    $("tablePanel").hidden = true;
    $("changeDataBtn").hidden = true;
    $("pasteArea").value = "";
    fileInput.value = "";
    state = { headers: [], rows: [], map: {} };
  });
})();
