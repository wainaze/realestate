function setLocale(locale) {
	$.get('/setLang?lang=' + locale, function(){
		window.location.reload();
	})
}