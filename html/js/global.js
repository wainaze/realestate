function setLocale(locale) {
	$.get('/setLang?lang=' + locale, function(){
		window.location.reload();
	})
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function addIssue() {
	location.href = 'addIssue.html';
}

function addContract() {
	var newLocation = 'addContract.html';
	var propertyId = getParameterByName('id');
	if (propertyId != '')
		newLocation += '?propertyId=' + propertyId;
	location.href = newLocation;
}

function toggleCollapsibleContents(event) {
	var glyph = $(event.target);
	var collapsible = $(event.target).parents('.collapsible').first();
	collapsible.find('.contents').toggle();
	glyph.toggleClass('open');
}

$(document).on('click',' .addIssueButton', addIssue);
$(document).on('click', '#addContract', addContract);
$(document).on('click', '.glyphicon-collapsible', toggleCollapsibleContents)