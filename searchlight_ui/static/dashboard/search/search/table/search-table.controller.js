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
    '$q',
    '$timeout',
    'searchPluginResourceTypesFilter',
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.userSession',
    'horizon.dashboard.project.search.searchlightFacetUtils',
    'horizon.dashboard.project.search.searchlightSearchHelper',
    'horizon.dashboard.project.search.resourceLocator',
    'horizon.dashboard.project.search.settingsService',
    'horizon.dashboard.search.search.util.cache.service'
  ];

  function SearchTableController($scope,
                                 $filter,
                                 $q,
                                 $timeout,
                                 searchPluginResourceTypesFilter,
                                 registry,
                                 userSession,
                                 searchlightFacetUtils,
                                 searchlightSearchHelper,
                                 resourceLocator,
                                 searchSettings,
                                 cache)
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
    ctrl.getSearchlightKey = getSearchlightKey;
    ctrl.userSession = {};

    var adHocPollInterval = 500;
    var adHocPollDuration = 5000;

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

      cache.clean(adHocPollDuration * 3);
      ctrl.hitsSrc = response.hits.map(syncWithCache).filter(removeDeletedItems);
      ctrl.queryResponse = response;
    }

    function syncWithCache(searchlight_item) {
      return cache.sync(searchlight_item, searchlight_item._id, getSearchlightTimestamp(searchlight_item));
    }

    function removeDeletedItems(searchlight_item) {
      if ( searchlight_item.deleted ) {
        return false;
      } else {
        return true;
      }
    }

    function actionResultHandler(returnValue) {
      return $q.when(returnValue, actionSuccessHandler, actionErrorHandler);
    }

    function repeatUntilChangedResults() {
      // For now, all we can do is poll for a period of time.
      searchlightSearchHelper.startAdHocPolling(adHocPollInterval, adHocPollDuration);
    }

    function actionSuccessHandler(result) {

      // For now, always poll for 5 seconds after every action. This is not
      // needed with default polling enabled.
      //repeatUntilChangedResults();

      // The action has completed (for whatever "complete" means to that
      // action. Notice the view doesn't really need to know the semantics of the
      // particular action because the actions return data in a standard form.
      // That return includes the id and type of each created, updated, deleted
      // and failed item.
      //
      // This handler is also careful to check the type of each item. This
      // is important because actions which create non-images are launched from
      // the images page (like create "volume" from image).
      var deletedIds, updatedIds, createdIds, failedIds;

      if ( result ) {
        // Reduce the results to just image ids ignoring other types the action
        // may have produced
        deletedIds = getIdsOfType(result.deleted, undefined);
        updatedIds = getIdsOfType(result.updated, undefined);
        createdIds = getIdsOfType(result.created, undefined);
        failedIds = getIdsOfType(result.failed, undefined);

        addItemsToCache(deletedIds, true);
        addItemsToCache(updatedIds);
        addItemsToCache(createdIds);

        // Handle deleted images
        if (deletedIds.length) {
          // Do nothing for now
        }

        // Handle updated and created images
        if ( updatedIds.length || createdIds.length ) {
        }

        // Handle failed images
        if ( failedIds ) {
          // Do nothing for now
        }

      } else {
        // promise resolved, but no result returned. Because the action didn't
        // tell us what happened...reload the displayed items just in case.
      }
    }

    function addItemsToCache(ids, deleted) {
      var searchlight_item;
      ids.forEach(function addToCache(id) {
        var index = ctrl.hitsSrc.findIndex(function findItemWithId(item) {
          if (item._source.id === id) {
            return item;
          }
        });
        if ( index >= 0 ) {
          var searchlight_item = ctrl.hitsSrc[index];
          if ( deleted ) {
            ctrl.hitsSrc.splice(index,1);
          }
          if ( searchlight_item ) {
            searchlight_item.dirty = true;
            searchlight_item.deleted = deleted;
            cache.add(searchlight_item, searchlight_item._id, getSearchlightTimestamp(searchlight_item));
          }
        }
      });
    }

    function actionErrorHandler(reason) { // eslint-disable-line no-unused-vars
      // Action has failed. Do nothing.
    }

    function getIdsOfType(items, type) {
      var result;
      function typeIdReduce(accumulator, item) {
        if (type === undefined || item.type === type) {
          accumulator.push(item.id);
        }
        return accumulator;
      }

      if ( items ) {
        result = items.reduce(typeIdReduce, []);
      } else {
        result = [];
      }

      return result;
    }

    function getSearchlightTimestamp(searchlight_item) {
      var timestamp = '';

      if (searchlight_item._version) {
        timestamp = searchlight_item._version;
      } else if (searchlight_item._source.updated_at) {
        timestamp = searchlight_item._source.updated_at;
      } else if (searchlight_item._source.created_at) {
        timestamp = searchlight_item._source.created_at;
      }
      return timestamp;
    }

    function getSearchlightKey(searchlight_item) {
      return searchlight_item._id + getSearchlightTimestamp(searchlight_item);
    };
  }

})();
