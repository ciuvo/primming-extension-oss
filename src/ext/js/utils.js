/**
 * Create and return a "version 4" RFC-4122 UUID string.
 *
 * randomUUID.js - Version 1.0
 *
 * Copyright 2008, Robert Kieffer
 *
 * This software is made available under the terms of the Open Software
 * License v3.0
 * (available here: http://www.opensource.org/licenses/osl-3.0.php )
 *
 * The latest version of this file can be found at:
 * http://www.broofa.com/Tools/randomUUID.js
 *
 * For more information, or to comment on this, please go to:
 * http://www.broofa.com/blog/?p=151
 */
function generateRandomUUID() {
    var s = [], itoh = "0123456789ABCDEF";

    // Make array of random hex digits. The UUID only has 32 digits in it,
    // but we allocate an extra items to make room for the '-'s we'll be
    // inserting.
    for (var i = 0; i < 36; i++) {
        s[i] = Math.floor(Math.random() * 0x10);
    }

    // Conform to RFC-4122, section 4.4
    s[14] = 4; // Set 4 high bits of time_high field to version
    s[19] = (s[19] & 0x3) | 0x8; // Specify 2 high bits of clock sequence

    // Convert to hex chars
    for (i = 0; i < 36; i++) {
        s[i] = itoh[s[i]];
    }

    // Insert '-'s
    s[8] = s[13] = s[18] = s[23] = "-";
    return s.join("");
}

class BrowserAPI {
    /**
     * async wrapper for chrome.tabs.update()
     * 
     * @param {number} tabId
     * @param {object} updateProperties
     */
    static async updateTab(tabId, updateProperties) {
        // before polyfill, the chrome compat code was:
        // return new Promise((resolve, reject) => {
        //     browser.tabs.update(tabId, updateProperties, (result) => resolve(result));
        // });
        return browser.tabs.update(tabId, updateProperties);
    }

    /**
     * async wrapper for chrome.tabs.create()
     */
    static async openNewTab(active) {
        // before polyfill, the chrome compat code was:
        // return new Promise((resolve, reject) => {
        //     browser.tabs.create({
        //         "active": false,
        //     }, resolve);
        // });
        if (typeof active === "undefined") {
            active = false;
        }
        return browser.tabs.create({ "active": active })
    }

    /**
     * Async wrapper for chrome API
     * @param {number} tabId 
     * @param {object} details 
     */
    static async executeScript(tabId, details) {
        // before polyfill, the chrome compat code was:
        // return new Promise((resolve, reject) => {
        //     browser.tabs.executeScript(tabId, details, (result) => { resolve(result) });
        // });
        return browser.tabs.executeScript(tabId, details);
    }

    /**
     * Async wrapper for chrome API
     * @param {number} tabId 
     * @param {object} details 
     */
    static async injectCSS(tabId, details) {
        // we're using polyfill so instead of async wrapping it is just a proxy
        return browser.tabs.insertCSS(tabId, details);
    }

    /**
     * remove the tab once we're done
     * @param {number} tabId 
     */
    static removeTab(tabId) {
        browser.tabs.remove(tabId);
    }
}