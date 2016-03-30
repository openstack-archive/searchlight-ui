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
   * @name SearchTableController
   *
   * @description
   * Controller for the search table.
   * Serves as the focal point for table actions.
   */
  angular
    .module('horizon.dashboard.project.search')
    .controller('searchTableController', SearchTableController);

  SearchTableController.$inject = [
    '$scope',
    '$filter',
    '$timeout',
    'searchPluginResourceTypesFilter',
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.userSession',
    'horizon.dashboard.project.search.searchlightFacetUtils',
    'horizon.dashboard.project.search.searchlightSearchHelper',
    'horizon.dashboard.project.search.resourceLocator',
    'horizon.dashboard.project.search.settingsService'
  ];

  function SearchTableController($scope,
                                 $filter,
                                 $timeout,
                                 searchPluginResourceTypesFilter,
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

    //ctrl.isNested;

    init();

    ////////////////////////////////

    function init() {
      ctrl.searchSettings.initScope($scope);
      searchlightFacetUtils.initScope($scope);

      if (searchlightSearchHelper.lastSearchQueryOptions) {
        ctrl.searchFacets = searchlightSearchHelper.lastSearchQueryOptions.searchFacets;
      } else {
        ctrl.searchFacets = ctrl.defaultFacets;
      }

      userSession.get()
        .then(function onUserSessionGet(session) {
          ctrl.userSession = session;
        });
    }

    /*function isNested (input) {
      var result = angular.isArray(input) &&
        input.length > 0 &&
        angular.isObject(input[0]) &&
        Object.keys(input[0]).length > 1;

      return result;
    }*/

    var pluginsUpdatedWatcher = $scope.$on(
      ctrl.searchSettings.events.pluginsUpdatedEvent,
      pluginsUpdated
    );

    function pluginsUpdated(event, plugins) {
      var pluginToTypesOptions = {
        excludedTypes: ctrl.excludedTypes,
        flatten: true
      };
      ctrl.defaultResourceTypes = searchPluginResourceTypesFilter(plugins, pluginToTypesOptions);

      ctrl.defaultResourceTypes.forEach(function(type) {
        registry.initActions(type, $scope);
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
    var searchUpdatedWatcher = $scope.$on('serverSearchUpdated', function (event, searchData) {

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
