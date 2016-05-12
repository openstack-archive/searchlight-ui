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
    .factory('searchlight-ui.util.searchlightQueryUtils', SearchlightQueryUtils);

  SearchlightQueryUtils.$inject = [
    'searchlight-ui.settings.settingsService'
  ];

  /**
   * @ngdoc service
   * @name searchlight-ui.util.resourceLocator
   * @description Locates resources in openstack dashboard.
   *
   * @param {function} settingsService settingsService
   *
   * @returns {function} This service
   */
  function SearchlightQueryUtils(settingsService) {

    var service = {
      addSearchKeyword: addSearchKeyword,
      addBestGuessBoolQueryParam: addBestGuessBoolQueryParam,
      addDefinedBoolParam: addDefinedBoolParam,
      addDefinedQueryParam: addDefinedQueryParam,
      addHighlighting: addHighlighting,
      addQueryString: addQueryString,
      getTimeRangeBoolOption: getTimeRangeBoolOption,
      initializeBoolQuery: initializeBoolQuery,
      search: search
    };

    return service;

    //////////////////

    function search(queryOptions) {
      queryOptions = queryOptions || {};
      queryOptions.allFacetDefinitions = ctrl.searchFacets;
      ctrl.lastSearchQueryOptions = queryOptions;

      var searchlightQuery = searchlightQueryGenerator.generate(queryOptions);

      searchlightFacetUtils.updateResourceTypeFacets(searchlightQuery.type, ctrl.searchFacets);

      if (!searchlightQuery.type) {
        searchlightQuery.type = ctrl.defaultResourceTypes;
      }

      return searchlight
        .postSearch(searchlightQuery, true)
        .error(onSearchSuccess);
    }

    function initializeBoolQuery(query) {
      query = query || {};
      query.bool = query.bool || {};
    }

    function getTimeRangeBoolOption(boolType, field, from) {
      var range = {};
      range[field] = {'from': from};

      var option = {};
      option[boolType] = {'range': range};

      return angular.toJson({'bool': option});
    }

    function addSearchKeyword(searchlightQuery, facet) {
      // Return true if a search keyword is found.

      if (angular.equals('_type', facet.name)) {
        searchlightQuery.type = searchlightQuery.type || [];
        searchlightQuery.type.push(facet.value);
      } else if (angular.equals('_sort', facet.name)) {
        searchlightQuery.sort = query.sort || [];
        searchlightQuery.sort.push(facet.value);
      } else if (angular.equals('_offset', facet.name)) {
        searchlightQuery.offset = facet.value;
      } else if (angular.equals('_source', facet.name)) {
        searchlightQuery._source = facet.value;
      } else if (angular.equals('_limit', facet.name)) {
        searchlightQuery.limit = facet.value;
      } else {
        return false;
      }

      return true;
    }

    function addDefinedQueryParam(query, facet) {
      if (angular.isObject(facet.value)) {
        if (facet.value.bool) {
          addDefinedBoolParam(query, facet.value.bool);
          return true;
        }
      } else if (angular.equals(facet.name, 'query_string')) {
        addQueryString(query, facet.value);
        return true;
      } else {
        return false;
      }
    }

    function addDefinedBoolParam(query, bool) {
      initializeBoolQuery(query);
      if (bool.must) {
        query.bool.must = query.bool.must || [];
        query.bool.must.push(bool.must);
      }

      if (bool.should) {
        query.bool.should = query.bool.should || [];
        query.bool.should.push(bool.should);
      }

      if (bool.must_not) {
        query.bool.must_not = query.bool.must_not || [];
        query.bool.must_not.push(bool.must_not);
      }

      if (bool.minimum_should_match) {
        query.bool.minimum_should_match = bool.minimum_should_match;
      }
    }

    function addQueryString(query, inputQueryString) {
      //See https://www.elastic.co/guide/en/elasticsearch/
      // reference/current/query-dsl-query-string-query.html
      if (inputQueryString) {
        initializeBoolQuery(query);
        query.bool.must = query.bool.must || [];
        var queryString = {
          //We don't want to support regex right now.
          //https://bugs.launchpad.net/searchlight/+bug/1551946
          query_string: {
            query: inputQueryString.replace(/\//g, '\\/'),
            phrase_slop: settingsService.settings.fullTextSearch.phrase_slop,
            lenient: settingsService.settings.fullTextSearch.lenient,
            analyze_wildcard: settingsService.settings.fullTextSearch.analyze_wildCard
          }
        };
        query.bool.must.push(queryString);
      }
    }

    function addBestGuessBoolQueryParam(query, param, facet) {
      initializeBoolQuery(query);

      query.bool.must = query.bool.must || [];
      var newMust = {};
      var queryString = {};
      //We don't want to support regex right now.
      //https://bugs.launchpad.net/searchlight/+bug/1551946
      facet.value = facet.value.replace(/\//g, '\\/');

      if (~facet.value.indexOf('~') || facet.name === 'name') {
        queryString = {
          fuzzy_prefix_length: 2,
          fields: [facet.name],
          query: ~facet.value.indexOf('~') ? facet.value : facet.value + '~'
        };
        newMust.query_string = queryString;
      } else {
        // Treat all facets just like query string syntax allowing input to
        // support a lot of the the same goodness as full text search, just
        // limiting to selected facet. Don't try to do anything smart here
        // let the server sort it out.
        queryString = {
          fields: [facet.name],
          query: facet.value
        };
        newMust.query_string = queryString;
      }

      //TODO handle nested better
      if (~facet.name.indexOf('.')) {
        var nestedMust = {
          'nested': {
            'path': facet.name.split('.')[0],
            'query': newMust
          }
        };
        query.bool.must.push(nestedMust);
      } else {
        query.bool.must.push(newMust);
      }
    }

    function addHighlighting(searchlightQuery) {
      if (settingsService.settings.highlighting.enabled) {
        searchlightQuery.highlight = settingsService.settings.highlighting.config;
      } else {
        delete searchlightQuery.highlight;
      }
    }
  }

})();
