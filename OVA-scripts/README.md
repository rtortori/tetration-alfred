# Alfred All-in-one OVA	
## Deployment<br>

- Deploy the OVA from vCenter
- Specify IP Address, Netmask, Gateway and DNS
- Done. Services will start automatically.
<br> 
<br>

## Usage

####Alfred all-in-one comes with the following features turned on:<br>

- Alfred Backend and API Server<br>
- Alfred UI (served by Apache)<br>
- Single Kafka broker<br>
<br>

####Default credentials:<br>

<b>User:</b> root<br>
<b>Password:</b> tetration<br>
<b>Alfred UI Endpoint:</b>http://alfred-ip/<br>
<br>

####Manage Services:<br>
#####Start Alfred<br>
```
systemctl start alfred 
```
#####Stop Alfred<br>
```
systemctl stop alfred 
```
#####Check Alfred status and logs<br>
```
systemctl status alfred 
```
<br>

##### Start Kafka

```
systemctl start kafka 
```

##### Stop Kafka

```
systemctl stop kafka 
```

##### Check Kafka status and logs

```
systemctl status kafka 
```

##### Start Zookeper

```
systemctl start zookeeper 
```

##### Stop Zookeeper

```
systemctl stop zookeeper 
```

##### Check Zookeeper status and logs

```
systemctl status zookeeper 
```