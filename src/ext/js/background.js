/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 */
new SettingsManager().load().then((settings) => {
    const primmingClient = new PrimmingClient(settings.primming_endpoint, settings.uuid);
    const ciuvoAPIClient = new CiuvoAPIClient(settings.ciuvo_endpoint, settings.ciuvo_partner_tag,
        settings.uuid);
    const priceFetcherTask = new PriceFetcherTask(primmingClient, ciuvoAPIClient);
    const userSurveyManager = new UserSurveyManager(settings, primmingClient);
    const cronService = new CronService(settings);

    userSurveyManager.ensureSurvey().then(() => {
        cronService.schedule(
            "priceFetcher", () => { priceFetcherTask.run() },
            SCHEDULE_EVERY_1_HOUR
            //SCHEDULE_EVERY_1_MINUTE
        );
    }, (reason) => {
        console.log("User has not completed survey: " + reason);
    });

    // setup browser action
    browser.browserAction.onClicked.addListener(() => {
        userSurveyManager.surveyUser().then(() => { 
            console.log("Opened user survey screen.")
        });
    });

});