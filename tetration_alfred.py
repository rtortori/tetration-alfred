# Required modules
import json
import time

from kafka import KafkaConsumer

# Import alfred utils
import alfred_utils

# Debug mode
debug_mode = True

# Open the global configuration file
try:
    configuration = json.load(open('alfred_configuration.json'))
except Exception:
    print("Couldn't load the configuration file")
    exit(1)

# Tetration Configuration
API_ENDPOINT = configuration['API_ENDPOINT']
CREDENTIALS_FILE = configuration['CREDENTIALS_FILE']

# Global Configuration
apic_data_file = configuration['apic_data_file']
brokers_file = configuration['brokers_file']
topic = configuration['topic']
consumer_group = configuration['consumer_group']
annotation_csv_file = configuration['annotation_csv_file']
VRF = configuration['VRF']
app_scope = configuration['app_scope']

# Open the brokers file and create a list of brokers
with open(brokers_file) as f:
    brokers = f.readlines()
brokers = [x.strip() for x in brokers]

# Open the apic_config_file to fetch APIC configuration
apic_data = json.load(open(apic_data_file))

# APIC Configuration
apic_ip = apic_data['apic_ip']
apic_port = apic_data['apic_port']
apic_user = apic_data['apic_user']
apic_password = apic_data['apic_password']

# Initialize KafkaConsumer, deserialize the values in JSON format
consumer = KafkaConsumer('{}'.format(topic),
                         group_id='{}'.format(consumer_group),
                         bootstrap_servers = brokers,
                         value_deserializer=json.loads)

# Debug
if debug_mode:
    print(topic, brokers, consumer.config)

# Infinite Loop
while True:
    # The following will happen for each message we read on Kafka...
    for message in consumer:
        # ...given that is in the right format :)
        try:
            last_msg_value = message.value
            last_msg_offset = message.offset
            # Debug
            if debug_mode:
                print(last_msg_value, last_msg_offset)

            # Define query type and payload
            query_type = last_msg_value['query']
            payload = last_msg_value['payload']

            # Define action if Tetration is asking for endpoints detail
            if query_type == 'get_endpoint_detail':
                # Tetration MUST pass the list of endpoints into a list
                for item in payload:
                    # Debug
                    if debug_mode:
                        print(item)

                    # Poll the messages from Kafka to commit the offset
                    consumer.poll()
                    #
                    try:
                        ep_detail = alfred_utils.fetch_ep_detail(item, apic_ip, apic_port, apic_user, apic_password)
                        time_now = time.strftime("%d-%b-%Y-%H:%M:%S", time.gmtime())

                        # Debug
                        if debug_mode:
                            print("Tenant: " + ep_detail[0] + "\r")
                            print("Application: " + ep_detail[1] + "\r")
                            print("EPG: " + ep_detail[2] + "\r")
                            print("Encapsulation: " + ep_detail[3] + "\r")
                            print("Leaf ID: " + ep_detail[4] + "\r")
                            print("Learning Source: " + ep_detail[5] + "\r")
                            print("ACI Info Date: " + time_now)

                        # The fetch_ep_detail function will return a list
                        _Tenant =  ep_detail[0]
                        _Application =  ep_detail[1]
                        _EPG =  ep_detail[2]
                        _Encapsulation =  ep_detail[3]
                        _Leaf_ID =  ep_detail[4]
                        _Learning_Source =  ep_detail[5]
                        _ACI_Info_Date =  time_now

                        # Write CSV file
                        alfred_utils.create_annotation(annotation_csv_file,
                                                       item,
                                                       VRF,
                                                       _Tenant,
                                                       _Application,
                                                       _EPG,
                                                       _Encapsulation,
                                                       _Leaf_ID,
                                                       _Learning_Source,
                                                       _ACI_Info_Date)

                        # Push Annotation to Tetration
                        alfred_utils.tet_annotate('add', API_ENDPOINT, CREDENTIALS_FILE, annotation_csv_file, app_scope)


                    except Exception:
                        # Will trigger if the condition of the fetch_ep_detail function is not met
                        if debug_mode:
                            print('Endpoint not present')
                        pass

                if debug_mode:
                    print('Done!')

        # If the message is not properly formatted we will just ignore it
        except Exception:
            if debug_mode:
                print('Error processing message, moving on')
            pass