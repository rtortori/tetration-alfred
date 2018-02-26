# User Guide
## Configure Alfred

When you connect to Alfred the first time, you will see a configuration form and some toggle switches that will allow you to enable or disable specific features.<br>
Select the features you want to enable and fill the configuration form.<br>
<b>Tetration credentials and Kafka Broker configuration are mandatory.</b><br>
Once you have completed the configuration, click on the "Submit" button and confirm. Alfred will start automatically.<br>
<br>
In the "Operate" panel, you can:<br>
- Start, Stop or Restart Alfred Service<br>
- Check feature status<br>
- Check whether Tetration and APIC are reachable<br>
<br>
When Alfred is Up & Running, an additional tab will appear: the "Monitor" tab.<br>
Here you can monitor Alfred and ACI Annotations logs as well as monitor all Kafka notifications for the topic and broker you have specified.
<br>
Log files and Kafka notifications are refreshed every 30 seconds.<br>
<br>
Once Alfred is up, you can start sending messages from Tetration User Apps.<br>
Below you will find an example of user app usage with Alfred.

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
