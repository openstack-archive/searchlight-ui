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
    .factory('searchlight-ui.util.searchlightQueryGenerator',
      SearchlightQueryGenerator);

  SearchlightQueryGenerator.$inject = [
    'searchlight-ui.settings.settingsService',
    'searchlight-ui.util.searchlightQueryUtils',
    'searchlight-ui.util.searchlightFacetUtils'
  ];

  /**
   * @ngdoc service
   * @name searchlight-ui.util.resourceLocator
   * @description Locates resources in openstack dashboard.
   *
   * @param {function} settingsService settingsService
   *
   * @param {function} searchlightQueryUtils searchlightQueryUtils
   *
   * @param {function} searchlightFacetUtils searchlightFacetUtils
   *
   * @returns {function} This service
   */
  function SearchlightQueryGenerator(settingsService,
                                     searchlightQueryUtils,
                                     searchlightFacetUtils)
  {
    var service = {
      generate: generate,
      generateItems: generateItems
    };

    return service;

    //////////////////

    function generate(options) {
      options = options || {};

      var searchlightQuery = {
        query: options.query || {}
      };

      searchlightQuery.all_projects = settingsService.settings.general.all_projects;
      searchlightQuery.limit = settingsService.settings.general.limit;
      searchlightQuery.sort = [settingsService.settings.sort.selected.query];

      var allFacetDefinitions = options.allFacetDefinitions || [];

      parseQueryOptions(options);

      return searchlightQuery;

      //////////////////

      function parseQueryOptions(options) {
        addQueryStringFromOptions(options);
        addSelectedFacetsFromOptions(options);
        addRawMagicSearchQueryFromOptions(options);
        addVersionToQuery();
        addDefaultQuery();
        searchlightQueryUtils.addHighlighting(searchlightQuery);
      }

      function addDefaultQuery() {
        if (angular.equals({}, searchlightQuery.query)) {
          searchlightQuery.query = {"match_all": {}};
        }
      }

      function addVersionToQuery() {
        searchlightQuery.version = true;
      }

      function addSelectedFacetsFromOptions(options) {
        if (angular.isDefined(options.selectedFacets)) {
          var keyValuePairs = searchlightFacetUtils.queryParamsToKeyValuePairObjects(
            options.selectedFacets);
          addKeyValuePairsToQuery(searchlightQuery.query, keyValuePairs);
        }
      }

      function addQueryStringFromOptions(options) {
        if (angular.isDefined(options.queryString)) {
          searchlightQueryUtils.addQueryString(searchlightQuery.query, options.queryString);
        }
      }

      function addRawMagicSearchQueryFromOptions(options) {
        if (angular.isDefined(options.magicSearchQuery)) {
          var keyValuePairs = searchlightFacetUtils.queryParamsToKeyValuePairObjects(
            options.magicSearchQuery);
          addKeyValuePairsToQuery(keyValuePairs);
        }
      }

      function addKeyValuePairsToQuery(keyValuePairs) {
        angular.forEach(keyValuePairs, addKeyValuePairToQuery);
      }

      function addKeyValuePairToQuery(param) {
        var facet = {};
        facet.name = Object.keys(param)[0];
        facet.value = param[facet.name];

        if (!searchlightFacetUtils.isServerFacet(facet.name, allFacetDefinitions)) {
          return;
        }

        if (angular.isString(facet.value) && facet.value.match('{.*}')) {
          facet.value = angular.fromJson(facet.value);
        }

        if (searchlightQueryUtils.addSearchKeyword(searchlightQuery, facet)) {
          return;
        } else if (searchlightQueryUtils.addDefinedQueryParam(searchlightQuery.query, facet)) {
          return;
        } else {
          // Pass the facet definition through to the query builder
          var definition = searchlightFacetUtils.getDefinition(facet.name, allFacetDefinitions);
          searchlightQueryUtils.addBestGuessBoolQueryParam(searchlightQuery.query, param,
                                                           facet, definition);
        }
      }
    }

    /**
     * Generate a searchlight query to get the latest version of a list of specific items
     * returned by a prior searchlight query. Use the "_uid" query. See:
     * https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-uid-field.html
     *
     * @param items - an array of items from the results of prior searchlight search. They must
     * have an "_id" and "_type" field set by the searchlight API.
     *
     * @returns {*} - an object that can be used as the searchlight query
     */
    function generateItems(items) {
      var item, i, values;
      var valuesByType = {};
      for ( i = 0; i < items.length; i++ ) {
        item = items[i];
        values = valuesByType[item._type];
        if (!values) {
          values = [];
          valuesByType[item._type] = values;
        }
        values.push(item._id);
      }

      var queryOptions = {
        "query": {
          "bool": {
            "filter": {
              "bool": {
                "should": typesToIdsQueries(valuesByType)
              }
            }
          }
        }
      };

      return service.generate(queryOptions);
    }

    function typesToIdsQueries(valuesByType) {
      return Object.keys(valuesByType).map(function typeToIdsQuery(key) {
        return {
          "ids": {
            "type": key,
            "values": valuesByType[key]
          }
        };
      });
    }

  }
}());
