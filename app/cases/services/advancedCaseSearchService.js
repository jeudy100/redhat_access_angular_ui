'use strict';

import map from 'lodash/map';
import filter from 'lodash/filter';
import find from 'lodash/find';
import * as FileSaver from 'filesaver.js'
import { solrCaseFields } from '../constants/solrCaseFields';

export default class AdvancedCaseSearchService {
    constructor(strataService, SearchBookmarkService, ConstantsService, RHAUtils, AlertService) {
        'ngInject';

        this.searching = false;
        this.cases = [];
        this.query = null;
        this.order = null;

        this.pageSize = 20;
        this.currentPage = 1;
        this.totalCases = 0;

        this.numberOfPages = function () {
            return Math.ceil(this.totalCases / this.pageSize);
        };

        this.columns = null;

        // For displaying where we are at in the pagination
        this.getCasesStart = () => {
            return (this.currentPage - 1) * this.pageSize + 1;
        };

        this.getCasesEnd = () => {
            const end = this.currentPage * this.pageSize;
            if (end > this.totalCases) {
                return this.totalCases;
            }
            return end;
        };

        this.performSearch = (query, order) => {
            var solrOrder = this.resolveOrder(order);
            if (query == null || this.searching) return;
            if (this.query !== query || this.order !== solrOrder) {
                this.cases = [];
                this.totalCases = 0;
                this.currentPage = 1;
            }
            this.searching = true;
            this.query = query;
            this.order = solrOrder;
            return strataService.cases.advancedSearch(query, solrOrder, (this.currentPage - 1) * this.pageSize, this.pageSize, null, solrCaseFields).then((response) => {
                this.searching = false;
                if (response['case'] === undefined) {
                    this.totalCases = 0;
                } else {
                    this.totalCases = response.total_count;

                    // If the next page of cases requested is greater than the current cases length then we need to
                    // add those to the cases as they are new.  Otherwise we are just using cache
                    if (this.getCasesStart() + this.pageSize > this.cases.length) {
                        Array.prototype.push.apply(this.cases, response['case']);
                    }
                }
            });
        };

        this.resolveOrder = (selectedOrder) => {
            if (selectedOrder == null) return 'case_lastModifiedDate DESC';
            return 'case_' + selectedOrder.sortField + ' ' + selectedOrder.sortOrder;

        }

        this.getColumns = () => {
            if (this.columns == null) {
                const allColumns = ConstantsService.advancedCaseListColumns;
                const currentBookmark = SearchBookmarkService.getCurrentBookmark();
                if (currentBookmark != null && RHAUtils.isNotEmpty(currentBookmark.columns)) {
                    this.columns = filter(map(currentBookmark.columns, (col) => find(allColumns, { id: col })), c => c != null);
                } else { // set default columns
                    this.columns = filter(allColumns, { default: true });
                }
            }

            return this.columns;
        }

        this.clearColumns = () => {
            this.columns = null;
        }

        this.initiateCSVDownload = () => {
            this.exporting = true;
            return strataService.cases.advancedSearch(this.query, this.order, 0, 1000, 'csv', solrCaseFields, null, null, null, null, null, 'lastModifiedDate').then((response, xhr) => {
                const csvBlob = new Blob([response], { type: 'text/csv' });
                FileSaver.saveAs(csvBlob, 'cases-export.csv');
                this.exporting = false;
            }, (error) => {
                this.exporting = false;
                AlertService.addStrataErrorMessage(error)
            });
        }
    }
}
