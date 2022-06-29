/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 */

class PriceFetcherTask {

    /**
     * 
     * @param {PrimmingClient} primmingClient 
     * @param {CiuvoAPIClient} ciuvoAPIClient 
     */
    constructor(primmingClient, ciuvoAPIClient) {
        this.primmingClient = primmingClient;
        this.ciuvoAPIClient = ciuvoAPIClient;
    }

    /**
     * sync verison of async_run()
     */
    run() {
        this.async_run().then((result) => {
            console.log(result);
        }).catch(
            e => { console.log(e.message, e.stack) }
        );
    }

    /**
     * fetch a list of pages, open a new tab, fetch prices, submit prices
     */
    async async_run() {
        const pages = await this._fetchObservedPages();
        const tab = await BrowserAPI.openNewTab();
        let results = [];

        for (const page of pages) {
            try {
                results.push({
                    "url": page,
                    "price": await this._scrapePrice(tab.id, page)
                });
            } catch (e) {
                results.push({
                    "url": page,
                    "error": JSON.stringify([e.message, e.stack])
                });
            }
        }

        BrowserAPI.removeTab(tab.id);
        await this.primmingClient.submitPrices(results);
        return results;
    }

    /**     
     * @param {number} tabId
     * @param {string} page 
     */
    async _scrapePrice(tabId, page) {
        console.log("Scraping - Tab:", tabId, "Page:", page);

        // open page in the given tab
        const loadURLPromise = this._loadURLinTab(tabId, page);
        // fetch the scraper for this url
        const loadScraperPromise = this.ciuvoAPIClient.fetchScraper(page);
        // concurrently await promisses
        let scraper = (await Promise.all([loadURLPromise, loadScraperPromise]))[1];

        // inject scraper interpreter  + contentscript into tab
        await this.waitForTabReady(tabId);
        await this._injectContentOverlay(tabId);  // get the overlay in as early as possible
        await this._injectInterpreter(tabId);
        await this._injectContentScript(tabId);

        // send scraper to contentscript
        return this.scrapePage(tabId, scraper);
    }

    /**
     * Send the scraper to the contentscript, await result
     * @param {number} tabId 
     * @param {string} scraper 
     */
    async scrapePage(tabId, scraper) {
        // TODO: use BrowserAPI shim for sending messages
        let result = await browser.tabs.sendMessage(tabId, { "action": "scrape", "scraper": scraper });
        return result;
    }

    /**
     * Wait fo the navigation events to see if the tab is ready for content scripts to be injected.
     *
     * Problem: after sending and update with a new URL to the tab one can't inject code into it
     * until it has committed to the navigation. Otherwise you'll get a misleading error message
     * "tab has been removed".
     *
     * TODO: move to BrowserAPI
     *
     * @param {number} tabId
     */
    async waitForTabReady(tabId) {
        var maxTime = 5000;

        return new Promise((resolve, reject) => {
            /**
             * ignore empty tabs and events from iframes
             */
            function onNavigationFilter(details) {
                // ignore iframe events
                if (details.frameId === 0 && details.tabId == tabId) {
                    // remove navigation listener, we no longer need to get events
                    chrome.webNavigation.onCommitted.removeListener(onNavigationFilter);
                    resolve(details);
                }
            }

            // listen for navigation events
            chrome.webNavigation.onCommitted.addListener(onNavigationFilter,
                { url: [{ schemes: ["https", "http"] }] }
            );

            // add a maximum timeout
            setTimeout(() => {
                chrome.webNavigation.onCommitted.removeListener(onNavigationFilter);
                resolve({});
            }, maxTime);
        });
    }

    /**
      * Inject the content script + browser compatibility
      * @param {number} tabId 
      */
    async _injectContentOverlay(tabId) {
        await BrowserAPI.injectCSS(tabId, {
            "file": "css/contentscript.css",
            "runAt": "document_start"
        });
        return BrowserAPI.executeScript(tabId, {
            "file": "js/contentscript-overlay.js",
            "runAt": "document_start"
        });
    }

    /**
      * Inject the content script + browser compatibility
      * @param {number} tabId 
      */
    async _injectContentScript(tabId) {
        await BrowserAPI.injectCSS(tabId, {
            "file": "css/contentscript.css",
            "runAt": "document_start"
        });
        await BrowserAPI.executeScript(tabId, {
            "file": "js/lib/browser-polyfill.js",
            "runAt": "document_start"
        });
        return BrowserAPI.executeScript(tabId, {
            "file": "js/contentscript.js",
            "runAt": "document_start"
        });
    }

    /**
     * Inject the interpreter for the scraper into the content script
     * @param {number} tabId 
     */
    async _injectInterpreter(tabId) {
        return BrowserAPI.executeScript(tabId, {
            "file": "js/ciuvo-csl-interpreter.js",
            "runAt": "document_start"
        });
    }

    /**
     * convenience method for updateTab
     * @param {number} tabId 
     * @param {string} url 
     */
    async _loadURLinTab(tabId, url) {
        return BrowserAPI.updateTab(tabId, {
            "muted": true,
            "url": url
        })
    }


    /**
     * get the pages to observe for price adjustments from the backend
     */
    async _fetchObservedPages() {
        return this.primmingClient.fetchObservedPages();
    }
}