'use strict';
import _        from 'lodash';
import {versionSort} from '../../shared/utils';
import hydrajs from '../../shared/hydrajs';
const productSortListFile = require('../../../productSortList.txt');

export default class ProductsService {
    constructor(securityService, strataService, CaseService, AttachmentsService, RHAUtils, NEW_CASE_CONFIG, NEW_DEFAULTS, AlertService, gettextCatalog) {
        'ngInject';

        this.products = [];
        this.productsRecentlyFiledAgainst = [];
        this.productsDisabled = false;
        this.productsLoading = false;
        this.versions = [];
        this.versionDisabled = false;
        this.versionLoading = false;
        this.clear = function () {
            this.products = [];
            this.productsRecentlyFiledAgainst = [];
            this.versions = [];
        };
        const userHasManagedAccounts = () => (
            RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.managedAccounts) &&
            RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.managedAccounts.accounts)
        );

        this.getProductsRecentlyFiledAgainstString = () => gettextCatalog.getString('Recently selected products: {{products}}', {
            products: this.productsRecentlyFiledAgainst.map((product) => product.name).join(', ')
        });

        this.getProducts = function (fetchForContact) {
            this.clear();
            var contact = securityService.loginStatus.authedUser.sso_username;
            if (fetchForContact === true) {
                if (securityService.loginStatus.authedUser.is_internal || (securityService.loginStatus.authedUser.org_admin && userHasManagedAccounts())) {
                    if (RHAUtils.isNotEmpty(CaseService.owner)) {
                        contact = CaseService.owner;  // When internal user creates case for another account, or external partner creates a case for managed account
                    }
                }
            } else {
                if (securityService.loginStatus.authedUser.is_internal || (securityService.loginStatus.authedUser.org_admin && userHasManagedAccounts())) {
                    if (RHAUtils.isNotEmpty(CaseService.kase.contact_sso_username)) {
                        contact = CaseService.kase.contact_sso_username; // When internal user views case of another account, or external partner creates a case for managed account
                    }
                }
            }

            if((RHAUtils.isNotEmpty(CaseService.virtualOwner) && RHAUtils.isNotEmpty(CaseService.account.number) && CaseService.isManagedAccount(CaseService.account.number)) ||
            (RHAUtils.isNotEmpty(CaseService.virtualOwner) && CaseService.kase.contact_is_partner)) {
                contact = CaseService.virtualOwner; // Used for fetching products list(of customers) for cases managed by Partners
            }
            this.productsLoading = true;
            return hydrajs.products.getProducts(contact).then(angular.bind(this, function (response) {
                this.products = response.map((product) => {
                    product.code = product.name;
                    return product;
                });

                this.productsRecentlyFiledAgainst = this.products.filter((product) => product.recentlyFiledAgainst);
                this.buildProductOptions();
                this.productsLoading = false;
                if (RHAUtils.isNotEmpty(NEW_DEFAULTS.product)) {
                    for (var i = 0; i < this.products.length; i++) {
                        if (this.products[i].label === NEW_DEFAULTS.product) {
                            CaseService.kase.product = this.products[i].value;
                            break;
                        }
                    }
                }

                if (RHAUtils.isNotEmpty(CaseService.kase.product)) {
                    //once we retrieve the product list, we should also retrieve versions
                    this.getVersions(CaseService.kase.product);
                }
            }), function (error) {
                this.productsLoading = false;
                AlertService.addStrataErrorMessage(error);
            }.bind(this));
        };

        this.buildProductOptions = function () {
            let productOptions = [];
            let productSortList = [];
            if (NEW_CASE_CONFIG.isPCM) {
                productSortList = productSortListFile.split(',');
                for (let i = 0; i < productSortList.length; i++) {
                    for (let j = 0; j < this.products.length; j++) {
                        if (productSortList[i] === this.products[j].code && this.products[j].supported_for_customer) {
                            const sortProduct = productSortList[i];
                            const productInResponse = _.find(this.products, (p) => p.name === sortProduct);
                            productOptions.push({
                                code: sortProduct,
                                name: sortProduct,
                                supported: true,
                                preferredServiceLevel : RHAUtils.isNotEmpty(productInResponse) && RHAUtils.isNotEmpty(productInResponse.preferred_service_level) ? productInResponse.preferred_service_level :RHAUtils.isNotEmpty(CaseService.originalEntitlements) && CaseService.originalEntitlements[0],
                                serviceLevels : RHAUtils.isNotEmpty(productInResponse) && RHAUtils.isNotEmpty(productInResponse.service_levels) ? _.split(productInResponse.service_levels , ';'): CaseService.originalEntitlements
                            });
                            break;
                        }
                    }
                }

                let supportedProduct = _.filter(this.products, (p) => p.supported_for_customer);
                let unsupportedProduct = _.filter(this.products, (p) => !p.supported_for_customer);

                // Service level change
                this.products = _.forEach(this.products, (p) => {
                    p.preferredServiceLevel = RHAUtils.isNotEmpty(p.preferred_service_level) ? p.preferred_service_level : RHAUtils.isNotEmpty(CaseService.originalEntitlements) && CaseService.originalEntitlements[0];
                    p.serviceLevels = RHAUtils.isNotEmpty(p.service_levels) ? _.split(p.service_levels , ';'): CaseService.originalEntitlements;
                });

                if (supportedProduct.length > 0) {
                    supportedProduct = _.sortBy(supportedProduct, (p) => p.code);
                    angular.forEach(supportedProduct, (product) => productOptions.push({code: product.code, name: product.name, supported: product.supported_for_customer, preferredServiceLevel: product.preferredServiceLevel, serviceLevels: product.serviceLevels}));
                }

                if (unsupportedProduct.length > 0) {
                    const sep = '────────────────────────────────────────';
                    productOptions.push({ isDisabled: true, name: sep, code: '' });
                    unsupportedProduct = _.sortBy(unsupportedProduct, (p) => p.code);
                    // Do not add preferred service level for unsupported product, CCM would do it automatically
                    // or user can select it if needed
                    angular.forEach(unsupportedProduct, (product) => productOptions.push({code: product.code, name: product.name, supported: product.supported_for_customer, serviceLevels: product.serviceLevels}));
                }

                this.products = _.uniqBy(productOptions, (p) => p.name);
            } else {
                angular.forEach(this.products, (product) => productOptions.push({code: product.code, name: product.name, supported: product.supported_for_customer, preferredServiceLevel: product.preferredServiceLevel, serviceLevels: product.serviceLevels}) );
                this.products = productOptions;
            }
        };
        this.fetchProductDetail = function (productCode) {
            AttachmentsService.suggestedArtifact = {};
            strataService.products.get(productCode).then(angular.bind(this, function (product) {
                if (product !== undefined && product.suggested_artifacts !== undefined && product.suggested_artifacts.suggested_artifact !== undefined) {
                    if (product.suggested_artifacts.suggested_artifact.length > 0) {
                        var description = product.suggested_artifacts.suggested_artifact[0].description;
                        if (description.indexOf('<a') > -1) {
                            description = description.replace("<a", "<a target='_blank'");
                        }
                        AttachmentsService.suggestedArtifact.description = description;
                    }
                }
            }), function (error) {
                AlertService.addStrataErrorMessage(error);
            });
        };
        this.getVersions = function (product, isFilter) {
            this.versionDisabled = true;
            this.versionLoading = true;

            // Retrieve the product detail, basically finding the attachment artifact
            // not necessary when fetching versions for filtering
            if (!isFilter) {
                this.fetchProductDetail(product);
            }

            return hydrajs.products.getProductVersions(product).then(angular.bind(this, function (response) {
                const versions = response.items;
                this.versions = versionSort(versions);
                this.versionDisabled = false;
                this.versionLoading = false;

                // if(RHAUtils.isNotEmpty(CaseService.kase.version) && (this.versions.indexOf(CaseService.kase.version) === -1))
                // {
                //     //this will get executed when existing product version is not available in version list of the given product
                //     //in this case drop down value is shown as 'Select an Option' and at that point submit button should be disabled
                //     CaseService.newCaseIncomplete = true;
                // }
                //Fetch Recommendations
                return this.versions;
            }), function (error) {
                AlertService.addStrataErrorMessage(error);
                this.versionLoading = false;
            }.bind(this));
        };
        this.showVersionSunset = function () {
            if (RHAUtils.isNotEmpty(CaseService.kase.product) && RHAUtils.isNotEmpty(CaseService.kase.version)) {
                if ((CaseService.kase.version).toLowerCase().indexOf('- eol') > -1) {
                    return true;
                }
            }
            return false;
        };
    }
}
