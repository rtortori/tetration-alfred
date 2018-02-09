/* 

alfred.js

*/

// Set content type to JSON for POST calls
$.ajaxSetup({
  contentType: "application/json; charset=utf-8"
});

// Set variable to point to the right API server
// var alfredEndpoint = location.hostname;
// Temporary set alfredEndpoint to point to an external API server
var alfredEndpoint = "10.58.16.91"

// API Server endpoints
var serviceAPI = "http://" + alfredEndpoint + ":5000/api/v1/service"
var brokerAPI = "http://" + alfredEndpoint + ":5000/api/v1/broker"
var tetrationAPI = "http://" + alfredEndpoint + ":5000/api/v1/tetration"
var apicAPI = "http://" + alfredEndpoint + ":5000/api/v1/apic"

// Alfred Service

var alfredStatus = "Unknown"
var alfredStatusLabel = $("#alfred-status-label");

var alfredStartButton = $("#alfredStart");
var alfredStopButton = $("#alfredStop");
var alfredRestartButton = $("#alfredRestart");


function getAlfredStatus(){
$.getJSON(serviceAPI, function(result){
	alfredStatus = result.alfred_status
	if (alfredStatus == "alive") {
		alfredStatusLabel.html("<span uk-icon='icon: check; ratio: 0.5'>Alive</span>")
		alfredStatusLabel.removeClass("label-danger")
		alfredStatusLabel.addClass("label-success")
		alfredStartButton.addClass("disabled")
		alfredRestartButton.removeClass("disabled")
	} else {
		alfredStatusLabel.html("<span uk-icon='icon: ban; ratio: 0.5'>Down</span>")
		alfredStatusLabel.removeClass("label-success")
		alfredStatusLabel.addClass("label-danger")
		alfredStopButton.addClass("disabled")
		alfredRestartButton.addClass("disabled")
	}	
})
};


// Alfred service controls

getAlfredStatus();

// Start button actions

alfredStartButton.on("click", function(){
	
	$.post(serviceAPI, '{"alter_service": "start"}')
	.done(function(data){
		alfredStartButton.addClass("disabled")
		alfredStopButton.removeClass("disabled")
		getAlfredStatus()
		});

});


// Stop button actions

alfredStopButton.on("click", function(){
	
	$.post(serviceAPI, '{"alter_service": "stop"}')
	.done(function(data){
		alfredStopButton.addClass("disabled")
		alfredStartButton.removeClass("disabled")
		alfredStopButton.disabled = true
		getAlfredStatus()
		});

});

// Restart button actions

alfredRestartButton.on("click", function(){
	
	$.post(serviceAPI, '{"alter_service": "restart"}')
	.done(function(data){
		getAlfredStatus()
		});

});


$.getJSON(serviceAPI, function(result){
	alfredStatus = result.alfred_status
	if (alfredStatus == "alive") {
		alfredStatusLabel.html("<span uk-icon='icon: check; ratio: 0.5'>Alive</span>")
		alfredStatusLabel.addClass("label-success")
	} else {
		alfredStatusLabel.html("<span uk-icon='icon: ban; ratio: 0.5'>Down</span>")
		alfredStatusLabel.addClass("label-danger")
	}	
});



// Submit configuration form data

function submitConfigForm() {

	$("#tetration-url").val()

}
