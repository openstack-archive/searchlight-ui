/**
 * Copyright 2015, Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
  'use strict';

  angular
    .module('searchlight-ui.util')
    .factory('searchlight-ui.util.searchlightSearchHelper',
      SearchlightSearchHelper);

  SearchlightSearchHelper.$inject = [
    '$interval',
    '$timeout',
    'horizon.app.core.openstack-service-api.searchlight',
    'searchlight-ui.util.searchlightFacetUtils',
    'searchlight-ui.util.searchlightQueryGenerator',
    'searchlight-ui.settings.settingsService'
  ];

  /**
   * @ngdoc service
   * @name searchlight-ui.searchlightSearchHelper
   * @description Search helper - one layer above the search API for no apparent reason.
   *
   * @param {function} $interval $interval
   *
   * @param {function} $timeout $timeout
   *
   * @param {function} searchlightFacetUtils searchlightFacetUtils
   *
   * @param {function} searchlightQueryGenerator searchlightQueryGenerator
   *
   * @param {function} searchlight searchlight API
   *
   * @param {function} settingsService settings service
   *
   * @returns {function} This service
   */
  function SearchlightSearchHelper($interval,
                                   $timeout,
                                   searchlight,
                                   searchlightFacetUtils,
                                   searchlightQueryGenerator,
                                   settingsService)
  {

    var service = {
      lastSearchQueryOptions: null,
      repeatLastSearchWithLatestSettings: repeatLastSearchWithLatestSettings,
      search: search,
      startAdHocPolling: startAdHocPolling,
      stopAdHocPolling: stopAdHocPolling
    };

    var adHocPollster = null;
    var settingsPollster = null;

    return service;

    //////////////////

    function repeatLastSearchWithLatestSettings() {
      service.lastSearchQueryOptions.is_repeat = true;
      search(service.lastSearchQueryOptions);
    }

    function search(queryOptions) {
      if (!queryOptions.is_repeat) {
        // This is a new search, stop any ad hoc polling
        // ad hoc polling is intended for attempting to
        // refresh after an action has been performed
        // and we don't have any other way to know how
        // to update the data.
        service.stopAdHocPolling();
      }

      if (settingsPollster !== null) {
        // We just always will reset the next poll interval to
        // come after the latest search no matter what the
        // cause of the current search was.
        $timeout.cancel(settingsPollster);
        settingsPollster = null;
      }

      service.lastSearchQueryOptions = queryOptions;

      var searchlightQuery = searchlightQueryGenerator.generate(queryOptions);

      if (queryOptions.searchFacets) {
        searchlightFacetUtils.updateResourceTypeFacets(
          searchlightQuery.type, queryOptions.searchFacets);
      }

      if (!searchlightQuery.type) {
        searchlightQuery.type = queryOptions.defaultResourceTypes;
      }

      searchlight
        .postSearch(searchlightQuery, true)
        .success(decoratedSearchSuccess)
        .error(decoratedSearchError);

      function decoratedSearchSuccess(response) {
        if (settingsService.settings.polling.enabled) {
          settingsPollster = $timeout(
            repeatLastSearchWithLatestSettings, settingsService.settings.polling.getIntervalInMs());
        }

        angular.forEach(response.hits, function (hit) {
          //This sets up common fields that sometimes differ across projects.
          hit._source.project_id = hit._source.project_id ||
            hit._source._tenant_id || hit._source.owner;
          hit._source.updated_at = hit._source.updated_at || hit._source.created_at;
        });

        queryOptions.onSearchSuccess(response);
      }

      function decoratedSearchError(data, statusCode) {
        var result = {
          hits: [],
          error: true,
          data: data,
          statusCode: statusCode
        };
        queryOptions.onSearchError(result);
      }
    }

    function startAdHocPolling(interval, maxTime) {
      stopAdHocPolling();
      interval = interval ? interval : settingsService.settings.polling.getIntervalInMs();
      adHocPollster = $interval(repeatLastSearchWithLatestSettings, interval);
      if (angular.isNumber(maxTime)) {
        $timeout(stopAdHocPolling, maxTime);
      }
    }

    function stopAdHocPolling() {
      if (angular.isDefined(adHocPollster)) {
        $interval.cancel(adHocPollster);
        adHocPollster = null;
      }
    }

  }
})();
