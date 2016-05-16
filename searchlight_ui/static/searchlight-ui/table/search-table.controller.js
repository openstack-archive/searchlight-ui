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
    '$q',
    '$timeout',
    'slSearchPluginResourceTypesFilter',
    'horizon.app.core.openstack-service-api.userSession',
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.framework.util.actions.action-result.service',
    'searchlight-ui.util.modifiedItemCache',
    'searchlight-ui.util.searchlightFacetUtils',
    'searchlight-ui.util.searchlightSearchHelper',
    'searchlight-ui.util.resourceLocator',
    'searchlight-ui.settings.settingsService'
  ];

  function SearchTableController($scope,
                                 $log,
                                 $filter,
                                 $q,
                                 $timeout,
                                 slSearchPluginResourceTypesFilter,
                                 userSession,
                                 registry,
                                 actionResultService,
                                 modifiedItemCache,
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
    ctrl.getSummaryTemplateUrl = getSummaryTemplateUrl;
    ctrl.globalActions = registry.getGlobalActions();
    ctrl.getSearchlightKey = getSearchlightKey;

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
      // Map the search results against the cache to make sure we show the user their most
      // recent changes while waiting for the services to notify the searchlight index
      if ( modifiedItemCache.getSize() > 0 ) {
        ctrl.hitsSrc = response.hits.map(syncWithCache).filter(isNotDeleted);
      } else {
        ctrl.hitsSrc = response.hits;
      }
      ctrl.queryResponse = response;
    }

    /**
     * @param searchlightItem
     * @returns If the given item is cached and has the same timestamp as the cached
     *  item, return the cached item because it has been modified by the user.
     *  Otherwise, return the given item.
     */
    function syncWithCache(searchlightItem) {
      return modifiedItemCache.sync(
        searchlightItem,
        searchlightItem._id,
        getSearchlightTimestamp(searchlightItem));
    }

    /**
     *
     * @param searchlightItem
     * @returns {boolean} - True if item contains 'deleted' attribute
     */
    function isNotDeleted(searchlightItem) {
      return !searchlightItem.deleted;
    }

    /**
     *
     * @param searchlightItem
     * @returns {string} - the searchlight service timestamp which indicates the time when
     * the item was last updated in the searchlight index
     */
    function getSearchlightTimestamp(searchlightItem) {
      var timestamp = '';

      // TODO - Use only _version
      // _version is only returned by latest versions of the searchlight service, fallback
      // on other data for now.
      if (searchlightItem._version) {
        timestamp = searchlightItem._version;
      } else if (searchlightItem._source.updated_at) {
        timestamp = searchlightItem._source.updated_at;
      } else if (searchlightItem._source.created_at) {
        timestamp = searchlightItem._source.created_at;
      }
      return timestamp;
    }

    /**
     *
     * @param searchlightItem
     * @returns {string} - key for searchlight results that allows and ng-repeat "track by"
     * expression to detect that although the item ID hasn't changed...it has in fact been
     * updated in the searchlight index. Without this, an updated item doesn't get re-rendered
     * in the search table.
     */
    function getSearchlightKey(searchlightItem) {
      return searchlightItem._id + getSearchlightTimestamp(searchlightItem);
    }

    function actionResultHandler(returnValue) {
      return $q.when(returnValue, actionSuccessHandler, actionErrorHandler);
    }

    function actionSuccessHandler(result) {
      // The action has completed (for whatever "complete" means to that
      // action. Notice the view doesn't really need to know the semantics of the
      // particular action because the actions return data in a standard form.
      // That return includes the id and type of each created, updated, deleted
      // and failed item.
      var deletedIds, updatedIds, createdIds, failedIds;

      if ( result ) {
        deletedIds = actionResultService.getIdsOfType(result.deleted, undefined);
        updatedIds = actionResultService.getIdsOfType(result.updated, undefined);
        createdIds = actionResultService.getIdsOfType(result.created, undefined);
        failedIds = actionResultService.getIdsOfType(result.failed, undefined);

        // Handle deleted, updated and created items by adding them to the cache so that we
        // can show added, hide removed, and mark modified as 'dirty' until the searchlight
        // server-side cache is updated.
        addItemsToCache(deletedIds, true);
        addItemsToCache(updatedIds);
        addItemsToCache(createdIds);

        // Handle failed images
        if ( failedIds ) {
          // Do nothing for now
        }

      } else {
        // promise resolved, but no result returned. Because the action didn't
        // tell us what happened...do nothing and wait until the next search
        // results poll to refresh the displayed data.
      }
    }

    function getSummaryTemplateUrl(type) {
      return registry.getResourceType(type).summaryTemplateUrl ||
        registry.getDefaultSummaryTemplateUrl();
    }

    /**
     * If an item is currently displayed in the search results, add it to a cache
     * until it's searchlight timestamp changes the next time it appears in search
     * results.
     *
     * @param ids - id of an item that has been modified
     * @param deleted - set to true if the item has been deleted
     */
    function addItemsToCache(ids, deleted) {
      var index, searchlightItem;
      ids.forEach(function addToCache(id) {
        // Find the index of the item if it is currently displayed in the search results
        index = ctrl.hitsSrc.findIndex(function findItemWithId(item) {
          if (item._source.id === id) {
            return item;
          }
        });

        // If the item is currently displayed, cache it so that the user sees the most
        // current item until the searchlight service side is updated.
        if ( index >= 0 ) {
          // First, remember the currently displayed item
          searchlightItem = ctrl.hitsSrc[index];

          if ( deleted ) {
            // A displayed item has been deleted, remove it from the current results
            ctrl.hitsSrc.splice(index,1);
          }

          if ( searchlightItem ) {
            // Annotate the item as dirty, and possibly deleted, then place it in the cache
            // with the current searchlight timestamp (not local time). If this item is displayed
            // in the search results, the cached item will be used until the searchlight timestamp
            // in the search results have been updated. For deleted items, since they will be
            // removed from future searchlight server search results, they will be cached until
            // the LRU cache has filled.
            searchlightItem.dirty = true;
            searchlightItem.deleted = deleted;
            modifiedItemCache.put(
              searchlightItem,
              searchlightItem._id,
              getSearchlightTimestamp(searchlightItem)
            );
          }
        }
      });
    }

    function actionErrorHandler(reason) { // eslint-disable-line no-unused-vars
      // Action has failed. Do nothing.
    }
  }

})();
