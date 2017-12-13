# This is a sample Kafka Producer to test Tetration Alfred

# Kafka required libraries
from kafka import KafkaProducer
from kafka.errors import KafkaError
import json


# Open the global configuration file
try:
    configuration = json.load(open('alfred_configuration.json'))
except Exception:
    print("Couldn't load the configuration file")
    exit(1)

# Configuration files
brokers_file = configuration['brokers_file']
topic = configuration['topic']

with open(brokers_file) as f:
    brokers = f.readlines()
brokers = [x.strip() for x in brokers]

# Sample JSON that will request Alfred to annotate flows based on endpoints in the ACI fabric.
# Replace payload according to your ACI endpoints
d = {'query': 'get_endpoint_detail',
     'payload' : ['10.1.2.10',
                  '10.10.10.1',
                  '193.168.151.10',
                  '10.49.166.81',
                  '10.49.166.82']}


# Produce kafka messages
producer = KafkaProducer(bootstrap_servers = brokers, value_serializer=lambda v: json.dumps(v).encode('utf-8'))
a = producer.send('{}'.format(topic), d)

try:
    record_metadata = a.get(timeout=10)
except KafkaError:
    pass

# Successful result returns assigned partition and offset
print (record_metadata.topic)
print (record_metadata.partition)
print (record_metadata.offset)
