/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 *
 */
let _defaults = {
    //ciuvo_api_endpoint: "https://api.ciuvo.com/api/",
    //ciuvo_api_endpoint: "https://plugin.dynamic-pricing.at/watcher/api/1.0/scraper/",
    ciuvo_api_endpoint: "https://localhost/watcher/api/1.0/scraper/",
    ciuvo_partner_tag: "ait_primming",
    surveyed: "false",
    //primming_api_endpoint: "https://plugin.dynamic-pricing.at/watcher/api/1.0/",
    primming_api_endpoint: "https://localhost/watcher/api/1.0/",
    //survey_url_base: "https://plugin.dynamic-pricing.at/survey/"
    survey_url_base: "https://localhost/survey/"
}

class SettingsManager {

    /**
     * 
     * @param {*} defaults 
     */
    constructor(defaults) {
        if (typeof defaults === "undefined") {
            this.defaults = _defaults;
        } else {
            this.defaults = defaults;
        }

        this.state = {};
        // using the sync as storage
        this.storage_key = "settings-state";
        this.storage = browser.storage.sync;
    }

    /**
     * load from extension storage
     */
    async load() {
        // TODO actually load from storage API
        this.state = await this._load_state();
        return this;
    }

    /**
     * helper, override if the browser isn't supported by the polyfill
     */
    async _load_state() {
        let result = (await this.storage.get([this.storage_key]))[this.storage_key];
        if (typeof result !== "object") {
            return {};
        } else {
            return result
        }
    }

    /**
     * Get a settings value
     * @param {string} key name of the setting
     */
    get(key) {
        return this.state[key] || this.defaults[key];
    }

    /**
     * Store a settings value
     */
    set(key, value) {
        // TODO: actually use storage api
        this.state[key] = value;
        this.storage.set({ [this.storage_key]: this.state });
    }

    // convenience getters

    /**
     * endpoint for the primming API
     */
    get primming_endpoint() {
        return this.get("primming_api_endpoint");
    }

    /**
     * endpoint for the ciuvo API
     */
    get ciuvo_endpoint() {
        return this.get("ciuvo_api_endpoint");
    }

    /**
     * convenience access
     */
    get ciuvo_partner_tag() {
        return this.get("ciuvo_partner_tag");
    }

    /**
     * get the UUID or create a new one
     */
    get uuid() {
        return this.state["uuid"] || this.createUUID();
    }

    /**
     * wether the usr is surveyed or not
     */
    get started_survey() {
        let surveyed = this.get("started_survey");
        if (typeof (surveyed) === "string") {
            return surveyed === "true";
        }
        return surveyed === true;
    }

    /**
     * get the survey url
     */
    get survey_url() {
        return this.get("survey_url_base") + this.uuid;
    }

    /**
     * create & store a new UUID
     */
    createUUID() {
        let uuid = generateRandomUUID();
        this.set("uuid", uuid);
        return uuid;
    }
}