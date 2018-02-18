/* 

alfred.js

*/

"use strict";

// Start Welcome modal at page load
$(window).on('load',function(){
	updateStatus();	
	getEndpointsStatus();
    updateOptServicesStatus();
    updateLogs();
	$('#welcomeModal').modal('show');
});


// Set content type to JSON for POST calls
$.ajaxSetup({
	contentType: "application/json; charset=utf-8"
});

// Set variable to point to the right API server
// var alfredEndpoint = location.hostname;
// Temporary set alfredEndpoint to point to an external API server
var alfredEndpoint = "192.168.245.136";

// API Server endpoints
var serviceAPI = "http://" + alfredEndpoint + ":5000/api/v1/service"
var brokerAPI = "http://" + alfredEndpoint + ":5000/api/v1/broker"
var tetrationAPI = "http://" + alfredEndpoint + ":5000/api/v1/tetration"
var apicAPI = "http://" + alfredEndpoint + ":5000/api/v1/apic"
var endpointAPI = "http://" + alfredEndpoint + ":5000/api/v1/endpoints"
var alfredLogsAPI = "http://" + alfredEndpoint + ":5000/api/v1/alfred-logs"
var kafkaLogsAPI = "http://" + alfredEndpoint + ":5000/api/v1/kafka-logs"
var aciAnnotationsLogsAPI = "http://" + alfredEndpoint + ":5000/api/v1/aci-annotations-logs"
var mailerAPI = "http://" + alfredEndpoint + ":5000/api/v1/mailer"
var mailTestAPI = "http://" + alfredEndpoint + ":5000/api/v1/mailtest"

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

// Log vars
var alfredLogsOutput = $("#alfred-logs-pre");
var kafkaLogsOutput = $("#kafka-logs-pre");
var aciLogsOutput = $("#aci-annotations-logs-pre");
var tableKafkaLogs =  $("#table-kafka-logs");

// Checkbox
//var apicEnabled = $("#apic-enabled");


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
			//$("#operate-tab").removeClass("hide")
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
    tableKafkaLogs.empty();
	var alogs = $.get(alfredLogsAPI)
	var klogs = $.get(kafkaLogsAPI)
	var acilogs = $.get(aciAnnotationsLogsAPI)
	.done(function(){
	alfredLogsOutput.html(alogs.responseText);
    //kafkaLogsOutput.html(klogs.responseText);
    aciLogsOutput.html(acilogs.responseText);

    // Test: Store logs into table entries
    var klogstext = klogs.responseText;
    var lines = klogstext.split('\n');
    for(var i = 0;i < lines.length;i++){
    	var tabEntry = $("<tr><td>" + lines[i] + "</td></tr>");

    	tabEntry.hover(function() {
    	 	$(this).css("background-color", "#f2f2f2");
    	 }, function() {
    	 	$(this).css("background-color", "transparent");
    	 });

    	tableKafkaLogs.append(tabEntry)
    }  
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

// Test Email

function testEmail(){
    $.post(mailTestAPI, '{"email_sub": "Alfred Test Email", "email_body": "Welcome!"}')
    .done(function(data){
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
	var tetrationAPIPayload = '{"API_ENDPOINT": "' + $("#tetration-url").val() + '","VRF":"' +  $("#tetration-vrf").val()   + '","app_scope":"' + $("#tetration-app-scope").val() + '","api_key":"' + $("#tetration-api-key").val() + '","api_secret":"' + $("#tetration-api-secret").val() + '"}'
	
	$.post(tetrationAPI, tetrationAPIPayload)
	.done(function(data){		
	});

	var brokerAPIPayload = '{"broker_ip": "' + $("#kafka-ip").val() + '","broker_port":"' +  $("#kafka-port").val()   + '","topic":"' + $("#kafka-topic").val()  + '"}'

	$.post(brokerAPI, brokerAPIPayload)
	.done(function(data){		
	});

    if ($("#enable-apic-toggle").prop('checked')) {
    	var apicAPIPayload = '{"apic_ip": "' + $("#apic-endpoint").val() + '","aci_annotations_enabled": ' + true + ',"apic_port":"' +  $("#apic-port").val()   + '","apic_user":"' + $("#apic-user").val()  + '","apic_password":"' + $("#apic-password").val() + '"}'

    	$.post(apicAPI, apicAPIPayload)
    	.done(function(data){		
    	});
    }

    // Preliminary checks to build the Mailer payload
    var mailServerProto;
    if ($("#mail-server-proto").val() == "SMTP") {
        mailServerProto = "smtp";
    }
    else {
        mailServerProto = "smtptls";
    }

    var mailServerAuth;
    if ($("#mail-server-auth").val() == "No"){
        mailServerAuth = "no";
    }
    else {
        mailServerAuth = "yes";
    }

    // If mail toggle is on submit the payload and enable the test mail button
    if ($("#enable-mail-toggle").prop('checked')) {
        var mailerAPIPayload = '{"mail_server_address": "' + $("#mail-server-address").val() + '","mail_server_enabled": ' + true + ',"mail_server_proto":"' + mailServerProto + '","mail_server_auth":"' + mailServerAuth + '","mail_server_user":"' + $("#mail-server-user").val() + '","mail_server_password":"' + $("#mail-server-password").val() + '","mail_server_sender":"' + $("#mail-server-sender").val()  + '","mail_server_recipient":"' + $("#mail-server-recipient").val() + '"}'

        $.post(mailerAPI, mailerAPIPayload)
        .done(function(data){       
        });

    }


}


// Function to check optional services availability (APIC Annotations, Mailer)

function updateOptServicesStatus(){
    $.getJSON(mailerAPI)
    .done(function(result){
        var mailerEnabledStatus = result.mail_server_enabled
        if (mailerEnabledStatus == true) {
            // update status on ui
            $("#enable-mail-toggle").bootstrapToggle('on')
            $("#label-mail-availability").removeClass('label-danger')
            $("#label-mail-availability").addClass('label-success')
            $("#label-mail-availability").html('<span uk-icon="icon: check; ratio: 0.5">Available </span>')
            // enable configuration part

        } else {
            // update status on UI
            $("#enable-mail-toggle").bootstrapToggle('off')
            $("#label-mail-availability").removeClass('label-success')
            $("#label-mail-availability").addClass('label-danger')
            $("#label-mail-availability").html('<span uk-icon="icon: ban; ratio: 0.5">Unavailable</span>')
            //disable configuration part

        }
        // do things
    })  .fail(function(r){
        // do failure things
    });

    $.getJSON(apicAPI)
    .done(function(result){
        var apicEnabledStatus = result.aci_annotations_enabled
        if (apicEnabledStatus == true) {
            // update status on ui
            $("#enable-apic-toggle").bootstrapToggle('on')
            $("#label-aci-availability").removeClass('label-danger')
            $("#label-aci-availability").addClass('label-success')
            $("#label-aci-availability").html('<span uk-icon="icon: check; ratio: 0.5">Available </span>')
            // enable config part

        } else {
            // update status on UI
            $("#enable-apic-toggle").bootstrapToggle('off')
            $("#label-aci-availability").removeClass('label-success')
            $("#label-aci-availability").addClass('label-danger')
            $("#label-aci-availability").html('<span uk-icon="icon: ban; ratio: 0.5">Unavailable</span>')
            //disable config part

        }
        // do other things
    })  .fail(function(r){
        // do failure things
    });
}

// Confirm submit modal

submitConfirm.on("click", function(){
	submitConfirm.button("Configuring");
	submitConfigForm();
	//startAlfred();
    $.post(serviceAPI, '{"alter_service": "restart"}')
    .done(function(data){
        updateStatus()
    });
	updateConnectButtons();
	submitModal.modal("hide");
	//$("#operate-tab").removeClass("hide");
});

// Service toggle switch actions

$(function() {
    $('#enable-apic-toggle').change(function() {
      // Disable ACI annotation via API
        if ($(this).prop('checked')) {
            $.getJSON(apicAPI, function(result){
                if (result.aci_annotations_enabled == false) {
                    result.aci_annotations_enabled = true;
                    var apicFullConfig = JSON.stringify(result);
                    // Reinject modified JSON
                    $.post(apicAPI, apicFullConfig)
                        .done(function(){
                        console.log('APIC Enabled')
                        updateOptServicesStatus();
                        });
                    }
                })
                $(".apic-configuration").removeClass("hide");
        }
        else {
            $.getJSON(apicAPI, function(result){
                if (result.aci_annotations_enabled == true) {
                    result.aci_annotations_enabled = false;
                    var apicFullConfig = JSON.stringify(result);
                    // Reinject modified JSON
                    $.post(apicAPI, apicFullConfig)
                        .done(function(){
                        console.log('APIC Disabled')
                        updateOptServicesStatus();
                        });
                    }
                })
                $(".apic-configuration").addClass("hide");
        }
      
    })

    $('#enable-mail-toggle').change(function() {
      // Disable Mailer config via API
        if ($(this).prop('checked')) {
            $.getJSON(mailerAPI, function(result){
                console.log("previous mailer config" + JSON.stringify(result))
                if (result.mail_server_enabled == false) {
                    result.mail_server_enabled = true;
                    var mailerFullConfig = JSON.stringify(result);
                    console.log("after mailer config" + mailerFullConfig)
                    // Reinject modified JSON
                    $.post(mailerAPI, mailerFullConfig)
                        .done(function(){
                        console.log('Mailer Enabled')
                        updateOptServicesStatus();
                        });
                    }
                })
                $(".mail-configuration").removeClass("hide");
        }
        else {
            $.getJSON(mailerAPI, function(result){
                console.log("previous mailer config" + JSON.stringify(result))
                if (result.mail_server_enabled == true) {
                    result.mail_server_enabled = false;
                    var mailerFullConfig = JSON.stringify(result);
                    console.log(mailerFullConfig)
                    console.log("after mailer config" + mailerFullConfig)
                    // Reinject modified JSON
                    $.post(mailerAPI, mailerFullConfig)
                        .done(function(){
                        console.log('Mailer Disabled')
                        updateOptServicesStatus();
                        });
                    }
                })
                $(".mail-configuration").addClass("hide");
        }
      
    })

  })

// Config form toggle

function hideForms(){
    if ($("#mail-server-auth").val() == "No") {
        $(".mail-server-auth-class").addClass('hide');
    }
    else {
        $(".mail-server-auth-class").removeClass('hide');
    }
}
