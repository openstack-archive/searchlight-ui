/**
 * (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function () {
  'use strict';

  angular
    .module('searchlight-ui.settings')
    .factory('searchlight-ui.settings.settingsService', searchSettingsService);

  searchSettingsService.$inject = [
    '$uibModal',
    '$q',
    'searchlight-ui.basePath',
    'horizon.app.core.openstack-service-api.userSession',
    'horizon.app.core.openstack-service-api.searchlight'
  ];

  /**
   * @ngDoc factory
   * @name searchlight-ui.settings.settingsService
   *
   * @Description
   * Provides general search settings and a modal for updating the settings.
   *
   * @param {function} $uibModal ng $uibModal service
   *
   * @param {function} basePath the base url path
   *
   * @param {function} searchlight searchlight API service
   *
   * @returns {function} This settings service.
   */
  function searchSettingsService($uibModal,
                                 $q,
                                 basePath,
                                 userSession,
                                 searchlight)
  {
    var customSettingsCall = $q.defer();
    var persistenceUser, scope;

    var service = {
      loadCustomSettings: loadCustomSettings,
      events: {
        settingsUpdatedEvent: 'searchlight-ui.settingsUpdated',
        pluginsUpdatedEvent: 'searchlight-ui.pluginsUpdated'
      },
      localStorageSettingsKey: 'searchlight-settings',
      open: open,
      initScope: initScope,
      initPlugin: initPlugins,
      lastUsedQuery: lastUsedQuery,
      settings: {
        availablePlugins: [],
        fullTextSearch: {
          delayInMS: 400,
          phrase_slop: 10,
          lenient: true,
          analyze_wildCard: true
        },
        general: {
          all_projects: false,
          all_projects_policy: { rules: [["search", "search:all_projects:allow"]] },
          limit: 200,
          limit_max: 2000,
          limit_min: 5,
          pageSize: 20
        },
        highlighting: {
          enabled: false,
          config: {
            fields: {
              "*": {}
            },
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"]
          }
        },
        polling: {
          enabled: true,
          interval: 10, //seconds
          getIntervalInMs: getIntervalInMs,
          interval_min: 1,
          interval_max: 300,
          dirtyItemInterval: 2 // seconds
        },
        sort: {
          options: getSortOptions(),
          selected: getSortOptions()[0]
        },
        cache: {
          // big "enough" to hold items modified by user before actions complete notify SL
          capacity: 100
        },
        queries: {
          lastUsedQuery: null
        }
      }
    };

    //init();

    userSession.get().then(onUserLoad);
    return service;

    //////////////

    function init() {
      initPlugins();
    }

    function onUserLoad(response) {
      persistenceUser = response.user_domain_name + '/' + response.username;
      var storedSettings = loadSettings(persistenceUser);
      if (storedSettings) {
        angular.merge(service.settings, JSON.parse(storedSettings));
      }
      customSettingsCall.resolve({});
    }

    function loadCustomSettings() {
      return customSettingsCall.promise;
    }

    function initPlugins() {
      searchlight.getPlugins().success(pluginsReceived);

      function pluginsReceived(response) {
        service.settings.availablePlugins = response.plugins;
        scope.$emit(service.events.pluginsUpdatedEvent, response.plugins);
      }
    }

    function initScope(newScope) {
      if (scope !== newScope) {
        scope = newScope;
        init();
      }
    }

    function getIntervalInMs() {
      return service.settings.polling.interval * 1000;
    }

    function getSortOptions() {
      return [
        {label: gettext("Relevancy"), query: {"_score": {"order": "desc"}}},
        {label: gettext("Newest"), query: {"updated_at": {"order": "desc"}}},
        {label: gettext("Oldest"), query: {"updated_at": {"order": "asc"}}},
        {label: gettext("Alphabetical Name"), query: {"name": {"order": "asc"}}},
        {label: gettext("Reverse Alphabetical Name"), query: {"name": {"order": "desc"}}}
      ];
    }

    function open() {
      var editableSettings = angular.copy(service.settings);

      function getSearchSettings() {
        return editableSettings;
      }

      var resolve = {
        searchSettings: getSearchSettings
      };

      var options = {
        controller: 'searchlight-ui.settings.searchSettingsController as ctrl',
        scope: scope,
        backdrop: 'static',
        templateUrl: basePath + 'settings/search-settings.html',
        resolve: resolve
      };

      return $uibModal.open(options)
        .result
        .then(updateSettingsAndNotify);

      function updateSettingsAndNotify() {
        service.settings = angular.copy(editableSettings);
        saveSettings();
        scope.$emit(service.events.settingsUpdatedEvent);
        return service.settings;
      }
    }

    function persistedSettings(fullSettings) {
      return {
        general: {
          all_projects: fullSettings.general.all_projects,
          limit: fullSettings.general.limit
        },
        highlighting: {
          enabled: fullSettings.highlighting.enabled
        },
        polling: {
          enabled: fullSettings.polling.enabled,
          interval: fullSettings.polling.interval
        },
        sort: {
          selected: fullSettings.sort.selected
        },
        queries: {
          lastUsedQuery: fullSettings.queries.lastUsedQuery
        }
      };
    }

    function saveSettings() {
      var objectToPersist = persistedSettings(service.settings);
      localStorage.setItem(service.localStorageSettingsKey + '/' + persistenceUser,
          JSON.stringify(objectToPersist));
    }

    function loadSettings(user) {
      return localStorage.getItem(service.localStorageSettingsKey + '/' + user);
    }

    /**
     * Get/Set the last used query
     * @param query - if set, will update the last used query in the persisted settings
     * If undefined, will return the current last used query from persisted settings
     */
    function lastUsedQuery(query) {
      if (query) {
        service.settings.queries.lastUsedQuery = query;
        saveSettings();
      } else {
        return service.settings.queries.lastUsedQuery;
      }
    }

  }
})();
