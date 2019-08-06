'use strict';

export default class SeveritySelect {
    constructor($scope, CaseService, RHAUtils) {
        'ngInject';

        // INIT
        const defaultSeverityName = '4 (Low)';
        $scope.ie8 = window.ie8;
        $scope.openedDetails = {};
        $scope.CaseService = CaseService;
        $scope.openedDetails[defaultSeverityName] = true;

        $scope.toggleDetails = function (severity, event) {
            if (event.stopPropagation) { // we don't want to toggle severity
                event.stopPropagation();
            } else { // for IE8+
                event.returnValue = false;
                event.cancelBubble = true;
            }

            $scope.createdCase.severity = severity;
            $scope.openSeverityDetails(severity.name);
            CaseService.validateNewCase();
        };

        $scope.openSeverityDetails = function (severityName) {
            if (RHAUtils.isNotEmpty(severityName)) {
                angular.forEach($scope.severities, function (severity) {
                    $scope.openedDetails[severity.name] = (severity.name === severityName);
                });
            }
        };

        $scope.$watch("createdCase.severity", function () {
            $scope.severityChange();
        });

        $scope.$watch('createdCase.product + createdCase.version', function () {
            const validSeverity = CaseService.getValidSeverity($scope.createdCase.severity);
            const severity = $scope.severities.find((severity) => (severity.name === validSeverity || severity.name === (validSeverity && validSeverity.name)));
            $scope.severity = $scope.createdCase.severity = severity;
            CaseService.validateNewCase();

            if (!$scope.openedDetails[validSeverity]) {
                $scope.openedDetails[validSeverity] = true;
            }

            Object.keys($scope.openedDetails).forEach((key) => $scope.openedDetails[key] = key === validSeverity);
        });
    }
}
