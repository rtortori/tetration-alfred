# API Guide

Alfred leverage Flask in order to expose APIs, enabling the use to query and manipulate features.<br>
While the preferred way to interact with Alfred is via the UI, which enforces a correct order of operations, you can also use the API directly and integrate in a standard way with external orchestrators or configuration management tools like Ansible.<br>
The following table summarizes the API endpoints and the supported methods. <br>

All methods return a JSON document:


| API Endpoint       | GET        | POST   | 
|----------|----------------------|---------------|
| /api/v1/service | Get Alfred status | start/stop/restart Alfred process | 
| /api/v1/broker | Get Kafka configuration | Configure Kafka consumer        | 
| /api/v1/tetration | Get Tetration configuration | Configure Tetration credentials      | 
| /api/v1/apic | Get ACI configuration | Configure ACI annotations feature      | 
| /api/v1/mailer | Get Mail Alarm service configuration | Configure Mail alarm feature      | 
| /api/v1/endpoints | Get remote endpoint reachability info | N/A      | 
| /api/v1/mailtest | N/A | Send a test email to the configured recipient      | 

## API Usage

### <u>Service API</u>
#### Methods: GET, POST
#### Usage example (GET):
```
curl http://alfred-host:5000/api/v1/service
```
<b>Returns:</b><br>
Alfred process is not running

```
{
  "alfred_status": "dead"
}
```

Alfred process is up & running

```
{
  "alfred_status": "alive"
}
```

#### Usage example (POST):
```
curl -i -H "Content-Type: application/json" -X POST -d '{"alter_service":"start"}' http://alfred-host:5000/api/v1/service
```

#### Actions
<b>Start Alfred:</b><br>

```
{"alter_service":"start"}
```
<b>Stop Alfred:</b><br>

```
{"alter_service":"stop"}
```
<b>Restart Alfred:</b><br>

```
{"alter_service":"restart"}
```

<b>Returns:</b><br>
Alfred action

--
### <u>Kafka Broker API</u>
#### Methods: GET, POST
#### Usage example (GET):

```
curl http://alfred-host:5000/api/v1/broker
```
<b>Returns:</b><br>
Kafka broker configuration

```
{
  "broker_ip": "1.2.3.4", 
  "broker_port": "9092", 
  "topic": "kafka_topic_here"
}
```
#### Usage example (POST):
```
curl -i -H "Content-Type: application/json" -X POST -d '{"broker_ip": "1.2.3.4","broker_port":"9092","topic":"my-tetration-topic"}' http://alfred-host:5000/api/v1/broker
```
<b>Returns:</b><br>
Kafka broker configuration

```
{
  "broker_ip": "1.2.3.4", 
  "broker_port": "9092", 
  "topic": "my-tetration-topic"
}
```
--

### <u>Tetration config API</u>
#### Methods: GET, POST
#### Usage example (GET):

```
curl http://alfred-host:5000/api/v1/tetration
```
<b>Returns:</b><br>
Tetration credentials configuration<br>
<i>Note: API Key and API Secret won't be displayed</i>

```
{
  "API_ENDPOINT": "tetration/endpoint/here", 
  "VRF": "tetration_target_vrf_here", 
  "app_scope": "tetration_target_application_scope_here"
}
```
#### Usage example (POST):
```
curl -i -H "Content-Type: application/json" -X POST -d '{"API_ENDPOINT": "https://tetration.mycompany.com","VRF": "MyVRF","app_scope": "MyAppScope","api_key": "1234567890abcdfef","api_secret": "1234567890abcdfef"}' http://alfred-host:5000/api/v1/tetration
```
<b>Returns:</b><br>
Tetration credentials configuration<br>
<i>Note: API Key and API Secret will only be shown once</i>

```
{
  "API_ENDPOINT": "https://tetration.mycompany.com", 
  "VRF": "MyVRF", 
  "app_scope": "MyAppScope",
  "api_key: "1234567890abcdfef",
  "api_secret: "1234567890abcdfef"
}
```
--
### <u>APIC API</u>
#### Methods: GET, POST
#### Usage example (GET):
```
curl http://alfred-host:5000/api/v1/apic
```
<b>Returns:</b><br>
APIC configuration<br>
```
{
  "aci_annotations_enabled": false, 
  "apic_ip": "apic/endpoint/here", 
  "apic_password": "apic_password_here", 
  "apic_port": "apic_port_here", 
  "apic_user": "apic_user_here"
}
```
#### Usage example (POST):
```
curl -i -H "Content-Type: application/json" -X POST -d '{"apic_ip" : "https://apic.mycompany.com","apic_port" : "443","apic_user" : "admin","apic_password" : "mypassword", "aci_annotations_enabled":true}' http://alfred-host:5000/api/v1/apic
```
<b>Returns:</b><br>
APIC configuration<br>
```
{
  "aci_annotations_enabled": true, 
  "apic_ip": "https://apic.mycompany.com", 
  "apic_password": "mypassword", 
  "apic_port": "443", 
  "apic_user": "admin"
}
```

--
### <u>APIC API</u>
#### Methods: GET, POST
#### Usage example (GET):
```
curl http://alfred-host:5000/api/v1/mailer
```
<b>Returns:</b><br>
Email alerts configuration<br>
```
{
  "mail_server_address": "my.mail.server", 
  "mail_server_auth": "no", 
  "mail_server_enabled": false, 
  "mail_server_password": "mypass", 
  "mail_server_proto": "smtp_or_smtptls", 
  "mail_server_recipient": "you@alfred.com", 
  "mail_server_sender": "myself@alfred.com", 
  "mail_server_user": "myuser"
}
```
#### Usage example (POST):
```
curl -i -H "Content-Type: application/json" -X POST -d '{"mail_server_address" : "smtp.mycompany.com","mail_server_proto" : "smtp","mail_server_auth" : "no","mail_server_user" : "tetration@mycompany.com", "mail_server_password": "mypass", "mail_server_sender": "tetration@mycompany.com", "mail_server_recipient": "sysadmins@mycompany.com", "mail_server_enabled": true}' http://10.58.16.91:5000/api/v1/mailer
```
<b>Returns:</b><br>
Email alerts configuration<br>
```
{
  "mail_server_address": "smtp.mycompany.com", 
  "mail_server_auth": "no", 
  "mail_server_enabled": true, 
  "mail_server_password": "mypass", 
  "mail_server_proto": "smtp", 
  "mail_server_recipient": "sysadmins@mycompany.com", 
  "mail_server_sender": "tetration@mycompany.com", 
  "mail_server_user": "tetration@mycompany.com"
}
```

--

### <u>Endpoints API</u>
#### Methods: GET
#### Usage example (GET):
```
curl http://alfred-host:5000/api/v1/endpoints
```
<b>Returns:</b><br>
Endpoints status<br>
```
{
  "apic_status": "reachable", 
  "tetration_status": "reachable"
}
```
```
{
  "apic_status": "down", 
  "tetration_status": "down"
}
```

--
### <u>Mailtest API</u>
#### Methods: POST
#### Usage example (GET):
```
curl -i -H "Content-Type: application/json" -X POST -d '{"email_sub": "Test Subject","email_body": "This is the body"}' http://alfred-host:5000/api/v1/mailtest
```



