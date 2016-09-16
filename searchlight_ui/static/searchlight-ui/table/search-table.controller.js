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
    'searchlight-ui.util.modifiedItemCache',
    'searchlight-ui.util.searchlightFacetUtils',
    'searchlight-ui.util.searchlightSearchHelper',
    'searchlight-ui.util.resourceLocator',
    'searchlight-ui.settings.settingsService',
    'horizon.app.core.openstack-service-api.searchlight'
  ];

  function SearchTableController($scope,
                                 $log,
                                 $filter,
                                 $q,
                                 $timeout,
                                 slSearchPluginResourceTypesFilter,
                                 userSession,
                                 registry,
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
    ctrl.actionResultHandler = actionResultHandler;
    ctrl.userSession = {};
    ctrl.getSummaryTemplateUrl = getSummaryTemplateUrl;
    ctrl.globalActions = registry.getGlobalActions();
    ctrl.getSearchlightKey = getSearchlightKey;
    ctrl.toggleLiveSearch = toggleLiveSearch;
    ctrl.isLiveSearch = isLiveSearch;
    ctrl.playPauseTooltip = playPauseTooltip;
    ctrl.itemInTransition = itemInTransition;
    ctrl.displaying = displaying;
    ctrl.resultsExceedLimit = false;

    ////////////////////////////////

    // Private data
    var playTooltip = gettext("Resume updates to search results");
    var pauseTooltip = gettext("Pause updates to search results");
    var currentSeachPollTimeout, dirtyHitsPollTimeout, fullTextSearchTimeout;

    ctrl.searchSettings.loadCustomSettings().then(init, init);

    function init() {
      ctrl.searchSettings.initScope($scope);
      searchlightFacetUtils.initScope($scope);

      var lastUsedQuery = ctrl.searchSettings.lastUsedQuery();
      if (lastUsedQuery) {
        ctrl.searchFacets = lastUsedQuery.searchFacets;
        if (lastUsedQuery.queryString) {
          $timeout(setInput(lastUsedQuery.queryString));
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
      var lastUsedQuery = ctrl.searchSettings.lastUsedQuery();
      ctrl.defaultResourceTypes = slSearchPluginResourceTypesFilter(plugins, pluginToTypesOptions);

      ctrl.defaultResourceTypes.forEach(function(type) {
        try {
          registry.getResourceType(type).initActions($scope);
        } catch (err) {
          var errorMsg = gettext('Error initializing actions for plugin %(type)s: ');
          $log.error(interpolate(errorMsg, { type: type }, true) + err);
        }
      });

      searchlightFacetUtils.setTypeFacetFromResourceTypes(
        ctrl.defaultResourceTypes, ctrl.searchFacets);

      searchlightFacetUtils.broadcastFacetsChanged(lastUsedQuery);

      ctrl.initialized = true;

      if (lastUsedQuery) {
        repeatCurrentSearch();
      } else {
        search();
      }
    }

    var searchUpdatedWatcher = $scope.$on('searchUpdated-ms-context', onSearchUpdated);
    ctrl.onSearchUpdatedOnce = false;
    function onSearchUpdated(event, searchData) {
      // Magic search emits this even though we don't want it.
      // This is a hack, because I don't know what is going on
      // And this seems to fix the case where you can't delete facets
      // when returning to search results.
      // Sorry... this will cause occassional console logs
      // But it fixes the user experience.
      if (!ctrl.initialized) {
        return;
      }

      if (!ctrl.onSearchUpdatedOnce) {
        ctrl.onSearchUpdatedOnce = true;
        search(searchData);
      }
    }

    var evtName = 'serverSearchUpdated-ms-context';
    var serverSearchUpdatedWatcher = $scope.$on(evtName, function (event, searchData) {

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
      repeatCurrentSearch
    );

    $scope.$on('$destroy', function cleanupListeners() {
      checkFacetsWatcher();
      searchUpdatedWatcher();
      searchSettingsUpdatedWatcher();
      serverSearchUpdatedWatcher();
      pluginsUpdatedWatcher();
      cancelCurrentSearchPoll();
      cancelDirtyHitsPoll();
    });

    function displaying() {
      ctrl.resultsExceedLimit = false;
      var total = 0;
      var numberDisplayed = 0;

      if (ctrl.searchSettings.settings.general.limit && ctrl.queryResponse) {
        total = ctrl.queryResponse.hits.total;
        numberDisplayed =
          ctrl.queryResponse.hits.total < ctrl.searchSettings.settings.general.limit
          ? ctrl.queryResponse.hits.total : ctrl.searchSettings.settings.general.limit;
      }
      if (total === numberDisplayed) {
        return interpolate(
          gettext('%(total)s total results'),
          {numberDisplayed: numberDisplayed, total: total},
          true);
      } else {
        ctrl.resultsExceedLimit = true;
        return interpolate(
          gettext('Displaying %(numberDisplayed)s of %(total)s total results'),
          {numberDisplayed: numberDisplayed, total: total},
          true);
      }
    }

    function search(queryOptions) {
      cancelCurrentSearchPoll();
      queryOptions = queryOptions || {};
      queryOptions.allFacetDefinitions = ctrl.searchFacets;
      queryOptions.searchFacets = ctrl.searchFacets;
      queryOptions.defaultResourceTypes = ctrl.defaultResourceTypes;
      ctrl.searchSettings.lastUsedQuery(queryOptions);
      searchlightSearchHelper.search(queryOptions)
        .then(onSearchResult);
    }

    function repeatCurrentSearch() {
      // We may be called either by timeout, or in response to an event. If the latter,
      // cancel the current search poll timeout to avoid a double search
      cancelCurrentSearchPoll();
      searchlightSearchHelper.search(ctrl.searchSettings.lastUsedQuery())
        .then(onSearchResult);
    }

    function onSearchResult(response) {

      // Map the search results against the cache to make sure we show the user their most
      // recent changes while waiting for the services to notify the searchlight index
      if ( modifiedItemCache.getSize() > 0 ) {
        ctrl.hitsSrc = response.hits.hits.map(syncWithCache).filter(isNotDeleted);
      } else {
        ctrl.hitsSrc = response.hits.hits;
      }
      ctrl.queryResponse = response;

      pollCurrentSearch();
    }

    /**
     * If search polling is unpaused, set a timeout to repeat the current search.
     */
    function pollCurrentSearch() {
      if (ctrl.isLiveSearch()) {
        cancelCurrentSearchPoll();
        currentSeachPollTimeout = $timeout(
          repeatCurrentSearch, searchSettings.settings.polling.getIntervalInMs(), true);
      }
    }

    function cancelCurrentSearchPoll() {
      $timeout.cancel(currentSeachPollTimeout);
      currentSeachPollTimeout = null;
    }

    function isDirty(item) {
      return item.dirty;
    }

    function pollDirtyHits() {
      // Note: deleted items have already been filtered out when they were added to the cache
      var dirtyHits = ctrl.hitsSrc.filter(isDirty);
      if (dirtyHits.length > 0) {
        // There are dirty items cancel the overall search polling and
        // poll on the dirty items until they are clean.
        cancelCurrentSearchPoll();

        // We may be called by a timeout, or by the user toggling the overall search play/pause.
        // If the latter, cancel the current dirty poll to avoid a double search
        cancelDirtyHitsPoll();

        dirtyHitsPollTimeout = $timeout(
          searchDirtyHits,
          searchSettings.settings.polling.dirtyItemInterval * 1000,
          true,
          dirtyHits);
      } else {
        // There are no dirty items. Resume the current search poll if necessary
        pollCurrentSearch();
      }
    }

    function cancelDirtyHitsPoll() {
      $timeout.cancel(dirtyHitsPollTimeout);
      dirtyHitsPollTimeout = null;
    }

    function searchDirtyHits(items) {
      searchlightSearchHelper.searchItems(items)
        .then(onSearchDirtyHitsResult);
    }

    function onSearchDirtyHitsResult(response) {
      // Merge the dirty items into the current search hits
      var mergedHits = ctrl.hitsSrc.map(function(originalHit) {
        var result = response.hits.hits.find(function(dirtyQueryHit) {
          return originalHit._id === dirtyQueryHit._id;
        });
        return result || originalHit;
      });
      // The item returned by the dirty query may STILL be dirty from the users
      // point of view if the SL dirty items query returned the same dirty item
      // we already knew about. Sync the merged list with the cache to get only
      // items that have actually been updated since the user action.
      ctrl.hitsSrc = mergedHits.map(syncWithCache).filter(isNotDeleted);

      // Keep querying until no dirty items
      pollDirtyHits();
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
        searchlightItem.id,
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
      return searchlightItem.id +
        getSearchlightTimestamp(searchlightItem);
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

      if ( result ) {
        // Handle deleted, updated and created items by adding them to the cache so that we
        // can show added, hide removed, and mark modified as 'dirty' until the searchlight
        // server-side cache is updated.
        addItemsToCache(result.deleted, true);
        addItemsToCache(result.updated);
        addItemsToCache(result.created);

        // Failed items in the ActionResult are current ignored

      } else {
        // promise resolved, but no result returned. Because the action didn't
        // tell us what happened...do nothing and wait until the next search
        // results poll to refresh the displayed data.
      }

      pollDirtyHits();
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
     * @param items - array of items in an ActionResult that has been modified
     * @param deleted - set to true if the item has been deleted
     */
    function addItemsToCache(items, deleted) {
      var index, searchlightItem;
      items.forEach(function addToCache(item) {
        // Find the index of the item if it is currently displayed in the search results
        index = ctrl.hitsSrc.findIndex(function findItemWithTypeAndId(hit) {
          // NOTE: Type must be included as part of this check because the id returned
          // by the ActionResult is the _source.id, which is only unique within a given
          // type of resource
          if (hit._source.id === item.id && hit._type === item.type) {
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
              searchlightItem.id,
              getSearchlightTimestamp(searchlightItem)
            );
          }
        }
      });
    }

    function actionErrorHandler(reason) { // eslint-disable-line no-unused-vars
      // Action has failed. Do nothing.
    }

    function toggleLiveSearch() {
      // Check the current polling state
      var pollingWasEnabled = ctrl.searchSettings.settings.polling.enabled;
      // Toggle the current polling state
      ctrl.searchSettings.settings.polling.enabled = !pollingWasEnabled;

      // Now respond to the change in polling state. Since these functions
      // may check the settings, we must be careful to toggle the polling
      // state first.
      if ( pollingWasEnabled ) {
        // Polling was enabled but is now toggled OFF
        cancelCurrentSearchPoll();
        // Still want to poll any dirty items even if overall search results
        // are no longer live
        pollDirtyHits();
      } else {
        // Polling was NOT enabled but is now toggled ON
        cancelDirtyHitsPoll(); // No need to dirty poll if entire search results are polling
        repeatCurrentSearch();
      }
    }

    function isLiveSearch() {
      return ctrl.searchSettings.settings.polling.enabled;
    }

    function playPauseTooltip() {
      return isLiveSearch() ? pauseTooltip : playTooltip;
    }

    function itemInTransition(item) {
      var resourceType = registry.getResourceType(item._type);
      return resourceType.itemInTransitionFunction(item._source);
    }
  }

})();
