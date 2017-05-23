function validateForm() {
	var radioButtons = document.getElementsByName("poll-option");
	var noOfButtons = radioButtons.length;
	for (var i=0;i<noOfButtons;i++) {
		if (radioButtons[i].checked && radioButtons[i].value !== "") {
			var pollButton = document.getElementById("poll-button");
			pollButton.disabled = true;
			pollButton.innerText = "Polling...";
			return true;
		}
	}
	alert("Please select a valid option!");
	return false;
}
function editNewPollOption() {
	document.getElementById("new-poll-option").value = "new " + document.getElementById("new-poll-option-text").value;
}

function deletePoll(pollDetails) {
	var pollId = pollDetails._id;
	var formData = new FormData();
	formData.append("poll-id",pollId);
	var request = new XMLHttpRequest();
	request.open("POST","/delete/" + pollId);
	request.send(formData);
	location.href = "/";
}

function initialisePollChart() {
	var chartDiv = document.getElementById("poll-chart-div");
	var pollTitles = [];
	var pollVoteCounts = [];
	var totalVoteCounts = 0;
	pollDetails.options.forEach(function(optionObject) {
		pollTitles.push(optionObject.optionTitle);
		pollVoteCounts.push(optionObject.optionVoteCount);
		totalVoteCounts += optionObject.optionVoteCount;
	});
	if (totalVoteCounts === 0) {
		var noResultsCaption = document.createElement("p");
		noResultsCaption.innerText = "No one has voted on this poll yet!";
		chartDiv.appendChild(noResultsCaption);
		return;
	}
	var canvas = document.createElement("canvas");
	canvas.id = "poll-chart";
	chartDiv.appendChild(canvas);
	var pollData = {
		labels: pollTitles,
		datasets: [
		{
			data: pollVoteCounts,
			backgroundColor : [
				"#FF0000",
				"#0000FF",
				"#00FF00",
				"#FFC0CB",
				"#800080",
				"#FFA500",
				"#FFFF00",
				"#00FFFF",
				"#A52A2A",
				"#C0C0C0"
			]
		}]
	};
	var pollChart = new Chart(canvas, {
		type: "doughnut",
		data: pollData
	});
}

initialisePollChart();