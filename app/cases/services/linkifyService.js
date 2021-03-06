'use strict';

export default class LinkifyService {
    constructor($filter, RHAUtils) {
        this.linkifyWithCaseIDs = function (text) {
            if (RHAUtils.isEmpty(text)) return '';

            var caseIdRegex = /([\s\('";]|^)(\d{8})([\s\)'"\&]|$)/g;
            let caseLinksinkifiedText = text.replace(caseIdRegex, '$1<a href="#/case/$2">$2</a>$3');
            return caseLinksinkifiedText;
        }

        this.linkifyBZIDs = function (text) {
            if (RHAUtils.isEmpty(text)) return '';
            var bzIdRegex = /(Bug|BZ)([ \t])?(&#\S{1,4};)?([\[\('\"#-])?(\d{7,})([\]\)'\"])?(&#\S{1,4};)?/ig;
            var bzLinkifiedText = text.replace(bzIdRegex, '<a href="https://bugzilla.redhat.com/show_bug.cgi?id=$5">$1$2$3$4$5$6$7</a>');
            return bzLinkifiedText;
        }
    }
}
