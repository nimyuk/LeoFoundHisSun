/* ==========================================================================
   SITE CONFIG — edit this file to update the site. Nothing else required.
   Everything a non-developer is likely to change lives here or in index.html.
   ========================================================================== */

window.WEDDING_CONFIG = {
  // ---- The couple -------------------------------------------------------
  partnerOne: "Leo",
  partnerTwo: "Yoonsun",

  // ---- The date ---------------------------------------------------------
  // ISO 8601 with timezone offset. April 15, 2027 is a Thursday.
  // -04:00 is Eastern Daylight Time, which Virginia observes in April.
  // Set this to the actual ceremony start time once it is locked in.
  ceremonyStart: "2027-04-15T16:30:00-04:00",
  receptionEnd: "2027-04-15T22:30:00-04:00",

  // ---- RSVP -------------------------------------------------------------
  // The address of your Google Form, and NOTHING else.
  //
  // Google's embed tab hands you a whole block of HTML that looks like this:
  //
  //   <iframe src="https://docs.google.com/forms/d/e/ABC.../viewform?embedded=true"
  //           width="640" height="853" frameborder="0">Loading…</iframe>
  //
  // Do not paste that. Take only the address between the quotes after src=,
  // and nothing outside them — no <iframe, no width, no </iframe>. The rest of
  // that HTML is already built into the page.
  //
  //   RIGHT: "https://docs.google.com/forms/d/e/ABC.../viewform?embedded=true"
  //   WRONG: "<iframe src="https://..." width="640"></iframe>"
  //
  // The wrong version also breaks this file outright: its quotes close this
  // string early, which is a syntax error, and a syntax error here stops the
  // whole file loading — taking the countdown down with it.
  rsvpFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSePlNg1BRF5POfW7--i5_k4iAJMByk1mj0IlHlOl_PdUA17jw/viewform?embedded=true",

  // Deadline shown on the RSVP page and in the FAQ.
  rsvpDeadline: "2027-02-15T23:59:00-05:00",
  rsvpDeadlineLabel: "February 15, 2027",

  // ---- The RSVP form on our own page (rsvp.html) -------------------------
  // Guests fill in a form styled like the rest of the site; it posts to the
  // Google Form above, so answers still land in the same spreadsheet.
  //
  // Google identifies each question by a number like entry.1234567890. To
  // find yours: open the form, click the three dots, "Get pre-filled link",
  // type a throwaway answer into every question, press "Get link", copy it,
  // and read the entry numbers out of it.
  //
  // While these are blank, rsvp.html says the form is not ready yet and
  // offers the Google Form as a fallback, so the page is never broken.
  rsvpForm: {
    entries: {
      name: "",       // e.g. "entry.1234567890"
      email: "",
      attending: "",
      party: "",
      meal: "",
      dietary: "",
      song: "",
      note: "",
    },

    // These must match the options in your Google Form EXACTLY, character for
    // character. Google silently records a blank when a choice does not match.
    attendingYes: "Joyfully accepts",
    attendingNo: "Regretfully declines",
    meals: ["Chicken", "Beef", "Vegetarian"],
  },

  // ---- Contact ----------------------------------------------------------
  contactEmail: "kyuminleolee@gmail.com",

  // ---- Honeymoon fund ---------------------------------------------------
  // Leave `venmo` blank and the section shows a quiet "details coming soon"
  // note instead of a dead button. Fill it in and a button appears.
  //
  // Between the quotes goes the address ALONE. Not the field name, not a
  // comma, not any quotes of its own — those are already here. What you type
  // should look like exactly one of these two lines, and nothing more:
  //
  //   https://venmo.com/u/your-username
  //   @your-username
  //
  // Venmo profiles are public. Anyone with the link can see your name, photo,
  // and any payments you have not marked private — worth checking your privacy
  // settings before this goes on a page you send to sixty people.
  honeymoon: {
    venmo: "https://account.venmo.com/u/leo_lee",
    // Optional second option, if you would rather give guests a choice.
    // Same rules: blank means it does not appear at all.
    otherLabel: "",
    otherUrl: "",
  },

  // ---- Venue ------------------------------------------------------------
  venue: {
    name: "Sweeney Barn",
    street: "9310 Discovery Blvd",
    city: "Manassas",
    state: "VA",
    zip: "20109",
    phone: "(703) 282-3033",
    website: "https://sweeneybarn.com/",
  },
};
