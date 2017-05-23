function validateSignUp() {
	var signUpForm = document.forms["signup-form"];
	if (signUpForm["password"].value !== signUpForm["confirm-password"].value) {
		alert("Passwords keyed in do not match! Please confirm your password accurately.");
		return false;
	}
	signUpForm["confirm-password"].removeAttribute("name");
	return true;
}
function removeErrorPrompt() {
	document.getElementById("username-field").className = "";
	var errorMessage = document.getElementById("error-message-div");
	document.getElementById("signup-form").removeChild(document.getElementById("error-message-div"));
}