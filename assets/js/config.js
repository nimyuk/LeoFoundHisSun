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

  // ---- Contact ----------------------------------------------------------
  contactEmail: "kyuminleolee@gmail.com",

  // ---- Honeymoon fund ---------------------------------------------------
  // Leave `venmo` blank and the section shows a quiet "details coming soon"
  // note instead of a dead button. Fill it in and a button appears.
  //
  // Either form works:
  //   venmo: "https://venmo.com/u/your-username"   (from Venmo > Me > share)
  //   venmo: "@your-username"                      (turned into a link for you)
  //
  // Venmo profiles are public. Anyone with the link can see your name, photo,
  // and any payments you have not marked private — worth checking your privacy
  // settings before this goes on a page you send to sixty people.
  honeymoon: {
    venmo: "venmo: "https://account.venmo.com/u/leo_lee",",
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
