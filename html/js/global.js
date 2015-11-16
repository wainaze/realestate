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

$('.addIssueButton').on('click', function(){
    window.location = 'addIssue.html';
});