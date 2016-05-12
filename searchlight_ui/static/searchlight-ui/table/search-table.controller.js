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

  /**
   * @ngdoc controller
   * @name searchlight-ui.table.searchTableController
   *
   * @description
   * Controller for the search table.
   * Serves as the focal point for table actions.
   */
  angular
    .module('searchlight-ui.table')
    .controller('searchlight-ui.table.searchTableController', SearchTableController);

  SearchTableController.$inject = [
    '$scope',
    '$log',
    '$filter',
    '$timeout',
    'slSearchPluginResourceTypesFilter',
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.userSession',
    'searchlight-ui.util.searchlightFacetUtils',
    'searchlight-ui.util.searchlightSearchHelper',
    'searchlight-ui.util.resourceLocator',
    'searchlight-ui.settings.settingsService'
  ];

  function SearchTableController($scope,
                                 $log,
                                 $filter,
                                 $timeout,
                                 slSearchPluginResourceTypesFilter,
                                 registry,
                                 userSession,
                                 searchlightFacetUtils,
                                 searchlightSearchHelper,
                                 resourceLocator,
                                 searchSettings)
  {
    var ctrl = this;
    ctrl.filter = $filter;
    ctrl.hits = [];
    ctrl.hitsSrc = [];
    ctrl.initialized = false;
    ctrl.resourceLocator = resourceLocator;
    ctrl.searchFacets = [];
    ctrl.excludedTypes = ['OS::Glance::Metadef'];
    ctrl.searchSettings = searchSettings;
    ctrl.defaultResourceTypes = [];
    ctrl.defaultFacets = searchlightFacetUtils.defaultFacets();
    ctrl.registry = registry;
    ctrl.refresh = searchlightSearchHelper.repeatLastSearchWithLatestSettings;
    ctrl.actionResultHandler = actionResultHandler;
    ctrl.userSession = {};

    init();

    ////////////////////////////////

    function init() {
      ctrl.searchSettings.initScope($scope);
      searchlightFacetUtils.initScope($scope);

      if (searchlightSearchHelper.lastSearchQueryOptions) {
        ctrl.searchFacets = searchlightSearchHelper.lastSearchQueryOptions.searchFacets;
        if (searchlightSearchHelper.lastSearchQueryOptions.queryString) {
          $timeout(setInput(searchlightSearchHelper.lastSearchQueryOptions.queryString));
        }
      } else {
        ctrl.searchFacets = ctrl.defaultFacets;
      }

      userSession.get()
        .then(function onUserSessionGet(session) {
          ctrl.userSession = session;
        });

      function setInput(text) {
        return function() {
          angular.element('.search-input').val(text);
        };
      }
    }

    var pluginsUpdatedWatcher = $scope.$on(
      ctrl.searchSettings.events.pluginsUpdatedEvent,
      pluginsUpdated
    );

    function pluginsUpdated(event, plugins) {
      var pluginToTypesOptions = {
        excludedTypes: ctrl.excludedTypes,
        flatten: true
      };
      ctrl.defaultResourceTypes = slSearchPluginResourceTypesFilter(plugins, pluginToTypesOptions);

      ctrl.defaultResourceTypes.forEach(function(type) {
        try {
          registry.initActions(type, $scope);
        } catch (err) {
          var errorMsg = gettext('Error initializing actions for plugin %(type)s: ');
          $log.error(interpolate(errorMsg, { type: type }, true) + err);
        }
      });

      searchlightFacetUtils.setTypeFacetFromResourceTypes(
        ctrl.defaultResourceTypes, ctrl.searchFacets);

      searchlightFacetUtils.broadcastFacetsChanged(searchlightSearchHelper.lastSearchQueryOptions);

      ctrl.initialized = true;

      if (searchlightSearchHelper.lastSearchQueryOptions) {
        searchlightSearchHelper.lastSearchQueryOptions.onSearchSuccess = onSearchResult;
        searchlightSearchHelper.lastSearchQueryOptions.onSearchError = onSearchResult;
        searchlightSearchHelper.repeatLastSearchWithLatestSettings();
      } else {
        search();
      }
    }

    var fullTextSearchTimeout;
    var evtName = 'serverSearchUpdated-ms-context';
    var searchUpdatedWatcher = $scope.$on(evtName, function (event, searchData) {

      // Magic search always broadcasts this at startup, so
      // we have to not run until we are fully initialized.
      if (!ctrl.initialized) {
        return;
      }

      function performSearch() {
        fullTextSearchTimeout = null;
        search(searchData);
      }

      if (searchData.queryStringChanged) {
        // This keeps the query from being executed too rapidly
        // when the user is performing rapid key presses.
        if (fullTextSearchTimeout) {
          $timeout.cancel(fullTextSearchTimeout);
        }

        fullTextSearchTimeout = $timeout(
          performSearch,
          ctrl.searchSettings.settings.fullTextSearch.delayInMS
        );
      } else if (searchData.magicSearchQueryChanged) {
        performSearch();
      }
    });

    var checkFacetsWatcher = $scope.$on('checkFacets', function (event, selectedFacets) {
      //Facets are actually DOM elements. This affects the styling.
      $timeout(function () {
        angular.forEach(selectedFacets, function setIsServerTrue(facet) {
          facet.isServer = true;
        });
      });
    });

    var searchSettingsUpdatedWatcher = $scope.$on(
      ctrl.searchSettings.events.settingsUpdatedEvent,
      searchlightSearchHelper.repeatLastSearchWithLatestSettings
    );

    $scope.$on('$destroy', function cleanupListeners() {
      checkFacetsWatcher();
      searchUpdatedWatcher();
      searchSettingsUpdatedWatcher();
      pluginsUpdatedWatcher();
    });

    function search(queryOptions) {
      queryOptions = queryOptions || {};
      queryOptions.allFacetDefinitions = ctrl.searchFacets;
      queryOptions.searchFacets = ctrl.searchFacets;
      queryOptions.defaultResourceTypes = ctrl.defaultResourceTypes;
      queryOptions.onSearchSuccess = onSearchResult;
      queryOptions.onSearchError = onSearchResult;

      return searchlightSearchHelper.search(queryOptions);
    }

    function onSearchResult(response) {
      ctrl.hitsSrc = response.hits;
      ctrl.queryResponse = response;
    }

    function actionResultHandler(result) {
      result.then(repeatUntilChangedResults);

      function repeatUntilChangedResults() {
        // For now, all we can do is poll for a period of time.
        searchlightSearchHelper.startAdHocPolling(500, 5000);
      }
    }

  }

})();
