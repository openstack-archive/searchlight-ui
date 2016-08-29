/*
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
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
(function() {
  "use strict";

  var services = [
    {
      name: 'resources.os-nova-servers.actions.hard-reboot.service',
      allowWhen: ['ACTIVE', 'SHUTOFF'],
      disallowWhen: ['SOMETHINGELSE', 'RUNNING'],
      novaCommand: 'hardRebootServer'
    },
    {
      name: 'resources.os-nova-servers.actions.soft-reboot.service',
      allowWhen: ['ACTIVE'],
      disallowWhen: ['SOMETHINGELSE', 'RUNNING', 'SHUTOFF'],
      novaCommand: 'softRebootServer'
    },
    {
      name: 'resources.os-nova-servers.actions.pause.service',
      allowWhen: ['ACTIVE'],
      disallowWhen: ['SOMETHINGELSE', 'SHUTOFF'],
      novaCommand: 'pauseServer'
    },
    {
      name: 'resources.os-nova-servers.actions.unpause.service',
      allowWhen: ['PAUSED'],
      disallowWhen: ['ACTIVE', 'SHUTOFF'],
      novaCommand: 'unpauseServer'
    },
    {
      name: 'resources.os-nova-servers.actions.suspend.service',
      allowWhen: ['ACTIVE'],
      disallowWhen: ['SOMETHINGELSE', 'SHUTOFF'],
      novaCommand: 'suspendServer'
    },
    {
      name: 'resources.os-nova-servers.actions.resume.service',
      allowWhen: ['SUSPENDED'],
      disallowWhen: ['ACTIVE', 'SHUTOFF'],
      novaCommand: 'resumeServer'
    },
    {
      name: 'resources.os-nova-servers.actions.start.service',
      allowWhen: ['SHUTDOWN', 'SHUTOFF', 'CRASHED'],
      disallowWhen: ['ACTIVE', 'ETC'],
      novaCommand: 'startServer',
      ignoreDeletedState: true
    },
    {
      name: 'resources.os-nova-servers.actions.stop.service',
      allowPowerState: [1, 7 ], // RUNNING, SUSPENDED
      disallowPowerState: ['ACTIVE', 'ETC'],
      novaCommand: 'stopServer'
    }
  ];

  services.forEach(function(serviceObj) {
    describe(serviceObj.name, function() {
      var service, $q, $timeout;
      beforeEach(module('resources.os-nova-servers.actions'));
      beforeEach(inject(function($injector, _$q_, _$timeout_) {
        service = $injector.get(serviceObj.name);
        $q = _$q_;
        $timeout = _$timeout_;
      }));

      it('exists', function() {
        expect(angular.isDefined(service));
      });

      describe('allowed', function() {
        var policy, userSession;
        beforeEach(inject(function($injector) {
          policy = $injector.get('horizon.app.core.openstack-service-api.policy');
          userSession = $injector.get('horizon.app.core.openstack-service-api.userSession');
          spyOn(policy, 'ifAllowed').and.returnValue(true);
          spyOn(userSession, 'isCurrentProject').and.returnValue(true);
          service.initScope();
        }));

        if (serviceObj.allowWhen) {
          it('is valid when in proper state', function() {
            serviceObj.allowWhen.forEach(function(status) {
              var instance = {status: status};
              service.allowed(instance).then(pass, fail);
              $timeout.flush();
            });
          });
        }

        if (serviceObj.disallowWhen) {
          it('is not valid when not in proper state', function() {
            serviceObj.disallowWhen.forEach(function(status) {
              var instance = {status: status};
              service.allowed(instance).then(fail, pass);
              $timeout.flush();
            });
          });
        }

        if (serviceObj.allowPowerState) {
          it('is valid when in proper power state', function() {
            serviceObj.allowPowerState.forEach(function(status) {
              var instance = {'OS-EXT-STS:power_state': status};
              service.allowed(instance).then(pass, fail);
              $timeout.flush();
            });
          });
        }

        if (serviceObj.disallowPowerState) {
          it('is not valid when not in proper power state', function() {
            serviceObj.disallowPowerState.forEach(function(status) {
              var instance = {'OS-EXT-STS:power_state': status};
              service.allowed(instance).then(fail, pass);
              $timeout.flush();
            });
          });
        }

        if (!serviceObj.ignoreDeletedState) {
          it('is not valid when in proper state but deleting', function() {
            (serviceObj.allowWhen || serviceObj.allowPowerState).forEach(function(status) {
              var instance = {status: status, 'OS-EXT-STS:task_state': 'DELETING'};
              service.allowed(instance).then(fail, pass);
              $timeout.flush();
            });
          });
        }

        function pass() {
          expect(true).toBe(true);
        }

        function fail() {
          expect(true).toBe(false);
        }
      });

      describe('perform', function() {
        var nova, spinner, executeCall;
        beforeEach(inject(function($injector) {
          nova = $injector.get('horizon.app.core.openstack-service-api.nova');
          spinner = $injector.get('horizon.framework.widgets.modal-wait-spinner.service');
          executeCall = $q.defer();
          spyOn(nova, serviceObj.novaCommand).and.returnValue(executeCall.promise);
          spyOn(spinner, 'showModalSpinner');
        }));

        it('opens the spinner', function() {
          executeCall.resolve(true);
          service.perform({id: 20});
          expect(spinner.showModalSpinner).toHaveBeenCalled();
        });

        it('calls ' + serviceObj.novaCommand, function() {
          executeCall.resolve(true);
          service.perform({id: 20});
          expect(nova[serviceObj.novaCommand]).toHaveBeenCalledWith(20);
        });

        it('closes the spinner when execution passes', function() {
          spyOn(spinner, 'hideModalSpinner');
          executeCall.resolve();
          service.perform({id: 20});
          $timeout.flush();
          expect(spinner.hideModalSpinner).toHaveBeenCalled();
        });

        it('closes the spinner when execution fails', function() {
          spyOn(spinner, 'hideModalSpinner');
          executeCall.reject();
          service.perform({id: 20});
          $timeout.flush();
          expect(spinner.hideModalSpinner).toHaveBeenCalled();
        });
      });
    });
  });

})();
