# Portfolio Website Template

A simple, clean portfolio site you can have online for free in about 15 minutes, even if you've never used GitHub or written code. Everything you need to change is in **one file**: `js/config.js`.

---

## Step 1: Make your own copy

1. Create a free account at [github.com](https://github.com) if you don't have one. Pick your username carefully, because it becomes part of your website address.
2. At the top of this page, click the green **Use this template** button, then **Create a new repository**.
3. For **Repository name**, type exactly: `your-username.github.io` (with your real GitHub username, all lowercase). This special name is what makes GitHub host it as a website.
4. Make sure **Public** is selected, then click **Create repository**.

> Downloaded this as a zip instead? See [Uploading files manually](#uploading-files-manually) below.

## Step 2: Turn on the website

1. In your new repository, click **Settings** (near the top right).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set the branch to **main** and the folder to **/ (root)**, then click **Save**.
5. Wait one or two minutes, then visit `https://your-username.github.io`. You should see the template with "Your Name" on it.

## Step 3: Add your information

You can do all of this in your web browser.

1. In your repository, click the **js** folder, then click **config.js**.
2. Click the **pencil icon** (Edit this file) near the top right of the file.
3. Replace the example text with your own. Only change text **inside the quotes**, and keep all the commas and brackets.
4. When you're done, click the green **Commit changes** button, then **Commit changes** again in the popup.
5. Wait a minute and refresh your site. Your changes appear every time you commit.

If you see a **red banner** at the top of your site, there's a typo in `config.js`. Look near the last line you changed for a missing comma `,`, quote `"`, or bracket.

## Step 4: Add screenshots and a resume (optional)

1. Open the **assets/img** folder in your repository.
2. Click **Add file → Upload files**, drag in your screenshot, and click **Commit changes**.
3. In `config.js`, set that project's `image` to the file's path, for example `"assets/img/my-project.png"`.

For a resume, upload your PDF to the **assets** folder the same way and set `resume` to something like `"assets/resume.pdf"`.

---

## Uploading files manually

If you have the template as a zip file instead of using the template button:

1. Unzip it on your computer.
2. On GitHub, click the **+** in the top right, then **New repository**. Name it `your-username.github.io`, keep it **Public**, and click **Create repository**.
3. On the next page, click the link that says **uploading an existing file**.
4. Open the unzipped folder, select everything **inside** it (`index.html`, `css`, `js`, `assets`, `README.md`), and drag it all onto the GitHub page. Don't drag the outer folder itself, or your site won't be found.
5. Click **Commit changes**, then follow [Step 2](#step-2-turn-on-the-website).

## Previewing on your computer

Before uploading, you can double-click `index.html` to open it in your browser. If you edit `config.js` on your computer, use a plain-text editor such as [VS Code](https://code.visualstudio.com) (free) or Notepad. Avoid Word, and on a Mac, TextEdit will only work if you choose **Format → Make Plain Text** first.

## Changing the colors

Open `css/style.css`. The colors are listed at the very top as hex codes like `#1f6f5c`. Search "color picker" online to find new codes and paste them in. The first block is light mode; the next two blocks are dark mode and should stay identical to each other.

## Troubleshooting

**My site shows "404 / There isn't a GitHub Pages site here."** Check that the repository name is exactly `your-username.github.io`, that `index.html` is at the top level (not inside another folder), and that Pages is turned on (Step 2). The first deploy can take a few minutes.

**My changes aren't showing.** Wait a minute, then do a hard refresh: Ctrl+Shift+R on Windows, or Cmd+Shift+R on Mac.

**My image doesn't appear.** File names must match exactly, including capital letters and the extension. `Project.PNG` and `project.png` are different files to GitHub.

**A section disappeared.** Sections hide themselves when they're empty. For example, leaving `email` as `""` hides the Contact section.

---

## Project structure

```
index.html          page structure (no need to edit)
js/config.js        YOUR CONTENT: edit this file
js/main.js          builds the page from config.js (no need to edit)
css/style.css       colors, fonts, and layout
assets/             your resume PDF
assets/img/         your project screenshots
```
