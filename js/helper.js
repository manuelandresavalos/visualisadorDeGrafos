var elem = document.documentElement;
function openFullscreen() {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	}
	else if (elem.mozRequestFullScreen) {
		/* Firefox */
		elem.mozRequestFullScreen();
	}
	else if (elem.webkitRequestFullscreen) {
		/* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	}
	else if (elem.msRequestFullscreen) {
		/* IE/Edge */
		elem.msRequestFullscreen();
	}
}

/**
   * @param String name
   * @return String
   */
function getParameterByName(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
		results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Show an element
var show = function(elem) {
	elem.style.display = 'block';
};

// Hide an element
var hide = function(elem) {
	elem.style.display = 'none';
};
