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
    .module('horizon.dashboard.project.search')
    .factory('horizon.dashboard.project.search.settingsService', searchSettingsService);

  searchSettingsService.$inject = [
    '$modal',
    'horizon.dashboard.project.search.basePath',
    'horizon.app.core.openstack-service-api.searchlight'
  ];

  /**
   * @ngDoc factory
   * @name horizon.dashboard.project.search.settingsService
   *
   * @Description
   * Provides general search settings and a modal for updating the settings.
   *
   * @param {function} $modal ng $modal service
   *
   * @param {function} basePath the base url path
   *
   * @param {function} searchlight searchlight API service
   *
   * @returns {function} This settings service.
   */
  function searchSettingsService($modal,
                                 basePath,
                                 searchlight)
  {
    var service = {
      events: {
        settingsUpdatedEvent: 'horizon.dashboard.project.search.settingsUpdated',
        pluginsUpdatedEvent: 'horizon.dashboard.project.search.pluginsUpdated'
      },
      open: open,
      initScope: initScope,
      initPlugin: initPlugins,
      settings: {
        availablePlugins: [],
        fullTextSearch: {
          delayInMS: 400,
          phrase_slop: 10,
          lenient: true,
          analyze_wildCard: true
        },
        general: {
          limit: 50
        },
        polling: {
          enabled: false,
          interval: 10000 //Milliseconds
        }
      }
    };

    //init();

    return service;

    //////////////

    function init() {
      initPlugins();
    }

    function initPlugins() {
      searchlight.getPlugins().success(pluginsReceived);

      function pluginsReceived(response) {
        service.settings.availablePlugins = response.plugins;
        scope.$emit(service.events.pluginsUpdatedEvent, response.plugins);
      }
    }

    //TODO add subscribe instead of this.

    var scope;

    function initScope(newScope) {
      if (scope !== newScope) {
        scope = newScope;
        init();
      }
    }

    function open() {
      function getSearchSettings() {
        return service.settings;
      }

      var resolve = {
        searchSettings: getSearchSettings
      };

      var options = {
        controller: 'searchSettingsController as ctrl',
        scope: scope,
        backdrop: 'static',
        templateUrl: basePath + 'settings/search-settings.html',
        resolve: resolve
      };

      $modal.open(options)
        .result
        .then(notifySettingsUpdated);

      function notifySettingsUpdated() {
        scope.$emit(service.events.settingsUpdatedEvent);
      }
    }

  }
})();
