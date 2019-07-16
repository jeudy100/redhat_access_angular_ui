'use strict';
import _        from 'lodash';

export default class ProductSelect {
    constructor($scope, $location, securityService, SearchCaseService, CaseService, ProductsService, strataService, AlertService, RHAUtils, RecommendationsService) {
        'ngInject';

        $scope.securityService = securityService;
        $scope.SearchCaseService = SearchCaseService;
        $scope.CaseService = CaseService;
        $scope.ProductsService = ProductsService;
        $scope.RecommendationsService = RecommendationsService;
        $scope.products = [];
        $scope.product = CaseService.kase.product;
        $scope.recentProductLimit = 3;
        $scope.isCreatingNewCase = $location.path().includes('/case/new');

        $scope.$watch(function () {
            return ProductsService.products;
        }, function () {
            if (RHAUtils.isNotEmpty(ProductsService.products)) {
                $scope.products = ProductsService.products;

                if (RHAUtils.isNotEmpty(CaseService.kase.product)) {
                    let selectedProduct = {
                        code: CaseService.kase.product,
                        name: CaseService.kase.product
                    };
                    let prodInArray = false;
                    for (var i = 0; i < $scope.products.length; i++) {
                        if ($scope.products[i].code === selectedProduct.code && $scope.products[i].name === selectedProduct.name) {
                            prodInArray = true;
                        }
                    }
                    if (!prodInArray) {
                        $scope.products.push(selectedProduct);
                    }
                }
            }
        });

        $scope.selectRecentProduct = (product) => {
            $scope.product = product.name;
            ProductsService.versions = [];
            $scope.onProductSelect();
        };

        $scope.$watch('CaseService.kase.product', () => $scope.product = CaseService.kase.product);

        $scope.onProductSelect = function ($event) {
            CaseService.kase.product = $scope.product;
            // Check Products and update entitlements
            const selectedProduct = _.find(ProductsService.products,{ 'name': CaseService.kase.product});
            CaseService.updateAndValidateEntitlements(selectedProduct);
            if(CaseService.kase.product !== CaseService.prestineKase.product) {
                CaseService.kase.version="";
            }
            CaseService.validateNewCase();
            ProductsService.getVersions(CaseService.kase.product);
            CaseService.updateLocalStorageForNewCase();
            CaseService.sendCreationStartedEvent($event);
        };
    }
}
