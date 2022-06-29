/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 */

 /**
 * make sure that the document is loaded
 */
async function waitForDocument() {
    if (document.readyState === "complete"
        || document.readyState === "loaded"
        || document.readyState === "interactive") {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", function (event) {
            resolve(event);
        });
    });
}

/**
 * Show an overlay to inform the user about what's happening
 */
function showOverlay() {
    // not using the polyfill in the overlay bc we want to be fast? FIXME?
    let browser = typeof(chrome) !== "undefined" ? chrome : browser;
    
    // adjust title
    document.title = browser.i18n.getMessage("extPrimming");

    // make sure the body is ready
    let body = document.getElementsByTagName("body")[0];
    if (!body) {
        setTimeout(showOverlay, 10); // try again in 10ms
    }
    else if (!document.getElementById("primming-overlay")) {
        // create overlay div
        let div = document.createElement("div");
        div.id = "primming-overlay";

        let paragraph = document.createElement("p");
        paragraph.innerHTML = browser.i18n.getMessage("tabExplaination");

        let img = document.createElement("img");
        img.src = chrome.runtime.getURL("icons/logo.png");
        paragraph.insertBefore(img, paragraph.firstChild);

        div.appendChild(paragraph);

        body.appendChild(div);
    }
}

// show the overlay as early as possible
showOverlay();

// make sure the overlay is still there after the page has completely loaded
waitForDocument().then(showOverlay);
