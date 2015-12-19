function login(e) {
	if (e.keyCode == '13')
		$('form').submit();
}

$(document).on('keyup', 'input', login);