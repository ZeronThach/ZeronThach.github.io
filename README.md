# Zeron Thach — Portfolio

The front page is an investigation board: your photo pinned at the top, red string running out to your resume, project Polaroids, an experience timeline, a skills sheet and a contact card. Every pinned item is a link to its own page.

- **Dark** (the default) is night at the corkboard. On phones the board becomes a clean stack of case files.
- **Light** shows the same content as a clean typed case report.
- **The hanging lamp** at the top switches between the two. The choice is remembered.

## Where to put your content

All content is written directly in the HTML files. Each page has a comment that marks where your content goes.

| What | File |
| --- | --- |
| Your photo and intro | `about.html` (the photo on the board is in `index.html`; search for `Your photo`) |
| Resume | `resume.html` |
| Projects 1–5 | `projects/project-01.html` … `project-05.html` |
| Timeline entries 1–5 | `experience/entry-01.html` … `entry-05.html` |
| Skills | `skills.html` |
| Contact | `contact.html` |

The board in `index.html` shows placeholder bars (they look like redacted lines). Replace them with real text when you're ready: for example change `<span class="date">20XX</span>` to `<span class="date">2025</span>`, and change `Project 01` to your project's name.

### Adding pictures

1. Create an `assets/img` folder and upload your images there.
2. In `index.html`, each Polaroid has a comment like `<!-- <img src="assets/img/project-01.jpg" alt=""> -->`. Remove the `<!--` and `-->` and change the file name. On the board, photos show in muted black-and-white and turn to full color when someone points at them.

File names are case-sensitive: `Photo.PNG` and `photo.png` are different files.

## Moving things around on the board

Each pinned item in `index.html` has a `style` like `--x:10;--y:21;--w:17.5;--r:-1.5`:

- `--x` / `--y`: distance from the board's left / top edge, as a percent of the board
- `--w`: width, as a percent of the board's width
- `--r`: tilt in degrees

The strings follow automatically. To add or remove a string, edit the `STRINGS` list at the top of `js/board.js`.

## Colors and fonts

Colors are at the top of `css/style.css`: the first block is the night board, the second is the daylight report. Fonts: Special Elite (typewriter labels), Caveat (handwriting), IBM Plex Sans (body text).

## Previewing on your computer

Run this from the repository folder, then open http://localhost:8000:

```
python -m http.server 8000
```

Opening `index.html` by double-clicking also works, but some browsers block parts of local files.

## Project structure

```
index.html            the board (front page)
about.html            you
resume.html           resume
skills.html           skills
contact.html          contact
projects/             one page per project
experience/           one page per timeline entry
css/style.css         all styles (board, phone stack, light report, file pages)
js/board.js           lamp switch, strings, hover tracing
```
