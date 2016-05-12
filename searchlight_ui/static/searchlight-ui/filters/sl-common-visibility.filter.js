/**
 * (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
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
    .module('searchlight-ui.filters')
    .filter('slCommonVisibility', slCommonVisibility);

  slCommonVisibility.$inject = [
    'imageVisibilityFilter',
    'horizon.framework.util.i18n.gettext'
  ];

  /**
   * @ngdoc filter
   * @name slCommonStatusFilter
   * @description
   * Takes raw status from the API and returns the user friendly status if found.
   *
   * @param {function} $filter angular filter
   *
   * @param {function} gettext internationalization
   *
   * @returns {String} User friendly status if found.
   */
  function slCommonVisibility(imageVisibility, gettext) {
    var defaultVisibilities = {
      'public': gettext('Public'),
      'private': gettext('Owned by Me'),
      'shared_with_me': gettext('Shared with Me'),
      'shared_by_me': gettext('Shared by Me'),
      'shared': gettext('Shared with Me'),
      'unknown': null
    };

    var sharedByMeIfOwnedByMe = [
      defaultVisibilities.public,
      defaultVisibilities.shared,
      defaultVisibilities.shared_by_me,
      defaultVisibilities.shared
    ];

    //TODO use the registry
    var registeredFilters = {
      'OS::Glance::Image': imageVisibility,
      'OS::Glance::Snapshot': imageVisibility
    };

    return function getVisibility(resourceType, resourceSource, currentProjectId) {
      if (null !== resourceSource && angular.isDefined(resourceSource)) {
        if (registeredFilters[resourceType]) {
          return registeredFilters[resourceType](resourceSource, currentProjectId);
        }
      }

      return evaluateBasicVisbilityRules(resourceSource, currentProjectId);
    };

    function evaluateBasicVisbilityRules(resourceSource, currentProjectId) {
      // visibility property is preferred over is_public property
      var translatedVisibility;
      if (angular.isDefined(resourceSource.visibility)) {
        translatedVisibility = safeTranslateVisibility(resourceSource.visibility);
      } else if (angular.isDefined(resourceSource.is_public)) {
        translatedVisibility = translateIsPublic(resourceSource.is_public);
      } else if (angular.isDefined(resourceSource.shared)) {
        translatedVisibility = translateShared(resourceSource.shared);
      } else {
        translatedVisibility = defaultVisibilities.unknown;
      }

      return deriveSharingStatus(resourceSource, currentProjectId, translatedVisibility);
    }

    function deriveSharingStatus(resourceSource, currentProjectId, translatedVisibility) {
      if (angular.equals(defaultVisibilities.unknown, translatedVisibility)) {
        if (isOwnedByMe(resourceSource, currentProjectId)) {
          return defaultVisibilities.private;
        } else if (angular.isDefined(resourceSource.project_id)) {
          return defaultVisibilities.shared_with_me;
        } else {
          return defaultVisibilities.unknown;
        }
      } else if (isOwnedByMe(resourceSource, currentProjectId) &&
        sharedByMeIfOwnedByMe.indexOf(translatedVisibility)) {
        return defaultVisibilities.shared_by_me;
      }
      else {
        return translatedVisibility;
      }
    }

    function safeTranslateVisibility(visibility) {
      // Rather than show a default visibility when the visibility is not found
      // this will show the untranslated visibility. This allows the code
      // to be more forgiving if a new status is added.
      var translation = defaultVisibilities[visibility];
      if (angular.isDefined(translation)) {
        return translation;
      } else {
        return visibility;
      }
    }

    function translateIsPublic(isPublic) {
      if (isPublic) {
        return defaultVisibilities.public;
      } else {
        return defaultVisibilities.private;
      }
    }

    function translateShared(shared) {
      if (shared) {
        return defaultVisibilities.shared;
      } else {
        return defaultVisibilities.private;
      }
    }

    function isOwnedByMe(resourceSource, currentProjectId) {
      return angular.equals(resourceSource.project_id, currentProjectId);
    }
  }

}());
