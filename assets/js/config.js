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
  // Paste the Google Form URL here.
  //   1. Build the form at https://forms.google.com
  //   2. Send > link icon (<>) > copy the URL inside src="..."
  //      It looks like: https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true
  //   3. Paste it below and redeploy. Until then the page shows a friendly
  //      "RSVP opening soon" card instead of a broken embed.
  rsvpFormUrl: "",

  // Deadline shown on the RSVP page and in the FAQ.
  rsvpDeadline: "2027-02-15T23:59:00-05:00",
  rsvpDeadlineLabel: "February 15, 2027",

  // ---- Contact ----------------------------------------------------------
  contactEmail: "kyuminleolee@gmail.com",

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
