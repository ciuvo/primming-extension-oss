/**
 * Copyright 2020 Ciuvo GmbH. All rights reserved.  This file is subject to the terms and
 * conditions defined in file 'LICENSE', which is part of this source code package.
 *
 * A service which invokes a callback ever *hours but stores the time of the last execution so that
 * it can be determined to run again not based on the current time.
 */
var SCHEDULE_EVERY_1_MINUTE = 1;
var SCHEDULE_EVERY_10_MINUTES = 2;
var SCHEDULE_EVERY_1_HOUR = 3;

ALLOWED_SCHEDULES = {
        [SCHEDULE_EVERY_1_MINUTE]: { "periodInMinutes": 1 },
        [SCHEDULE_EVERY_10_MINUTES]: { "periodInMinutes": 10 },
        [SCHEDULE_EVERY_1_HOUR]: { "periodInMinutes": 60 },
};


class CronService {

    constructor(settings) {
        this.settings = settings;
        this.setting_last_run_prefix = "cron-lastrun-ts-";
        this.knownEvents = {};
        browser.alarms.onAlarm.addListener((alarm) => { this._onAlarm(alarm) });
    }

    /**
     * schedule a task to be executed periodically
     **/
    async schedule(taskName, taskCallback, schedule) {
        let alarmCreateInfo = ALLOWED_SCHEDULES[schedule];
        if (!alarmCreateInfo) {
            throw "Unkown schedule type!";
        }

        this.knownEvents[taskName] = taskCallback;

        let nextRunTime = this._nextRunTime(taskName, alarmCreateInfo);
        /* If the task should have been running within the next 60s, run it right away.
         * The 60s are determined by the chrome API 
         * https://developer.chrome.com/docs/extensions/reference/alarms/#method-create
         */
        if (Date.now() + 60000 > nextRunTime) {
            this._runTask(taskName);
        } else {
            alarmCreateInfo["when"] = nextRunTime;
        }

        await browser.alarms.clear(taskName);
        await browser.alarms.create(taskName, alarmCreateInfo);
    }

    /**
     * calculate the next scheduled run time based of the last run time
     * @param {string} taskName 
     * @param {object} alarmCreateInfo 
     */
    _nextRunTime(taskName, alarmCreateInfo) {
        let lastRunTime = this.settings.get(this.setting_last_run_prefix + taskName);
        if (typeof lastRunTime === "undefined") {
            return 0;
        }
        let periodInMS = alarmCreateInfo["periodInMinutes"] * 60 * 1000;
        return lastRunTime + periodInMS;
    }

    /**
     * react to alarms sent by the chrome alarms framework
     */
    _onAlarm(alarm) {
        this._runTask(alarm.name);
    }

    /**
     * store the execution time of the task
     * @param {string} taskName 
     */
    _runTask(taskName) {
        let task = this.knownEvents[taskName];
        if (typeof task === "function") {
            console.log("Running task " + taskName + " at " + (new Date()));
            task();
            this.settings.set(this.setting_last_run_prefix + taskName, Date.now());
        } else {
            console.log("Got unknown taskName", taskName);
        }
    }
}