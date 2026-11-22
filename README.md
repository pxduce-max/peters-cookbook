# Peter’s Cookbook

32 searchable recipes and 23 original recipe PDFs. Installable as a progressive web app, with offline access after the first successful online load.

## Put it on GitHub Pages

1. Create a GitHub repository called peters-cookbook. A public repository supports GitHub Pages on GitHub Free.
2. Unzip this download. Open the peters-cookbook folder and upload its contents to the repository. index.html, app.js and the pdfs and icons folders must be at the repository root.
3. Commit the upload to the main branch.
4. Open the repository’s Settings, then Pages.
5. Under Build and deployment, choose Deploy from a branch. Select main and / (root), then Save.
6. Wait for the Pages deployment to finish. The Pages settings show the website address. Open that address while connected and wait for “Recipes and PDFs ready offline” at the bottom.

A public GitHub repository and its Pages website make the included recipes and PDFs available to anyone.

## Install as an app

- iPhone or iPad. Open the published address in Safari. Open Share, then Add to Home Screen. Enable Open as Web App if offered.
- Android. Open the published address in Chrome, then use Install cookbook when it appears, or the browser menu’s Install app / Add to Home screen option.
- Mac. Open the address in Safari and use File, then Add to Dock. Chrome also provides an install control on supported devices.
- Windows. Open the address in Edge or Chrome and use the browser’s install app control.

Exact menu names vary by browser version. Installation needs an HTTPS website such as GitHub Pages. Opening index.html directly from the ZIP does not enable offline installation.

## Offline use and updates

The app saves its interface, recipe text, icons and all 23 PDFs during the first successful online visit. Wait for the offline-ready message before relying on it without a connection. Browser storage can be cleared by the browser or device.

The paths are relative, so the app supports both a repository address such as /peters-cookbook/ and a custom domain.

To publish changes, edit the files in the repository and commit them. Whenever application files change, change the CACHE_NAME value in sw.js, for example from cookbook-v1 to cookbook-v2. Add any new assets or PDFs to PRECACHE_URLS in sw.js. Open the app online to download the update, then close all cookbook tabs and reopen it.

## Contents

- index.html, style.css, app.js and recipes.js provide the cookbook.
- manifest.webmanifest, install.js, sw.js and icons/ provide app installation and offline access.
- pdfs/ contains the original recipe files.

No build tools or package installation are required.

## Local preview

From this folder run python3 -m http.server 8000, then open http://localhost:8000. Localhost supports service workers for development.

## GitHub guidance

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Shopping cart

Open any recipe and choose **Add to cart**. Add more recipes, then open **Shopping cart** to tick off ingredients. The cart shows one alphabetical list and combines matching ingredients with compatible units. Manage recipes to remove a dish. Your list and ticks are saved in the browser or installed app you use to shop and work offline once the cookbook is cached.

For an existing GitHub Pages copy, overwrite the files with the contents of this package and commit the update. Open the published app online, then close all cookbook tabs and reopen it to activate the update.


## Check the update

Open the published GitHub Pages address while connected. Refresh once after the
deployment finishes. **Version 6** at the bottom identifies the update that removes the outline around recipe titles. On an existing installation, reopen the cookbook if the previous
version is still on screen. Use the same site address to keep your saved cart.
