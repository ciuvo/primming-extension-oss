# Primming Extension

Workflow
--------
 - creates and stores an unique user id (settings.js)
 - opens registry page if the user is unsurveyed (usersurvey.js)
 - regularly executes the “price-fetcher” (pricefetcher.js) task, remembers it's 
   last execution time over browser restart (cron.js):
     - fetch list of urls from the backend (primming-client.js)
     - open page in a new, unfocused tab (pricefetcher.js)
     - fetch the scraper for the pages (ciuvo-client.js) 
     - show overlay with info in the tab for the user (contentscript-overlay.js)
     - scrape price (contentscript.js)
 - submit price to the backend (primming-client.js)

Entry point is, of course, "background.js".

This project uses the
[webextension-polyfill](https://github.com/mozilla/webextension-polyfill) library as a 
compatibility layer between FF and Chrome.

Settings
--------

We didn't set up any fancy environment control mechanism. Just edit the `settings.js` to change the
URLs to the backend you want to use (production / development / etc.)

Chrome
------

Just open "chrome://extensions", enable developer mode and load and extracted extension
by selecting the "src/ext" directory. To debug the brackground script open the
background.html. To debug the content script open the debugger in the tab (CTRL+F11)
and select the extension context from the drop down.

Firefox
--------

Install the web-ext npm tool:
```bash
$> npm install
```

To run the extension
```bash
 $> web-ext run --source-dir src/ext/ 
 # optionally specify the firefox executeable
 $> web-ext run --source-dir src/ext/ --firefox /usr/bin/firefox-bin-wayland 
 ```

To debug the extension open "about:addons", click on the cogwheel, click on debug
extensions, then select the extension to debug and click inspect. You can't debug
in the context of the contentscript. Yes, developing with FF is a pain.
