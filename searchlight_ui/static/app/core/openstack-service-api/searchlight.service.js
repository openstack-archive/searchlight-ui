/**
 * Copyright 2016, Hewlett-Packard Development Company, L.P.
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
    .module('horizon.app.core.openstack-service-api')
    .factory('horizon.app.core.openstack-service-api.searchlight', SearchlightAPI);

  SearchlightAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc service
   * @name horizon.app.core.openstack-service-api.searchlight
   * @description Provides direct access to Searchlight APIs.
   */
  function SearchlightAPI(apiService, toastService) {

    var service = {
      postSearch: postSearch,
      getPlugins: getPlugins,
      getFacets: getFacets
    };

    return service;

    //////////////////

    /**
     * @name horizon.app.core.openstack-service-api.searchlight.postSearch
     * @description
     * Runs a search.
     *
     * The return value will be an object with keys 'total', 'max_score',
     * 'hits'. 'hits' is a list containing objects which are results from
     * elasticsearch. Each result is an object with keys '_id', 'index', 'type'
     * and '_source', the latter being the document source. See the searchlight
     * documentation for a full list of options.
     *
     * @param {Object} queryParams
     * Query parameters. Optional.
     *
     * @param {Object} queryParams.query
     * Search filter. The default is {"match_all": {}}. See the Elasticsearch
     * query DSL (https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html).
     *
     * @param {string} queryParams.type
     * Limit results to one or more types (e.g. OS::Glance::Image).
     *
     * @param {Object} queryParams.sort
     * Set sort order; can be a string (leading '-' for descending order'),
     * object ({"field_name": {"order": "asc"}}) or a list of objects and/or
     * strings for multiple sort fields.
     *
     * @param {number} queryParams.limit
     * Limit on the number of results.
     *
     * @param {number} queryParams.offset
     * Offset for search results
     */
    function postSearch(queryParams, suppressToast) {
      queryParams = queryParams ? queryParams : {};

      var promise = apiService.post('/api/searchlight/search/', queryParams);

      return suppressToast ? promise : promise.error(function () {
        toastService.add('error', gettext('Unable to execute the search.'));
      });
    }

    /**
     * @name horizon.app.core.openstack-service-api.searchlight.getPlugins
     * @description
     * Get a list of enabled searchlight resources.
     *
     * {"plugins": [{"name": "OS::Glance::Image",
     *               "index": "glance", "type": "OS::Glance::Image"}
     * .. ]
     */
    function getPlugins() {
      return apiService.get('/api/searchlight/plugins/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve Searchlight resources types.'));
        });
    }

    /**
     * @name horizon.app.core.openstack-service-api.searchlight.getFacets
     * @description
     * Get a list of search resource facets
     *
     * @param {Object} params
     * Query parameters. Optional.
     *
     * @param {Object} params.index_name
     * The index name to get results from.
     *
     * @param {string} params.doc_type
     * The document type. eg. OS::Nova::Server
     *
     * @param {boolean} suppressToast
     * If passed in, this will not show the default error handling
     * (horizon alert). The glance API may not have metadata definitions
     * enabled.
     */
    function getFacets(params, suppressToast) {
      var config = (params) ? {'params': params} : {};
      var promise = apiService.get('/api/searchlight/facets/', config);

      return suppressToast ? promise : promise.error(function () {
        toastService.add('error', gettext('Unable to retrieve search facets.'));
      });
    }

  }
}());
