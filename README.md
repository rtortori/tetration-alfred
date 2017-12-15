# Cisco Tetration Alfred
###### A loyal butler for your Cisco Tetration Analytics Cluster!
Disclaimer: This is NOT an official Cisco application and comes with absolute NO WARRANTY!<br>

## Concept

The idea behind this application is to create a protocol that can be leveraged by Cisco Tetration
User apps in order to ask "questions" to Alfred and make him take actions accordingly. <br><br>
Cisco Tetration Analytics can be configured to send notifications to data taps (configured target Kafka 
brokers).<br>
To push any alerts out from Tetration cluster, user needs to use a configured data taps. 
Site admin users are the only ones who can configure and activate new/existing data taps. 
Users can only view data taps that belong to their Tenant. <br>

Tetration Alfred is a Kakfa consumer application written in Python that consumes messages 
from specific topics using consumer groups. 
This means that it can be scaled horizontally to parallelize the processing given 
that the target Kafka topic has enough partitions. <br>
Refer to the following link for further info:
https://kafka.apache.org/documentation/#kafka_mq

## Example outcome
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


## Current version: 0.1 
"Questions" are made in JSON format.<br>
Current implementation of the JSON question is:<br>
```
{
'query': 'get_endpoint_detail',
'payload' : ['10.1.1.1',
             '10.1.1.2',
             '10.1.1.3']
}                
```
Where "query" is the type of question and "payload" is the question itself. <br><br>
Current implementation only supports ACI annotations, therefore the only query supported is 
"get_endpoint_detail".<br>
Payload is a list of endpoints that Alfred will use to query the endpoint tracker API exposed by 
Cisco APIC controller.<br>
The response will be parsed and packaged as a CSV file that will be pushed back to Tetration through
User Annotations API.<br>

## Road-map (not committed)
Since the ACI annotation engine is triggered using a specific query in the question, further actions can be implemented 
by implementing new queries.<br><br>
Plan is to extend annotation support for data fetched from:
- Cisco AppDynamics
- Cisco Stealthwatch
- Cisco Workload Optimization Manager (CWOM)


## Requirements<br>
- Cisco Tetration Analytics cluster
- Cisco ACI Fabric
- At least one working Apache Kafka broker
- Linux operating system with Python 3.6

## Environment<br>
This application has been developed and tested under the following environment conditions:<br>
- Cisco ACI 3.0(1k)
- Cisco TetrationOS Software, Version 2.1.1.31
- Apache Kafka 0.10.2.1 and 1.0.0
- Alfred running on CentOS 7.4
- Python 3.6
- Python modules (see requirements.txt)
    - kafka==1.3.5
    - requests==2.18.4
    - tetpyclient==1.0.5
    
## Prerequisites installation
1. Identify or deploy a Linux server (VM or baremetal)
2. Install python3.6. Examples can be found here: http://ask.xmodulo.com/install-python3-centos.html
3. Install pip3.6 using apt or yum
4. Install python3 requirements with <br>
```pip3.6 install -r requirements.txt ```
5. Install git
6. Move to your favourite directory and clone this repo with <br>
```git clone https://github.com/rtortori/tetration-alfred.git```
7. On your Cisco Tetration Analytics cluster, go to "API Keys" and create a new API Key.<br>
Save the resulting JSON file under the same directory of tetration_alfred.py

## Alfred usage
### Configuration steps
1. By default Alfred pulls the configuration from a file called *alfred_configuration.json*<br>
A sample configuration file has been provided: *sample_alfred_configuration.json*. <br>
Rename it to alfred_configuration.json, edit and put your configuration data
<br>
2. Rename the sample_broker.txt file and specify your target Kafka brokers. You can specify more than
one Kafka broker though Tetration will send data to a single data taps
<br>
3. Rename the sample_apic_data.json file and fill in with your APIC specific configuration
<br>
4. Within tetration_alfred.py you can toggle debug mode on/off (default is*on*)<br>

```
debug_mode = True
```

### Running the application
Start tetration_alfred.py with:<br>
```
python3.6 tetration_alfred.py
```

### Cisco Tetration Analytics user app
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
    
<br>
The following configuration example will make Tetration look for endpoints in the inventory for the last 
hour which IP starts with 10.1. <br>
It will then drop the JSON question to Kafka topic "tetration", using Data Tap "Kafka-DT"<br><br>

```
data_tap = 'Kafka-DT'
topic = 'tetration'
ip_subnet_prefix = '10.1'
```
<br>
For further information around Tetration User Apps please refer to the "User Guide" present 
in your Cisco Tetration Analytics cluster.