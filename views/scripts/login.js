function removeErrorPrompt() {
	var errorMessage = document.getElementById("error-message-div");
	if (errorMessage) {
		document.getElementById("login-form").removeChild(document.getElementById("error-message-div"));
	}
}