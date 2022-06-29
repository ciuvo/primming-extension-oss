/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 *
 * client for the Ciuvo API
 *
 */
class CiuvoAPIClient {

    /**
     * @param endpoint
     * @param uuid
     */
    constructor(endpoint, partner_tag, uuid) {
        this.endpoint = endpoint;
        this.uuid = uuid;
        this.partner_tag = partner_tag;
    }

    /**
     * Fetch the scraper for this URL
     * @returns {Promise<string>}
     */
    async fetchScraper(url) {
        const request = new XMLHttpRequest();
        const scraper_resource_url = this.endpoint
            + "analyze?tag=" + encodeURIComponent(this.partner_tag)
            + "&uuid=" + encodeURIComponent(this.uuid)
            + "&url=" + encodeURIComponent(url);

        var pLoadCSL = new Promise((resolve, reject) => {
            request.open("GET", scraper_resource_url);
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve((JSON.parse(request.responseText)['csl']));
                } else {
                    reject({ status: this.status, statusText: request.statusText });
                }
            };
            request.send();
        });

        return pLoadCSL;
    }

}