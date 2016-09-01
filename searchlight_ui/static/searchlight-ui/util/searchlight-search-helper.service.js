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
    '$q',
    'horizon.app.core.openstack-service-api.searchlight',
    'searchlight-ui.util.searchlightFacetUtils',
    'searchlight-ui.util.searchlightQueryGenerator'
  ];

  /**
   * @ngdoc service
   * @name searchlight-ui.searchlightSearchHelper
   * @description Search helper - one layer above the search API for no apparent reason.
   *
   * @param {function} $q - $q service
   *
   * @param {function} searchlight - searchlight API
   *
   * @param {function} searchlightFacetUtils - searchlightFacetUtils service
   *
   * @param {function} searchlightQueryGenerator - searchlightQueryGenerator service
   *
   * @returns {function} This service
   */
  function SearchlightSearchHelper($q,
                                   searchlight,
                                   searchlightFacetUtils,
                                   searchlightQueryGenerator)
  {

    var service = {
      search: search,
      searchItems: searchItems
    };

    return service;

    //////////////////

    function search(queryOptions) {

      var searchlightQuery = searchlightQueryGenerator.generate(queryOptions);

      if (queryOptions.searchFacets) {
        searchlightFacetUtils.updateResourceTypeFacets(
          searchlightQuery.type, queryOptions.searchFacets);
      }

      if (!searchlightQuery.type) {
        searchlightQuery.type = queryOptions.defaultResourceTypes;
      }

      return promisfySearch(searchlightQuery);
    }

    /**
     * Query Searchlight for the latest version of a list of specific search result items.
     * @param items - an array of items from a prior searchlight search result
     * @returns {$http promise} for the searchlight API call
     */
    function searchItems(items) {
      return promisfySearch(searchlightQueryGenerator.generateItems(items));
    }

    function promisfySearch(searchlightQuery) {
      var deferred = $q.defer();

      searchlight
        .postSearch(searchlightQuery, true)
        .success(function (response) {
          deferred.resolve(onSearchSuccess(response));
        })
        .error(function (response) {
          deferred.resolve(onSearchError(response));
        });

      return deferred.promise;
    }

    function onSearchSuccess(response) {
      if (response.hits && response.hits.hits) {
        angular.forEach(response.hits.hits, function (hit) {
          //This sets up common fields that sometimes differ across projects.
          hit._source.project_id = hit._source.project_id ||
            hit._source._tenant_id || hit._source.owner;
          hit._source.updated_at = hit._source.updated_at || hit._source.created_at;

          // Add a unique search result identifier.
          //
          // NOTE: _id is only unique within a given _type. Two hits of different _type may
          // have an identical _id. It is *similar* to the searchlight "_uid", but since that
          // isn't exposed by the API, this ID is intentionally not the same to prevent its
          // accidental use in calls back to the searchlight API. All uses of .id should
          // treat it as an opaque, unique identifier of 1 item in the searchlight index.
          hit.id = hit._type + hit._id;
        });
      }

      return response;
    }

    function onSearchError(data, statusCode) {
      var result = {
        hits: {hits: [], total: 0},
        error: true,
        data: data,
        statusCode: statusCode
      };
      return result;
    }
  }
})();
