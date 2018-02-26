# Cisco Tetration Alfred
###### A loyal butler for your Cisco Tetration Analytics Cluster!
Disclaimer: This is NOT an official Cisco application and comes with absolute NO WARRANTY!<br>

## What is this?

Alfred is a Kafka consumer application written in Python, Javascript and HTML5 that take actions based on Cisco Tetration Analytics inputs.<br>
It has been designed to be Tetration swiss army knife.<br> 
Today, Alfred supports asset annotations based on Cisco ACI endpoint tracker and is capable to forward Tetration alarms via email.<br>
A Kafka topic monitor is also available.

## Concept

The idea behind this application is to create a protocol that can be leveraged by Cisco Tetration
User apps in order to ask "questions" to Alfred and make him take actions accordingly. <br><br>
Cisco Tetration Analytics can be configured to send notifications to data taps (configured target Kafka 
brokers).<br>
To push any alerts out from Tetration cluster, user needs to use a configured data taps. 
Site admin users are the only ones who can configure and activate new/existing data taps. 
Users can only view data taps that belong to their Tenant. <br>

Tetration Alfred has a Kakfa consumer backend written in Python that consumes messages 
from specific topics using consumer groups. 
It can be scaled horizontally to parallelize the processing given 
that the target Kafka topic has enough partitions. <br>
Refer to the following link for further info:
https://kafka.apache.org/documentation/#kafka_mq

## Screenshots
Alfred Configuration:

<img src="https://raw.githubusercontent.com/rtortori/tetration-alfred/master/screenshots/config-ss.png" width=70% />


Kafka Monitor:

<img src="https://raw.githubusercontent.com/rtortori/tetration-alfred/master/screenshots/kafka-monitor-ss.png" width=70% />

Alfred Operations:

<img src="https://raw.githubusercontent.com/rtortori/tetration-alfred/master/screenshots/operate-ss.png" width=70% />

## Environment<br>
This application has been developed and tested under the following environment conditions:<br>
- Cisco ACI 3.0(1k)
- Cisco TetrationOS Software, Version 2.2.1.31
- Apache Kafka 0.10.2.1 and 1.0.0
- Docker CE 17.12.0-ce (for docker version of tetration-alfred)

## Prerequisites<br>
- Cisco Tetration Analytics cluster (for ACI Annotations)
- Cisco ACI Fabric (for ACI Annotations)
- At least one working Apache Kafka broker (Mandatory)
- An outbound mail server (for Email Alerts)

## Installation Guide
Install docker CE. Have a look at the 
[official installation guide](https://docs.docker.com/install/ "Docker Install")

1. Clone this repo
2. cd into **tetration-alfred** directory
3. Edit Dockerfile in case you are behind a proxy
4. Copy the content of the UI folder under the root of any webserver you have (i.e. NGINX, Apache, etc.)
5. Build tetration-alfred container and run it:<br> 

```
docker build -t tetration-alfred .
```

```
docker run -itd -p 5000:5000 tetration-alfred
```
<br>
The command above will expose port 5000 for API Access.<br>


## Release notes: 1.0 
"Questions" are made in JSON format.<br>
The JSON **MUST** have two keys, "query" and "payload".<br>
Where "query" is the type of question and "payload" is the question itself. <br>

Supported queries are:<br>
- `get_endpoint_details` for ACI Annotations<br>
- `dump_to_email` for Email Alerts
        
#### ACI Annotations Use Case

Payload is a list of endpoints that Alfred will use to query the endpoint tracker API exposed by 
Cisco APIC controller.<br>
The response will be parsed and packaged as a CSV file that will be pushed back to Tetration through
User Annotations API.<br>

##### Example outcome for ACI Annotations
Given the following "question" made by a Tetration User App:
```
{
'query': 'get_endpoint_detail',
'payload' : ['10.1.1.1',
             '10.1.1.2',
             '10.1.1.3']
} 
```

Alfred will annotate assets like this:

| IP       | ACI Info Date        | Application   | EPG     | Encapsulation | Leaf ID | Learning Source | Tenant    | VRF   |
|----------|----------------------|---------------|---------|---------------|---------|-----------------|-----------|-------|
| 10.1.1.1 | 14-Dec-2017-18:27:44 | Tetration_Lab | Default | vlan-201      | 202     | learned-vmm     | Tetration | MyLab |
| 10.1.1.2 | 14-Dec-2017-18:27:44 | My_app        | Test    | vlan-100      | 201     | learned-vmm     | Tetration | MyVRF |
| 10.1.1.3 | 14-Dec-2017-18:27:44 | Your_app      | Prod    | vlan-123      | 201     | learned-vmm     | Tetration | Apps  |


#### Email Alerts Use Case

Payload is a string that will be sent as the body of an email. 

## User Guide

### Configure Alfred
*TO DO*

### Cisco Tetration Analytics User App
The file*h4_pyspark.ACI Annotations.ipynb* has been provided with Alfred.<br> 
You will need to import it into Data Platform user apps:<br>
- Under "Data Platform", click on "User Apps" in the left pane
- Click on "Import App"
- Select*h4_pyspark.ACI Annotations.ipynb* and give it a name
- Run the application or schedule it clicking on "Jobs" in the left pane<br><br>
**Note: The Application will take into account data for the scope you are currently using**<br>
**Ensure that in alfred_configuration.json you have configured the same scope**

#### User App configuration
After you've opened the User App in Tetration, you can configure it in the 1st Jupyter Notebook Cell.
<br>
Current implementation supports the following parameters:<br>
- data_tap
    - The target data tap name. It **MUST** match the name that has been configured under
    "Datataps" on Tetration
- topic
    - The topic name
- ip_subnet_prefix
    - Prefix of the IPs that Tetration will look for in the inventory

**Note: From Tetration 2.2.1.31, the Datatap will embed the topic configuration. The code 
above will NOT work, you will need to omit the topic to have a working user app, this is documented
in the Tetration User App** <br>
    
<br>
The following configuration example will make Tetration look for endpoints in the inventory for the last 
hour which IP starts with 10.1. <br>
It will then drop the JSON question to the target Datatap "Kafka-DT"<br><br>

```
data_tap = 'Kafka-DT'
ip_subnet_prefix = '10.1'
```


## API Guide
Alfred API Guide is available [here](https://github.com/rtortori/tetration-alfred/blob/master/API_Guide.md)

<br>
For further information around Tetration User Apps please refer to the "User Guide" present 
in your Cisco Tetration Analytics cluster.