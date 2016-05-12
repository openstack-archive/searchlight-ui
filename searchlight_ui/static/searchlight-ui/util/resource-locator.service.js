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
    .factory('searchlight-ui.util.resourceLocator', ResourceLocator);

  ResourceLocator.$inject = [
    '$window'
  ];

  /**
   * @ngdoc service
   * @name searchlight-ui.util.resourceLocator
   * @description Locates resources in openstack dashboard.
   *
   * @param {function} $window ng $window service
   *
   * @returns {function} This service.
   */
  function ResourceLocator($window) {

    var service = {
      getResourceUrl: getResourceUrl
    };

    return service;

    //////////////////

    /**
     * @name searchlight-ui.util.resourceLocator
     * @description
     * Takes a search hit and maps it to the detail page URL for it.
     *
     * @param {function} hit A search result
     *
     * @returns {function} This service.
    */
    function getResourceUrl(hit) {
      var basePath = $window.WEBROOT;
      var idPattern = 'resourceId';

      // TODO pull this resource type registry
      // And / or create REST API from:
      // openstack_dashboard/dashboards/project/stacks/mappings.py

      var resourceDetailUrls = {
        'OS::Cinder::Backup': basePath + 'project/volumes/backups/' + idPattern,
        'OS::Cinder::Snapshot': basePath + 'project/volumes/snapshots/' + idPattern,
        'OS::Cinder::Volume': basePath + 'project/volumes/' + idPattern,
        'OS::Glance::Image': basePath + 'project/images/' + idPattern,
        'OS::Glance::Metadef': basePath + 'admin/metadata_defs/' + idPattern + '/detail',
        'OS::Neutron::HealthMonitor': basePath + 'project/loadbalancers/monitor/' + idPattern,
        'OS::Neutron::Net': basePath + 'project/networks/' + idPattern + '/detail',
        'OS::Neutron::Pool': basePath + 'project/loadbalancers/pool/' + idPattern,
        'OS::Neutron::PoolMember': basePath + 'project/loadbalancers/members/' + idPattern,
        'OS::Neutron::Port': basePath + 'project/networks/ports/' + idPattern + '/detail',
        'OS::Neutron::Router': basePath + 'project/routers/' + idPattern,
        'OS::Neutron::Subnet': basePath + 'project/networks/subnets/' + idPattern + '/detail',
        'OS::Nova::Server': basePath + 'project/instances/' + idPattern,
        'OS::Swift::Container': basePath + 'project/containers/' + idPattern,
        'OS::Swift::Object': basePath + 'project/containers/' + idPattern + '/' +
          idPattern + '/download',
        'OS::Designate::Zone': basePath + 'project/dns_domains/' + idPattern,
        'OS::Designate::RecordSet': basePath + 'project/dns_domains/' + idPattern +
          '/records/' + idPattern
      };

      var result = resourceDetailUrls[hit._type] || '';

      //TODO: Recurse up parents to find all IDs when more than one parent
      var ids = [];
      if (hit._parent) {
        ids.push(hit._parent);
      }
      // Be default we want to use the source ID, but fall back to hit._id.
      // Searchlight hit._id may include extra information appended after _.
      ids.push(hit._source.id || hit._id.split('_')[0]);

      if (angular.isDefined(result)) {
        angular.forEach(ids, function (id) {
          result = result.replace(idPattern, id);
        });
      }

      return result;
    }

  }
}());
