'use strict';

export default class VersionSelect {
    constructor($scope, securityService, SearchCaseService, CaseService, ProductsService, RecommendationsService, RHAUtils, CASE_EVENTS) {
        'ngInject';

        $scope.securityService = securityService;
        $scope.SearchCaseService = SearchCaseService;
        $scope.CaseService = CaseService;
        $scope.ProductsService = ProductsService;
        $scope.RecommendationsService = RecommendationsService;
        $scope.versions = [];
        $scope.version = CaseService.kase.version;

        if (RHAUtils.isNotEmpty(CaseService.kase.product)) {
            ProductsService.getVersions(CaseService.kase.product);
        }
        $scope.$on(CASE_EVENTS.productSelectChange, function () {
            if (RHAUtils.isNotEmpty(CaseService.kase.product)) {
                ProductsService.getVersions(CaseService.kase.product);
            }
        });
        $scope.$watch(function () {
            return ProductsService.versions;
        }, function () {
            if (RHAUtils.isNotEmpty(ProductsService.versions)) {
                $scope.versions = ProductsService.versions;

                if (RHAUtils.isNotEmpty(CaseService.kase.version)) {
                    if ($scope.versions.indexOf(CaseService.kase.version) === -1) {
                        $scope.versions.push(CaseService.kase.version);
                    }
                }
            } else {
                $scope.versions = [];
            }
        });

        $scope.$watch('CaseService.kase.version', () => $scope.version = CaseService.kase.version);

        $scope.onVersionSelect = function ($event) {
            CaseService.kase.version = $scope.version;
            CaseService.validateNewCase();
            CaseService.updateLocalStorageForNewCase();
            CaseService.sendCreationStartedEvent($event);
        };
    }
}
