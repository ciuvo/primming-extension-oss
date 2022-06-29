/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 *
 * client for the Primming API
 *
 * - fetch the list of sites to monitor for price changes
 * - submit the result
 */
class PrimmingClient {

    /**
     * @param endpoint
     * @param uuid
     */
    constructor(endpoint, uuid) {
        this.endpoint = endpoint;
        this.uuid = uuid;
    }

    /**
     * Fetch the list of URLs to observe the prices for
     * @returns {Promise<unknown>}
     */
    async fetchObservedPages() {

        const request = new XMLHttpRequest();
        const urllist_url = this.endpoint + "urllist/" + encodeURIComponent(this.uuid);

        var pLoadURLs = new Promise((resolve, reject) => {
            request.open("GET", urllist_url);
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    let pages = JSON.parse(request.responseText)['pages'];
                    let urls = [];
                    for (var i=0; i<pages.length; i++) {
                        urls.push(pages[i]["url"])
                    }
                    resolve(urls);
                } else {
                    reject({ status: this.status, statusText: request.statusText });
                }
            };
            request.send();
        });

        return pLoadURLs;
    }

    /**
     * Fetches the users survey status
     * @returns {Promise<unknown>}
     */
    async hasCompletedSurvey() {

        const request = new XMLHttpRequest();
        const url = this.endpoint + "surveyed/" + encodeURIComponent(this.uuid);

        var pLoadStatus = new Promise((resolve, reject) => {
            request.open("GET", url);
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    let status = JSON.parse(request.responseText)['completed'];
                    resolve(status);
                } else {
                    reject({ status: this.status, statusText: request.statusText });
                }
            };
            request.send();
        });

        return pLoadStatus;
    }

    /**
     * submit the results
     * @param listOfUrlPriceTuples
     * @returns {Promise<unknown>}
     */
    async submitPrices(listOfUrlPriceTuples) {
        console.log("---- Sending to Primming API ----", listOfUrlPriceTuples);
        const request = new XMLHttpRequest();
        const submit_prices_url = this.endpoint
            + "prices/" + encodeURIComponent(this.uuid);

        var pSendPrices = new Promise((resolve, reject) => {
            request.open("POST", submit_prices_url);
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(request.responseText);
                } else {
                    reject({ status: this.status, statusText: request.statusText });
                }
            };
            request.send(JSON.stringify(listOfUrlPriceTuples));
        });

        return pSendPrices;
    }
}