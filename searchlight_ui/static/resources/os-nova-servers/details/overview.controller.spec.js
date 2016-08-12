/*
 * (c) Copyright 2016 Hewlett Packard Enterprise Development LP
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  describe('ServerOverviewController', function() {
    var ctrl, $timeout;

    beforeEach(module('resources.os-nova-servers.details'));
    beforeEach(inject(function($controller, $q, _$timeout_) {
      $timeout = _$timeout_;
      var deferred = $q.defer();
      deferred.resolve({data: {my: 'info', flavor: {id: 123}}});
      var scope = {
        context: {
          loadPromise: deferred.promise
        }
      };
      ctrl = $controller('ServerOverviewController', {
        $scope: scope
      });
    }));

    it('exists', function() {
      expect(ctrl).toBeDefined();
    });

    it('sets resourceType', function() {
      expect(ctrl.resourceType).toBeDefined();
    });

    describe('ruleToString', function() {

      it('produces expected output', function() {
        var useCases = [
          [
            {
              ethertype: 'IPv4',
              direction: 'ingress',
              port_range_min: 10,
              port_range_max: 25,
              protocol: 'TCP',
              remote_ip_prefix: '10.0.0.1'
            },
            "ALLOW IPv4 10-25/tcp from 10.0.0.1"
          ],
          [
            {
              ethertype: 'IPv4',
              direction: 'ingress',
              port_range_min: 10,
              port_range_max: 10,
              protocol: 'TCP',
              remote_ip_prefix: '10.0.0.1'
            },
            "ALLOW IPv4 10/tcp from 10.0.0.1"
          ],
          [
            {
              ethertype: 'IPv6',
              direction: 'egress',
              remote_ip_prefix: null
            },
            "ALLOW IPv6  to ANY"
          ]
        ];

        useCases.forEach(function(useCase) {
          expect(ctrl.ruleToString(useCase[0])).toEqual(useCase[1]);
        });

      });

    });

    it('getAddresses output addresses', function() {
      var input = [
        {addr: "127.0.0.1"},
        {addr: "192.168.0.1"}
      ];
      expect(ctrl.getAddresses(input)).toEqual("127.0.0.1, 192.168.0.1");
    });

    describe('on load', function() {
      var nova;

      beforeEach(inject(function($injector, $q) {
        nova = $injector.get('horizon.app.core.openstack-service-api.nova');
        var defFlavor = $q.defer();
        defFlavor.resolve({data: {lines: ['line3', 'line2', 'line1']}});
        var defVolumes = $q.defer();
        defVolumes.resolve({data: {items: []}});
        var defSecGroups = $q.defer();
        defSecGroups.resolve({data: {items: []}});
        spyOn(nova, 'getFlavor').and.returnValue(defFlavor.promise);
        spyOn(nova, 'getServerVolumes').and.returnValue(defVolumes.promise);
        spyOn(nova, 'getServerSecurityGroups').and.returnValue(defSecGroups.promise);
        $timeout.flush();
      }));

      it('sets data on load', function() {
        expect(ctrl.server).toEqual({my: 'info', flavor: {id: 123}});
      });
    });

  });

})();
