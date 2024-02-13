
// Detect SharePoint Ribbon. Used for authoring sites
var $ribbon = $("#s4-ribbonrow");
if ($ribbon.length > 0) {
	$("html").addClass("has-ribbon");
}

/* Fix for Sharepoint Picture Library Slide Show issue on IE */
function picSlideShowSpaceFilter() {
    $("div[id^='MSOPictureLibrarySlideshowWebPart']").removeAttr("style");
    $("img[id$='_next']").css({ "height": "0px" })
    $("img[id$='_prev']").css({ "height": "0px" })
    $("img[id$='_pp']").css({ "height": "0px" })
}
_spBodyOnLoadFunctionNames.push("picSlideShowSpaceFilter");

/* Fix for Sharepoint default list to close the default expandable in page */
function lstCollapseGroupFilter() {
    $("img[src='/_layouts/images/minus.gif']:visible").parent().click();
}
_spBodyOnLoadFunctionNames.push("lstCollapseGroupFilter");

/* JS for Reusable content display*/
$(document).ready(function () {
    //var targetInfo = $('#ReusableContent01').attr('id');
    $('#AnchorReusable01').attr('data-toggle', 'collapse');
    $('#AnchorReusable01').attr('data-target', '#ReusableContent01');

    //var targetInfo2 = $('#ReusableContent02').attr('id');
    $('#AnchorReusable02').attr('data-toggle', 'collapse');
    $('#AnchorReusable02').attr('data-target', '#ReusableContent02');

    //var targetInfo3 = $('#ReusableContent02').attr('id');
    $('#AnchorReusable03').attr('data-toggle', 'collapse');
    $('#AnchorReusable03').attr('data-target', '#ReusableContent02');

    //var targetInfo4 = $('#ReusableContent04').attr('id');
    $('#AnchorReusable04').attr('data-toggle', 'collapse');
    $('#AnchorReusable04').attr('data-target', '#ReusableContent04');
});

