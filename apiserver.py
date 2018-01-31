from flask import request, Flask, jsonify, abort, make_response
import json

# Define Flask app name
alfred_api = Flask(__name__)


# Return a message in case apic_data.json is not found
@alfred_api.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'config_files': 'Not found'}), 404)

###### REST API GET Section ######

# REST API - GET current APIC configuration
@alfred_api.route('/api/v1/apic', methods=['GET'])
def get_apic_cfg():
    try:
        apic_config = json.load(open('apic_data.json'))
    except Exception:
        print("Couldn't load the apic_config.json file")
        abort(404)
    return jsonify(apic_config)

# REST API - GET current Kafka broker configuration
@alfred_api.route('/api/v1/broker', methods=['GET'])
def get_broker_cfg():
    try:
        with open('brokers_list.txt', 'r') as f1:
            brokers_string = f1.read()
            brokers_split = brokers_string.split(":")
            brokers_list_dict = {
                "broker_ip": brokers_split[0],
                "broker_port": brokers_split[1]
            }

        with open('alfred_configuration.json','r') as f2:
            alfred_config = json.load(open('alfred_configuration.json'))
            brokers_list_dict['topic'] = alfred_config['topic']

    except Exception:
        print("Couldn't load brokers list file")
        abort(404)

    return jsonify(brokers_list_dict)

# REST API - GET current Tetration configuration
# This WILL NOT include the API/SECRET keys
@alfred_api.route('/api/v1/tetration', methods=['GET'])
def get_tetration_cfg():
    try:
        alfred_config = json.load(open('alfred_configuration.json'))
        tetration_config = {
            "API_ENDPOINT": alfred_config["API_ENDPOINT"],
            "VRF": alfred_config["VRF"],
            "app_scope": alfred_config["app_scope"]
        }
    except Exception:
        print("Couldn't load configuration file")
        abort(404)
    return jsonify(tetration_config)


###### REST API POST Section ######

# REST API - POST APIC configuration
@alfred_api.route('/api/v1/apic', methods=['POST'])
def create_apic_cfg():
    if not request.json or not 'apic_ip' in request.json:
        abort(400)

    # Fill the dict with POST payload
    apic_config = {
        "apic_ip": request.json["apic_ip"],
        "apic_port": request.json["apic_port"],
        "apic_user": request.json["apic_user"],
        "apic_password": request.json["apic_password"]
    }

    with open('apic_data.json', 'w') as f:
        json.dump(request.json, f, indent=4, sort_keys=True)
    return jsonify(apic_config), 201

# REST API - POST Kafka broker configuration
@alfred_api.route('/api/v1/broker', methods=['POST'])
def create_broker_cfg():
    if not request.json or not 'broker_ip' in request.json:
        abort(400)

    # Load current Alfred config
    alfred_config = json.load(open('alfred_configuration.json'))

    # Fill the dict with POST payload
    broker_config = {
        "broker_ip": request.json["broker_ip"],
        "broker_port": request.json["broker_port"]
    }

    with open('brokers_list.txt', 'w') as f1:
        f1.write(broker_config["broker_ip"] + ":" + broker_config["broker_port"])

    with open('alfred_configuration.json', 'w') as f2:
        # Replace values in Alfred config
        alfred_config['topic'] = request.json['topic']
        json.dump(alfred_config, f2, indent=4, sort_keys=True)
        # Merge config into a single JSON to be sent as response
        broker_config_final = broker_config
        broker_config_final['topic'] = alfred_config['topic']

    return jsonify(broker_config_final), 201

# REST API - POST Tetration configuration
@alfred_api.route('/api/v1/tetration', methods=['POST'])
def create_tetration_cfg():
    if not request.json or not 'API_ENDPOINT' in request.json:
        abort(400)

    # Load current Alfred config and credentials file
    alfred_config = json.load(open('alfred_configuration.json'))
    tetration_credentials = json.load(open('tetration_credentials.json'))

    # Fill the dict with POST payload
    tetration_config = {
        "API_ENDPOINT": request.json["API_ENDPOINT"],
        "VRF": request.json["VRF"],
        "app_scope": request.json["app_scope"],
        "api_key": request.json["api_key"],
        "api_secret": request.json["api_secret"]
    }

    with open('alfred_configuration.json', 'w') as f1:
        # Write POST payload in global alfred config
        alfred_config['API_ENDPOINT'] = tetration_config['API_ENDPOINT']
        alfred_config['VRF'] = tetration_config['VRF']
        alfred_config['app_scope'] = tetration_config['app_scope']
        json.dump(alfred_config, f1, indent=4, sort_keys=True)

    with open('tetration_credentials.json', 'w') as f2:
        # Write POST credentials payload in credential file for TA
        tetration_credentials['api_key'] = tetration_config['api_key']
        tetration_credentials['api_secret'] = tetration_config['api_secret']
        json.dump(tetration_credentials, f2, indent=4, sort_keys=True)

    return jsonify(tetration_config), 201

if __name__ == '__main__':
    alfred_api.run(debug=True)