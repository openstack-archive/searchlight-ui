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
    .factory('searchlight-ui.util.searchlightFacetUtils', FacetUtils);

  FacetUtils.$inject = [
    'slCommonStatusFilter',
    'slResourceLabelerFilter',
    'searchlight-ui.util.searchlightQueryUtils',
    'horizon.app.core.openstack-service-api.searchlight'
  ];

  /**
   * @ngdoc service
   * @name searchlight-ui.searchlightFacetUtils
   * @description Maps to / from Searchlight / Magic Search facets
   *
   * @param {function} slCommonStatusFilter slCommonStatusFilter filter
   *
   * @param {function} slResourceLabeler slResourceLabelerFilter
   *
   * @param {function} searchlightQueryUtils searchlightQueryUtils
   *
   * @param {function} searchlight searchlight API
   *
   * @returns {function} This service
   */
  function FacetUtils(slCommonStatusFilter,
                      slResourceLabeler,
                      searchlightQueryUtils,
                      searchlight)
  {
    var service = {
      addResourceTypeFacets: addResourceTypeFacets,
      broadcastFacetsChanged: broadcastFacetsChanged,
      defaultFacets: defaultFacets,
      facetListToKeyValuePairs: facetListToKeyValuePairs,
      initScope: initScope,
      isServerFacet: isServerFacet,
      keyValueStringToKeyValueObject: keyValueStringToKeyValueObject,
      queryParamsToKeyValuePairObjects: queryParamsToKeyValuePairObjects,
      removeFacetsNotInResourceTypes: removeFacetsNotInResourceTypes,
      setTypeFacetFromResourceTypes: setTypeFacetFromResourceTypes,
      timeRangeFacetPastOptions: timeRangeFacetPastOptions,
      typeFacetFromResourceTypes: typeFacetFromResourceTypes,
      updateResourceTypeFacets: updateResourceTypeFacets
    };

    return service;

    //////////////////

    var scope;

    function initScope(newScope) {
      scope = newScope;
    }

    function defaultFacets() {
      return [
        {
          label: gettext('Name'),
          name: 'name',
          isServer: true,
          singleton: true,
          persistent: true
        },
        {
          label: gettext('Created'),
          name: 'created_at',
          singleton: true,
          isServer: true,
          persistent: true,
          options: service.timeRangeFacetPastOptions('created_at')
        },
        {
          label: gettext('Updated'),
          name: 'updated_at',
          singleton: true,
          isServer: true,
          persistent: true,
          options: service.timeRangeFacetPastOptions('updated_at')
        }
      ];
    }

    function broadcastFacetsChanged(data) {
      scope.$broadcast('facetsChanged', data);
    }

    function updateResourceTypeFacets(resourceTypes, allFacetDefinitions) {

      if (angular.isString(resourceTypes)) {
        service.addResourceTypeFacets(resourceTypes, allFacetDefinitions);
      } else if (angular.isArray(resourceTypes)) {
        angular.forEach(resourceTypes, function (type) {
          service.addResourceTypeFacets(type, allFacetDefinitions);
        });
      }

      service.removeFacetsNotInResourceTypes(resourceTypes, allFacetDefinitions);
    }

    function addResourceTypeFacets(resourceType, allFacetDefinitions) {
      // Searchlight standardardizes on created_at / updated_at,
      // and some resource types have both.
      var skipFacets = {
        'name': {},
        'created': {},
        'created_at': {},
        'updated': {},
        'updated_at': {}
      };

      angular.forEach(allFacetDefinitions, addSkipFacets);

      function addSkipFacets(facet) {
        skipFacets[facet.name] = facet;
      }

      if (!hasResourceTypeFacets(resourceType, allFacetDefinitions)) {
        searchlight.getFacets({type: resourceType}).success(updateAvailableFacetsForType);
      }

      function updateAvailableFacetsForType(response) {
        var searchlightFacets = response[resourceType] || [];
        searchlightFacets = searchlightFacets.filter(facetNameFilter);

        function facetNameFilter(searchlightFacet) {
          return angular.isUndefined(skipFacets[searchlightFacet.name]);
        }

        var newFacets = convertSearchlightFacetsToMagicSearchFacets(
          resourceType, searchlightFacets);

        if (newFacets && newFacets.length > 0) {
          Array.prototype.push.apply(allFacetDefinitions, newFacets);
          broadcastFacetsChanged();
        }
      }

      function convertSearchlightFacetsToMagicSearchFacets(resourceType, searchlightFacets) {
        var result = searchlightFacets.map(
          function (searchlightFacet) {
            // TODO Update query sub boolean to be limited to resource type
            var facetLabel = interpolate(gettext('%(resourceType)s: %(searchFacet)s'),
              {
                resourceType: slResourceLabeler(resourceType),
                searchFacet: slResourceLabeler(resourceType, searchlightFacet.name)
              },
              true
            );
            var newFacet = {
              resourceType: resourceType,
              label: facetLabel,
              name: searchlightFacet.name,
              singleton: true,
              isServer: true,
              type: searchlightFacet.type
            };

            if (searchlightFacet.type === 'date') {
              newFacet.options = timeRangeFacetPastOptions(searchlightFacet.name);
            } else if (searchlightFacet.options) {
              newFacet.options = convertSearchlightFacetOptionsToMagicSearchOptions(
                resourceType, searchlightFacet);
            }

            return newFacet;
          });

        result.sort(alphabeticalSortCompareByLabel);
        return result;
      }

      function convertSearchlightFacetOptionsToMagicSearchOptions(resourceType, searchlightFacet) {
        return searchlightFacet.options.map(
          function addOptions(searchlightFacetOption) {
            var option = {
              key: searchlightFacetOption.key
            };

            if ("status" === searchlightFacet.name.toLowerCase()) {
              option.label = slCommonStatusFilter(searchlightFacetOption.key);
            } else {
              option.label = slResourceLabeler(
                resourceType, searchlightFacetOption.key, searchlightFacet.name);
            }

            if (searchlightFacetOption.doc_count) {
              var count = interpolate(gettext('(%(doc_count)s)'),
                {
                  doc_count: searchlightFacetOption.doc_count
                },
                true
              );
              option.label = option.label + ' ' + count;
            }

            return option;
          });
      }
    }

    function alphabeticalSortCompareByLabel(a, b) {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    }

    function isServerFacet(facetName, facetDefinitions) {
      return facetDefinitions.some(isCurrentFacetServerFacet);

      function isCurrentFacetServerFacet(facet) {
        return facet.name === facetName && facet.isServer;
      }
    }

    function hasResourceTypeFacets(resourceType, facets) {
      return facets.some(isResourceTypeFacet);

      function isResourceTypeFacet(facet) {
        return facet.resourceType && facet.resourceType === resourceType;
      }
    }

    function facetListToKeyValuePairs(facets) {
      var result = [];
      if (angular.isDefined(facets)) {
        var parameterArray = facets.map(function (facet) {
          return facet.name;
        });
        parameterArray.forEach(function (param) {
          result.push(keyValueStringToKeyValueObject(param));
        });
      }
      return result;
    }

    function keyValueStringToKeyValueObject(keyValueString) {
      // TODO we need to re-write magic search to not send things in non-encoded urls
      // Range queries (size:>=1) will result in size=>=1), so for now,
      // just split on the first = match and consider everything else to
      // be the query.
      var paramSplit = keyValueString.split(/\=(.*)/);
      var keyValuePair = {};
      if (angular.isDefined(paramSplit[1])) {
        keyValuePair[paramSplit[0]] = paramSplit[1];
      }
      return keyValuePair;
    }

    //Note: magic search queries do NOT escape = or &, so if that is
    //in the input, it will cause problems here.
    function queryParamsToKeyValuePairObjects(urlQueryParams) {
      urlQueryParams = urlQueryParams || '';
      var result = [];
      urlQueryParams.split('&').forEach(function (param) {
        result.push(keyValueStringToKeyValueObject(param));
      });
      return result;
    }

    function removeFacetsNotInResourceTypes(resourceTypes, facets) {
      var facetsChanged = false;

      if (resourceTypes && resourceTypes.length > 0) {
        facetsChanged = filterOutNonResourceTypesFacets(resourceTypes, facets);
      } else {
        facetsChanged = filterOutAllResourceTypeFacets(facets);
      }

      if (facetsChanged) {
        service.broadcastFacetsChanged();
      }
    }

    function filterOutNonResourceTypesFacets(resourceTypes, facets) {
      var facetsChanged = false;

      // Only keep facets that are in the resource types array or in the facetsToKeep
      var resourceTypeIsArray = angular.isArray(resourceTypes);
      var currentFacet;
      for (var idx = facets.length - 1; idx >= 0; idx--) {
        currentFacet = facets[idx];
        if (!currentFacet.persistent && currentFacet.resourceType &&
          (!resourceTypeIsArray && !angular.equals(currentFacet.resourceType, resourceTypes) ||
          resourceTypeIsArray && resourceTypes.indexOf(currentFacet.resourceType) < 0)) {
          facets.splice(idx, 1);
          facetsChanged = true;
        }
      }

      return facetsChanged;
    }

    function filterOutAllResourceTypeFacets(facets) {
      var facetsChanged = false;

      // Remove all facets specific to resource types
      for (var i = facets.length - 1; i >= 0; i--) {
        var facet = facets[i];
        if (!facet.persistent && facet.resourceType) {
          facets.splice(i, 1);
          facetsChanged = true;
        }
      }

      return facetsChanged;
    }

    function timeRangeFacetPastOptions(field) {
      return [
        {
          label: gettext('Past 10 Minutes'),
          key: searchlightQueryUtils.getTimeRangeBoolOption('must', field, 'now-10m')
        },
        {
          label: gettext('Past Half Hour'),
          key: searchlightQueryUtils.getTimeRangeBoolOption('must', field, 'now-30m')
        },
        {
          label: gettext('Past Hour'),
          key: searchlightQueryUtils.getTimeRangeBoolOption('must', field, 'now-1h')
        },
        {
          label: gettext('Past Day'),
          key: searchlightQueryUtils.getTimeRangeBoolOption('must', field, 'now-1d')
        },
        {
          label: gettext('Past Week'),
          key: searchlightQueryUtils.getTimeRangeBoolOption('must', field, 'now-1w')
        },
        {
          label: gettext('Past Month'),
          key: searchlightQueryUtils.getTimeRangeBoolOption('must', field, 'now-1M')
        },
        {
          label: gettext('Past Year'),
          key: searchlightQueryUtils.getTimeRangeBoolOption('must', field, 'now-1y')
        }
      ];
    }

    function setTypeFacetFromResourceTypes(resourceTypes, allFacetDefinitions) {

      var updatedFacets = allFacetDefinitions.filter(typeFacetFilter);

      function typeFacetFilter(facet) {
        return facet.name !== '_type';
      }

      updatedFacets.unshift(typeFacetFromResourceTypes(resourceTypes));

      allFacetDefinitions.length = 0;
      Array.prototype.push.apply(allFacetDefinitions, updatedFacets);
    }

    function typeFacetFromResourceTypes(resourceTypes, options) {
      options = options || {};

      var result = {
        label: gettext('Type'),
        name: '_type',
        singleton: angular.isDefined(options.singleton) ? options.singleton : false,
        isServer: true,
        options: []
      };

      result.options = resourceTypes.map(typeToOption);

      function typeToOption(type) {
        return {
          label: slResourceLabeler(type),
          key: type
        };
      }

      result.options.sort(alphabeticalSortCompareByLabel);
      return result;
    }

  }
}());
