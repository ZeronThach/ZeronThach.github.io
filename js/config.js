/*
  ============================================================
  THIS IS THE ONLY FILE YOU NEED TO EDIT.
  ============================================================

  How to edit it safely:
  - Only change the text inside the quotes "like this".
  - Keep every quote, comma, and bracket in place.
  - If the page shows a red banner after you save, there's a
    typo in this file. Usually it's a missing comma or quote
    near the last line you changed.
  - To hide something, leave its quotes empty: ""
  - To remove a whole project or job, delete everything from
    its opening {  to its closing },  (including the comma).
*/

const SITE = {

  // ---------- About you ----------
  name: "Zeron Thach",
  role: "",   // shown in the browser tab
  intro: "One or two sentences about what you build and what kind of role you're looking for.",

  // Your email. It's used for the contact button. Leave "" to hide the contact section.
  email: "Email: ZeronThach04.com",

  // Links shown under your name. Add or remove lines as you like.
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/zeron-t-383598283/" },
    { label: "Email", url: "mailto:ZeronThach04.com" }
  ],

  // Upload your resume to the assets folder and put its file name here,
  // for example "assets/resume.pdf". Leave "" to hide the Resume link.
  resume: "",


  // ---------- Projects ----------
  // The FIRST project is shown larger, so put your best one first.
  // image: upload a screenshot to assets/img and put its path here,
  //        for example "assets/img/my-project.png". Leave "" for no image.
  //        File names are case-sensitive: "Photo.PNG" is not "photo.png".
  projects: [
    {
      name: "Example Project",
      description: "What problem does it solve, and for whom? Then say what you built and the most interesting thing you figured out along the way.",
      tech: ["Python", "Flask", "PostgreSQL"],
      image: "",
      imageAlt: "Screenshot of Example Project",
      links: [
        { label: "Live demo",   url: "https://example.com" },
        { label: "Source code", url: "https://github.com/your-username/example-project" },
      ],
    },
    {
      name: "Second Project",
      description: "A short summary of what it does and what you learned building it.",
      tech: ["JavaScript", "React"],
      image: "",
      imageAlt: "",
      links: [
        { label: "Source code", url: "https://github.com/your-username/second-project" },
      ],
    },
  ],


  // ---------- Experience and education ----------
  // List these newest first. Leave the list empty, like  experience: [],  to hide the section.
  experience: [
    {
      dates: "May 2025 – Aug 2025",
      title: "Software Developer Intern",
      place: "Company Name",
      description: "What you worked on, the tools you used, and one concrete result.",
    },
    {
      dates: "Expected 2027",
      title: "B.S. Computer Science",
      place: "University Name",
      description: "Relevant coursework: a few courses that match the jobs you want.",
    },
  ],
  
    // ---------- Space background ----------
   // Planets down one side, a rocket that follows visitors as they scroll
  // (showing how far it is from Earth), and space objects they can drag and flick.
  // It only shows on screens wide enough to have room beside your content.
  //
  // Pictures: leave image as "" to use the built-in drawing, or upload your own
  // to assets/img and put its path here. PNG files with a transparent background
  // look best (otherwise you'll see a box around the planet).
  space: {
    on: true,                 // false turns the whole space background off
    planetsSide: "left",      // "left" or "right". The draggable objects go on the other side.
    planetPeek: 0.6,          // how much of each planet sticks out from the edge (0.5 = half, 1 = all)

    // A picture of a rocket should point UP; the site turns it to face the way it's flying.
    rocket: { image: "", size: 56 },

    // The rocket passes these from top to bottom. Add, remove, or reorder them freely.
    //   size:     width in pixels on a large screen (smaller screens shrink everything to fit)
    //   gap:      how much space comes before this planet compared to the others.
    //             1 = normal, 2 = twice as far, 0.5 = half as far. The first planet is always at the top.
    //   distance: the text shown next to the rocket as it passes
    planets: [
      { name: "Earth",   distance: "Liftoff",         image: "", size: 150, gap: 1 },
      { name: "Mars",    distance: "78 million km",   image: "", size: 120, gap: 3 },
      { name: "Jupiter", distance: "629 million km",  image: "", size: 300, gap: 5 },
      { name: "Saturn",  distance: "1.28 billion km", image: "", size: 400, gap: 4 },
      { name: "Uranus",  distance: "2.72 billion km", image: "", size: 190, gap: 3 },
      { name: "Neptune", distance: "4.35 billion km", image: "", size: 170, gap: 3 },
      { name: "Pluto",   distance: "5.76 billion km", image: "", size: 75,  gap: 3 },
    ],

    // Objects visitors can drag and flick, listed top to bottom.
    //   drawing: built-in picture to use when image is "". Options: "iss", "astronaut",
    //            "satellite", "ufo", "comet", "star", "sparkle"
    //   size:    width in pixels on a large screen
    objects: [
      { drawing: "iss",       image: "", size: 210 },
      { drawing: "sparkle",   image: "", size: 52 },
      { drawing: "astronaut", image: "", size: 90 },
      { drawing: "sparkle",   image: "", size: 40 },
      { drawing: "satellite", image: "", size: 150 },
      { drawing: "sparkle",   image: "", size: 58 },
      { drawing: "ufo",       image: "", size: 130 },
      { drawing: "comet",     image: "", size: 180 },
      { drawing: "sparkle",   image: "", size: 40 },
      { drawing: "sparkle",   image: "", size: 46 },
    ],
  },


  // ---------- Contact section ----------
  contactNote: "The fastest way to reach me is email. I'm happy to talk about roles, projects, or anything on this page.",

};
