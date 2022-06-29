/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 */

/**
 * manager to ensure the user regstriation
 */
class UserSurveyManager {

    constructor(settings, primmingClient) {
        this.settings = settings;
        this.primmingClient = primmingClient;
    }

    /**
     * make sure that the user is surveyed
     */
    async ensureSurvey() {
        let complete = await this.primmingClient.hasCompletedSurvey();
        if (complete) {
            return
        }
        
        if (this.settings.started_survey) {
            throw "User has not yet completed the survey!";
        }

        this.settings.set("started_survey", true);
        await this.surveyUser();

        complete = await this.primmingClient.hasCompletedSurvey();
        if (!complete) {
            throw "User left page before completing!";
        }
    }

    /**
     * open the survey page for the user, only continue 
     */
    async surveyUser() {
        let tab = await BrowserAPI.openNewTab(true);
        var surveyTabId = tab.id;

        await BrowserAPI.updateTab(surveyTabId, { "url": this.settings.survey_url });
        
        return new Promise((resolve, reject) => {
            
            var timeoutId = undefined;
            var updateListener = (tabId, changeInfo) => {
                console.log("ChangeInfo", changeInfo);
                if (tabId == surveyTabId
                    && typeof changeInfo.url !== "undefined"
                    && changeInfo.url != this.settings.survey_url) {
                    browser.tabs.onUpdated.removeListener(updateListener);
                    clearTimeout(timeoutId);
                    console.log("User left the survey page");
                    resolve(true);
                }
            }

            timeoutId = setTimeout(()=> {
                browser.tabs.onUpdated.removeListener(updateListener);
                reject("User survey has timed out");
            }, 60 * 60 * 1000);

            browser.tabs.onUpdated.addListener(updateListener);
        });
    }
}