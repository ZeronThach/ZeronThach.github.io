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
  email: "ZeronThach04.com",

  // Links shown under your name. Add or remove lines as you like.
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/zeron-t-383598283/" },
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


  // ---------- Contact section ----------
  contactNote: "The fastest way to reach me is email. I'm happy to talk about roles, projects, or anything on this page.",

};
