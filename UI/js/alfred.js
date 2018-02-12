/* 

alfred.js

*/

"use strict";

// Start Welcome modal at page load
$(window).on('load',function(){
	updateStatus();	
	getEndpointsStatus();
	$('#welcomeModal').modal('show');
});


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
var endpointAPI = "http://" + alfredEndpoint + ":5000/api/v1/endpoints"
var alfredLogsAPI = "http://" + alfredEndpoint + ":5000/api/v1/alfred-logs"
var kafkaLogsAPI = "http://" + alfredEndpoint + ":5000/api/v1/kafka-logs"
var aciAnnotationsLogsAPI = "http://" + alfredEndpoint + ":5000/api/v1/aci-annotations-logs"

// Buttons variables
var refreshStatusButton = $("#refresh-status-button");
var submitConfirm = $("#submitConfirm");

// Modal Variables
var submitModal = $("#submitModal");

// Services and endpoints

var alfredStatus = "Unknown";
var tetrationStatus = "Unknown";
var apicStatus = "Unknown";
var tetrationURL = "Unknown";
var apicURL = "Unknown";

var alfredStatusLabel = $("#alfred-status-label");
var tetrationStatusLabel = $("#tetration-status-label");
var apicStatusLabel = $("#apic-status-label");

var alfredStartButton = $("#alfredStart");
var alfredStopButton = $("#alfredStop");
var alfredRestartButton = $("#alfredRestart");

var alfredLogsOutput = $("#alfred-logs-pre");
var kafkaLogsOutput = $("#kafka-logs-pre");
var aciLogsOutput = $("#aci-annotations-logs-pre");


// Get Alfred Status function

function updateStatus(){
	$.getJSON(serviceAPI)
	.done(function(result){
		alfredStatus = result.alfred_status
		if (alfredStatus == "alive") {
			alfredStatusLabel.html("<span uk-icon='icon: check; ratio: 0.5'>Alive</span>")
			alfredStatusLabel.removeClass("label-danger")
			alfredStatusLabel.addClass("label-success")
			alfredStartButton.addClass("disabled")
			alfredRestartButton.removeClass("disabled")
			alfredStopButton.removeClass("disabled")
			$("#monitor-tab").removeClass("hide")
			// Operate tab is hidden by default. It will only appear if the user submits the configuration
			// or if the service is up (which can be only if configuration has been submitted in the past)
			// This fixes the issue where operate tab is hidden if user reloads the page
			updateConnectButtons();
			$("#operate-tab").removeClass("hide")
		} else {
			alfredStatusLabel.html("<span uk-icon='icon: ban; ratio: 0.5'>Down</span>")
			alfredStatusLabel.removeClass("label-success")
			alfredStatusLabel.addClass("label-danger")
			alfredStopButton.addClass("disabled")
			alfredRestartButton.addClass("disabled")
			alfredStartButton.removeClass("disabled")
			$("#monitor-tab").addClass("hide")

		}
		$("#al-api-unreach").addClass("hide");
		$("#alfred-content").removeClass("hide");
	})	.fail(function(r){
		$("#al-api-unreach").removeClass("hide");
		$("#alfred-content").addClass("hide");
	});

}

// Get endpoints status

function getEndpointsStatus(){
	$.getJSON(endpointAPI, function(result){
		tetrationStatus = result.tetration_status
		apicStatus = result.tetration_status
		if (tetrationStatus == "reachable") {
			tetrationStatusLabel.html("<span uk-icon='icon: check; ratio: 0.5'>Reachable</span>")
			tetrationStatusLabel.removeClass("label-danger")
			tetrationStatusLabel.addClass("label-success")
		} else if (tetrationStatus == "down") {
			tetrationStatusLabel.html("<span uk-icon='icon: ban; ratio: 0.5'>Unreachable</span>")
			tetrationStatusLabel.removeClass("label-success")
			tetrationStatusLabel.addClass("label-danger")
		}
		if (apicStatus == "reachable") {
			apicStatusLabel.html("<span uk-icon='icon: check; ratio: 0.5'>Reachable</span>")
			apicStatusLabel.removeClass("label-danger")
			apicStatusLabel.addClass("label-success")			
		} else if (apicStatus == "down") {
			apicStatusLabel.html("<span uk-icon='icon: ban; ratio: 0.5'>Unreachable</span>")
			apicStatusLabel.removeClass("label-success")
			apicStatusLabel.addClass("label-danger")
		}	
	})
};


// Set APIC and Tetration connect buttons 

function updateConnectButtons(){
	var tetrationConnectButton = $("#tetration-connect-btn");
	var apicConnectButton = $("#apic-connect-btn");

	$.getJSON(tetrationAPI, function(result){
		tetrationURL = result.API_ENDPOINT
		tetrationConnectButton.html("<a target='_blank' class='btn btn-sm btn-default' href='" + tetrationURL + "' id='tetration-connect-btn'>Connect</a>");
	});

	$.getJSON(apicAPI, function(result){
		apicURL = result.apic_ip
		apicConnectButton.html("<a target='_blank' class='btn btn-sm btn-default' href='" + apicURL + "' id='apic-connect-btn'>Connect</a>");

	})
}


// Update Alfred, Kakfa and ACI Annotations logs
function updateLogs(){
    var alogs = $.get(alfredLogsAPI)
    var klogs = $.get(kafkaLogsAPI)
    var acilogs = $.get(aciAnnotationsLogsAPI)
    .done(function(){
    alfredLogsOutput.html(alogs.responseText);
    kafkaLogsOutput.html(klogs.responseText);
    aciLogsOutput.html(acilogs.responseText);      
    })
};


// Start Alfred function

function startAlfred(){
	$.post(serviceAPI, '{"alter_service": "start"}')
	.done(function(data){
		alfredStartButton.addClass("disabled");
		alfredStopButton.removeClass("disabled");
		updateStatus();
	});

}

// Fetch services status every minute (30s)

setInterval(function() {
	updateStatus();	
	getEndpointsStatus();
}, 10000);

setInterval(function() {
    updateLogs();
}, 30000);

// Refresh button action

refreshStatusButton.on("click", function(){
	updateStatus();
	getEndpointsStatus();

});


// Start button actions

alfredStartButton.on("click", function(){
	startAlfred();
});


// Stop button actions

alfredStopButton.on("click", function(){
	$.post(serviceAPI, '{"alter_service": "stop"}')
	.done(function(data){
		alfredStopButton.addClass("disabled")
		alfredStartButton.removeClass("disabled")
		alfredStopButton.disabled = true
		updateStatus()
	});

});



// Restart button actions

alfredRestartButton.on("click", function(){
	$.post(serviceAPI, '{"alter_service": "restart"}')
	.done(function(data){
		updateStatus()
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
	// Tetration config
	var tetrationAPIPayload = '{"API_ENDPOINT": "' + $("#tetration-url").val() + '","VRF":"' +  $("#tetration-vrf").val()   + '","app_scope":"' + $("#tetration-app-scope").val() + '","api_key":"' + $("#tetration-api-key").val() + '","api_secret":"' + $("#tetration-api-secret").val() + '"}'
	
	$.post(tetrationAPI, tetrationAPIPayload)
	.done(function(data){		
	});

		var brokerAPIPayload = '{"broker_ip": "' + $("#kafka-ip").val() + '","broker_port":"' +  $("#kafka-port").val()   + '","topic":"' + $("#kafka-topic").val()  + '"}'

		$.post(brokerAPI, brokerAPIPayload)
		.done(function(data){		
		});

		var apicAPIPayload = '{"apic_ip": "' + $("#apic-endpoint").val() + '","apic_port":"' +  $("#apic-port").val()   + '","apic_user":"' + $("#apic-user").val()  + '","apic_password":"' + $("#apic-password").val() + '"}'

		$.post(apicAPI, apicAPIPayload)
		.done(function(data){		
		});
}

// Confirm submit modal

submitConfirm.on("click", function(){
	submitConfirm.button("loading");
	submitConfigForm();
	startAlfred();
	updateConnectButtons();
	submitModal.modal("hide");
	$("#operate-tab").removeClass("hide");
});


