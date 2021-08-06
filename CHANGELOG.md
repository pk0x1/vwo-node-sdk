# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.21.0] - 2021-08-05

### Changed

- Sending visitor tracking call for Feature Rollout campaign when `isFeatureEnabled` API is used. This will help in visualizing the overall traffic for the respective campaign's report in the VWO application.


## [1.20.0] - 2021-08-04

### Added

- Added support for JavaScript SDK to connect User Storage Service with `getSettingsFile` API so that settings could be stored and fetched before sending a network call.
- Added support for two new methods - `getSettings` and `setSettings` in User Storage Service. These will be called by SDK, if provided, when `getSettingsFile` API is invoked.

## [1.19.1] - 2021-08-02

### Changed

- Fix code which was using wrong variable to read account ID while generating UUID at the time of integrations callback invocation


## [1.19.0] - 2021-07-29

### Added

- Introducing support for Mutually Exclusive Campaigns. By creating Mutually Exclusive Groups in VWO Application, you can group multiple FullStack A/B campaigns together that are mutually exclusive. SDK will ensure that visitors do not overlap in multiple running mutually exclusive campaigns and the same visitor does not see the unrelated campaign variations. This eliminates the interaction effects that multiple campaigns could have with each other. You simply need to configure the group in the VWO application and the SDK will take care what to be shown to the visitor when you will call the `activate` API for a given user and a campaign.

### Changed

- Update `superstruct` dependency to the latest version.

## [1.18.0] - 2021-07-12

### Added

- Feature Rollout and Feature Test campaigns now supports `JSON` type variable which can be created inside VWO Application. This will help in storing grouped and structured data.

## [1.17.2] - 2021-06-10

### Changed

- Update name of usage metrics keys. Start sending `_l` flag to notify VWO server whether to log or not.

## [1.17.1] - 2021-05-27

## Changed

- `campaignName` will be available in integrations callback, if callback is defined.

## [1.17.0] - 2021-05-18

## Added

- Campaign name will be available in settings and hence, changed settings-schema validations.


## [1.16.0] - 2021-04-29

### Added

- Sending stats which are used for launching the SDK like storage service, logger, and integrations, etc. in tracking calls(track-user and batch-event). This is solely for debugging purpose. We are only sending whether a particular key(feature) is used not the actual value of the key

### Changed

- Removed sending user-id, that is provided in the various APIs, in the tracking calls to VWO server as it might contain sensitive PII data.

- SDK Key will not be logged in any log message, for example, tracking call logs.

- TypeScript files were properly formatted using prettier. Prettier will run on `.ts` files whenever a commit is made.



## [1.15.0] - 2021-04-05

### Added

- Added type declaration file to support [TypeScript](https://www.typescriptlang.org/) projects.


## [1.14.0] - 2021-03-01

### Added

- Expose lifecycle hook events. This feature allows sending VWO data to third party integrations.

### Changed

- Introduce `integrations` key in `launch` API to enable receiving hooks for the third party integrations.

```js
let vwoClientInstance = vwoSDK.launch({
  settingsFile,
  integrations: {
    callback: (properties) => {
      console.log(properties);
    }
  }
});
```

## [1.13.0] - 2021-02-26

### Changed

- Pass meta information from APIs to the User Storage Service's `set` method.

```js
const options = {
  metaData: {
    browser: 'chrome',
    os: 'linux'
  }
};

vwoClientInstance.activate(campaignKey, userId, options);
```

Same for other APIs - `getVariationName`, `track`, `isFeatureEnabled`, and `getFeatureVariableValue`.

- If User Storage Service is provided, do not track same visitor multiple times.

You can pass `shouldTrackReturningUser` as `true` in case you prefer to track duplicate visitors.

```js
const options = {
  shouldTrackReturningUser: true
};

vwoClientInstance.activate(campaignKey, userId, options);
```

Or, you can also pass `shouldTrackReturningUser` at the time of instantiating VWO SDK client. This will avoid passing the flag in different API calls.

```js
let vwoClientInstance = vwoSDK.launch({
  settingsFile,
  shouldTrackReturningUser: true
});
```

If `shouldTrackReturningUser` param is passed at the time of instantiating the SDK as well as in the API options as mentioned above, then the API options value will be considered.

- If User Storage Service is provided, campaign activation is mandatory before tracking any goal, getting variation of a campaign, and getting value of the feature's variable.

**Correct Usage**

```js
vwoClientInstance.activate(campaignKey, userId, options);
vwoClientInstance.track(campaignKey, userId, goalIdentifier, options);
```

**Wrong Usage**

```js
// Calling track API before activate API
// This will not track goal as campaign has not been activated yet.
vwoClientInstance.track(campaignKey, userId, goalIdentifier, options);

// After calling track APi
vwoClientInstance.activate(campaignKey, userId, options);
```

## [1.12.0] - 2021-02-11

### Changed

- Send environment token in every network call initiated from SDK to the VWO server. This will help in viewing campaign reports on the basis of environment.

## [1.11.1] - 2021-01-29

### Changed

- Fix build failure on latest node i.e. `15.0.7` version. Error was because of unhandled promise rejection in test cases.
- Copyright year changes in all files
- Updated format of message in case settings are not fetched to be same as other log messages.

## [1.11.0] - 2021-01-02

### Changed

- `userStorageData` key can be passed in `options` parameter for utilizing already fetched storage data. It also helps in implementing the asynchronous nature of the User Storage Service's `get` method. For more info read [this](https://developers.vwo.com/reference#fullstack-is-user-storage-service-synchronous-or-asynchronous).

## [1.10.0] - 2020-12-02

### Added

- Webhooks support
- New API `getAndUpdateSettingsFile` to fetch and update settings-file in case of webhook-trigger

### Changed

- Polling bugs when settings were updated but not being reflected on instance
- Removed caching util as it causes stale data to be used in case of new settings via polling/webhook

## [1.9.1] - 2020-10-20

### Changed
- `flushEvents` API returns promise to know whether the batch request passes or fails
- If `requestTimeInterval` is passed, it will only set the timer when the first event will arrive
- If `requestTimeInterval` is provided, after flushing of events, new interval will be registered when the first event will arrive
- If `eventsPerRequest` is not provided, the default value of `600` i.e. `10 minutes` will be used
- If `requestTimeInterval` is not provided, the default value of `100` events will be used

```js
vwoClientInstance.flushEvents().then(status => {
  console.log(status); // true/false depending on network request status
})
```

## [1.9.0] - 2020-10-16
### Added
- Added support for batching of events sent to VWO server
- Intoduced `batchEvents` config in launch API for setting when to send bulk events
- Added `flushEvents` API to manually flush the batch events queue whne `batchEvents` config is passed. Note: `batchEvents` config i.e. `eventsPerRequest` and `requestTimeInterval` won't be considered while manually flushing

```js
var settingsFile = await vwoSdk.getSettingsFile(accountId, sdkKey);

vwoSdk.lanuch({
  settingsFile: settingsFile,
  batchEvents: {
    eventsPerRequest: 1000, // specify the number of events
    requestTimeInterval: 10000, // specify the time limit fordraining the events (in seconds)
    flushCallback: (err, events) => console.log(err, events) // optional callback to execute when queue events are flushed
  }
});

// (optional): Manually flush the batch events queue to send impressions to VWO server.
vwoClientInstance.flushEvents();
```

## [1.8.3] - 2020-06-03
### Added
- Added support for polling settingsFile automatically based on the interval provided al the time of using launch API
```js
var settingsFile = await vwoSdk.getSettingsFile(accountId, sdkKey);

vwoSdk.lanuch({
  settingsFile: settingsFile,
  pollInterval: 1000 // ms,
  sdkKey: 'YOUR_SDK_KEY'
})
```

## [1.8.1] - 2020-05-13
### Changed
- Used a util method instead of Object.values since Object.values is not supported in older versions of NodeJs and browsers

## [1.8.0] - 2020-04-29
### Changes
- Update track API to handle duplicate and unique conversions and corresponding changes in `launch` API
- Update track API to track a goal globally across campaigns with the same `goalIdentififer` and corresponding changes in `launch` API
```js
// it will track goal having `goalIdentifier` of campaign having `campaignKey` for the user having `userId` as id.
vwoClientInstance.track(campaignKey, userId, goalIdentifier, options);

// it will track goal having `goalIdentifier` of campaigns having `campaignKey1` and `campaignKey2` for the user having `userId` as id.
vwoClientInstance.track([campaignKey1, campaignKey2], userId, goalIdentifier, options);

// it will track goal having `goalIdentifier` of all the campaigns
vwoClientInstance.track(null, userId, goalIdentifier, options);
//Read more about configuration and usage - https://developers.vwo.com/reference#server-side-sdk-track
```

## [1.7.4] - 2020-03-05
### Changed
- Added check in segmentation for handling the scenario in which custom-variable key defined in campaign settings is not passed in APIs and matches regex ".*" is used.
- Remove unused log messages.
- Refactored code. Minified source code is now reduced by 4KB.

## [1.7.3] - 2020-02-03
### Changed
- Update year in Apache-2.0 Copyright header in all source and scripts files

## [1.7.2] - 2020-02-03
### Changed
- Make `sdkKey` optional while validating settingsFile. `sdkKey` will not be present in response of `getSettingsFile` API from `v1.7.0`.

## [1.7.0] - 2020-01-28
### Added
Client-side Javascript SDK
- NodeJs SDK can be used on client-side i.e. browser with all capabilities like A/B testing, Goal tracking, Feature Rollout, Feature Test, etc.
- Introduced `webpack` for bundling client-side `vwo-javascript-sdk`
-
### Changed
- Replaced `ajv` dependency with `superstruct`. Build-size reduced by significant factor

## [1.6.0] - 2020-01-15
### Breaking Changes
To prevent ordered arguments and increasing use-cases, we are moving all optional arguments into a combined argument(Object).

- customVariables argument in APIs: `activate`, `getVariation`, `track`, `isFeatureEnabled`, and `getFeatureVariableValue` have been moved into options object.
- `revenueValue` parameter in `track` API is now moved into `options` argument.

#### Before
```js
// activae API
vwoClientInstance.activate(campaignKey, userId, customVariables);
// getVariation API
vwoClientInstance.getVariation(campaignKey, userId, customVariables);
// track API
vwoClientInstance.track(campaignKey, userId, goalIdentifier, revenueValue, customVariables);
// isFeatureEnabled API
vwoClientInstance.isFeatureEnabled(campaignKey, userId, customVariables);
// getFeatureVariableValue API
vwoClientInstance.getFeatureVariableValue(campaignKey, variableKey, userId, customVariables);
```
#### After
```js

var options = {
  // Optional, needed for pre-segmentation
  customVariables: {},
  // Optional, neeeded for Forced Variation
  variationTargetingVariables: {}
  // Optional, needed to track revenue goal with revenue value
  revenueValue: 1000.12
};
// activae API
vwoClientInstance.activate(campaignKey, userId, options);
// getVariation API
vwoClientInstance.getVariation(campaignKey, userId, options);
// track API
vwoClientInstance.track(campaignKey, userId, goalIdentifier, options);
// isFeatureEnabled API
vwoClientInstance.isFeatureEnabled(campaignKey, userId, options);
// getFeatureVariableValue API
vwoClientInstance.getFeatureVariableValue(campaignKey, variableKey, userId, options);
```
### Added
Forced Variation capabilites
- Introduced `Forced Variation` to force certain users into specific variation. Forcing can be based on User IDs or custom variables defined.
### Changed
- All existing APIs to handle custom-targeting-variables as an option for forcing variation
- Code refactored to support Whitelisting. Order of execution


## [1.5.0] - 2019-12-17
### Added
Pre and Post segmentation capabilites
- Introduced new Segmentation service to evaluate whether user is eligible for campaign based on campaign pre-segmentation conditions and passed custom-variables
### Changed
- All existing APIs to handle custom-variables for tageting audience
- Code refactored to support campaign tageting and post segmentation


## [1.4.2] - 2019-12-02
### Changed
- `getVariation` and `getVariationName` API are same. Only two names for same API.


## [1.4.1] - 2019-11-27
### Changed
- File `getFeaturevariableValue` got renamed to `getFeatureVariableValue`. No issues were on MAC OS X as filenames are by default case-insensitve.


## [1.4.0] - 2019-11-27
### Added
Feature Rollout and Feature Test capabilities
- Introduced two new APIs i.e. `isFeatureEnabled` and `getFeatureVariableValue`
### Changed
- Existing APIs to handle new type of campaigns i.e. feature-rollout and feature-test
- Code refactored to support feature-rollout and feature-test capabilites


## [1.3.0] - 2019-11-25
### Changed
- Change MIT License to Apache-2.0
- Added apache copyright-header in each file
- Add NOTICE.txt file complying with Apache LICENSE
- Give attribution to the third-party libraries being used and mention StackOverflow


## [1.0.5] - 2019-11-22
### Changed
- Use User Storage Service in Track API also
- Update track API to use common method


## [1.0.4] - 2019-09-13
### Changed
- Fix passing `r` in custom goal type


## [1.0.3] - 2019-08-14
### Changed
- Show error when revenue not passed for revenue goals
- Merge pull request #3


## [1.0.2] - 2019-07-20
### Added
- First release with Server-side A/B capabilities
