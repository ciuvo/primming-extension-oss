/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 */

/**
 * run the ciuvo csl scraper to extract the price
 * @param {string} csl_code 
 */
async function runScraper(csl_code) {
    return new Promise((resolve, reject) => {
        var interpreter = new ciuvoSDK.Interpreter(
            window, resolve, reject
        );
        interpreter.interpret(csl_code);
    });
}

/**
 * listen for messages from the background script
 */
browser.runtime.onMessage.addListener(async function (request, sender) {
    console.log(request);
    // Callback
    switch (request.action) {
        case "scrape":
            await waitForDocument();  // defined in contentscript-overlay.js
            return runScraper(request.scraper).then((result) => {
                return {
                    "value": result["price"],
                    "currency": result["currency"]
                };
            }).catch((e) => {
                return e
            })
    }
})
