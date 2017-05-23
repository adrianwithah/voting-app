function removeSelf() {
	this.parentNode.removeChild(this);
};
document.getElementById("addoption-button").onclick = function() {
	var newOption = document.createElement("div");
	newOption.className =  "option-container";
	var inputDiv = document.createElement("div");
	inputDiv.className = "input-field";
	var input = document.createElement("input");
	input.type = "text";
	input.className = "poll-input";
	input.setAttribute("name","poll-option");
	input.required = true;
	var label = document.createElement("label");
	label.innerHTML = "Option";
	inputDiv.appendChild(input);
	inputDiv.appendChild(label);
	var removeOptionButton = document.createElement("button");
	var icon = document.createElement("i");
	icon.className = "material-icons";
	icon.innerHTML = "delete";
	removeOptionButton.appendChild(icon);
	removeOptionButton.onclick = removeSelf.bind(newOption);
	removeOptionButton.className = "delete-option-button btn";
	newOption.appendChild(inputDiv);
	newOption.appendChild(removeOptionButton);		
	document.getElementById("newpoll-form").appendChild(newOption);
};
function disableFormButtons() {
	var createPollButton = document.getElementById("createpoll-button");
	createPollButton.innerText = "Creating Poll...";
	createPollButton.disabled = true;
	document.getElementById("addoption-button").disabled = true;
}