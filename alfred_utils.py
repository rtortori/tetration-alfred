import requests
import urllib3
import json
import csv
import tetpyclient
import logging
from tetpyclient import RestClient
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Enable or disable debugging
debug_mode = True

# Disable warnings for SSL
urllib3.disable_warnings()

# Define a function to call in order to annotate flows on Tetration
def tet_annotate(operation_type, API_ENDPOINT, CREDENTIALS_FILE, annotation_csv_file, app_scope):
    rc = RestClient(API_ENDPOINT, credentials_file=CREDENTIALS_FILE, verify=False)
    if debug_mode:
        print('Operation Type: ' + operation_type)
        print('API Endpoint: ' + API_ENDPOINT)
        print('Credentials File: ' + CREDENTIALS_FILE)
        print('Annotation CSV file: ' + annotation_csv_file)
        print('App Scope: ' + app_scope)

    try:
        if operation_type == 'add':
            if debug_mode:
                print('Adding Annotation')
            req_payload = [tetpyclient.MultiPartOption(key='X-Tetration-Oper', val='add')]
            rc.upload(annotation_csv_file, '/assets/cmdb/upload/' + app_scope, req_payload)
        elif operation_type == 'delete':
            if debug_mode:
                print('Deleting Annotation')
            req_payload = [tetpyclient.MultiPartOption(key='X-Tetration-Oper', val='delete')]
            rc.upload(annotation_csv_file, '/assets/cmdb/upload/' + app_scope, req_payload)
    except Exception:
        print("Oops - something went wrong")
        pass

# Define a function to call in order to fetch endpoint detail from APIC
def fetch_ep_detail(ep, apic_ip, apic_port, apic_user, apic_password):
    # APIC REST calls
    #auth_url = "https://{}:{}/api/mo/aaaLogin.xml".format(apic_ip, apic_port)
    auth_url = "{}:{}/api/mo/aaaLogin.xml".format(apic_ip, apic_port)
    data = '''<aaaUser name='{}' pwd='{}'/>"'''.format(apic_user, apic_password)
    #ep_url = 'https://{}:{}/api/node/class/fvCEp.json?rsp-subtree=full&rsp-subtree-include=required&rsp-subtree-filter=eq(fvIp.addr,"{}")'.format(apic_ip, apic_port, ep)
    ep_url = '{}:{}/api/node/class/fvCEp.json?rsp-subtree=full&rsp-subtree-include=required&rsp-subtree-filter=eq(fvIp.addr,"{}")'.format(apic_ip, apic_port, ep)
    # Leverage session responses in subsequent calls to APIC
    ses = requests.Session()
    # Logging in to APIC
    auth_req = ses.post(auth_url, data=data, verify=False)
    # Get endpoint details
    ep_tracker = ses.get(ep_url, verify=False)
    ept_content = json.loads(ep_tracker.content)
    # Parse response
    if ep_tracker.status_code == 200:
        if ept_content['totalCount'] != '0':
            parsed_resp = json.loads(ep_tracker.content)
            dn = parsed_resp['imdata'][0]['fvCEp']['attributes']['dn']
            encap = parsed_resp['imdata'][0]['fvCEp']['attributes']['encap']
            lcC = parsed_resp['imdata'][0]['fvCEp']['attributes']['lcC']
            lcC = str(lcC).replace(',','-')
            node = parsed_resp['imdata'][0]['fvCEp']['children'][0]['fvIp']['children'][0]['fvReportingNode']['attributes']['id']

            dn = str(dn).split("/")
            tenant = dn[1].split("-")[1]
            application = dn[2].split("-")[1]
            epg = dn[3].split("-")[1]

            # Return values
            return tenant, application, epg, encap, node, lcC

# Define a function that creates the annotation CSV
def create_annotation(annotation_csv_file, ep, vrf, tenant, application, epg, encapsulation, leaf_id, learning_source, aci_info_date):
    try:
        with open('{}'.format(annotation_csv_file), 'w') as csvfile:
            annotation = csv.writer(csvfile, delimiter=',',
                                    quotechar='|', quoting=csv.QUOTE_MINIMAL)
            annotation.writerow(['IP',
                                 'VRF',
                                 'Tenant',
                                 'Application',
                                 'EPG',
                                 'Encapsulation',
                                 'Leaf ID',
                                 'Learning Source',
                                 'ACI Info Date'])
            annotation.writerow([ep,
                                 vrf,
                                 tenant,
                                 application,
                                 epg,
                                 encapsulation,
                                 leaf_id,
                                 learning_source,
                                 aci_info_date])
    except Exception:
        print('An error occurred during CSV creation')


# Function to setup logger
def setup_logger(name, logfile, level=logging.DEBUG):
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler = logging.FileHandler(logfile)
    handler.setFormatter(formatter)
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.handlers.clear()
    logger.addHandler(handler)
    return logger

# Write logs
def write_to_log(feature, facility, message):

    if feature == 'alfred':
        print('feature is alfred')
        logger = setup_logger('ALFRED', 'logs/alfred.log')

    elif feature == 'aci-annotations':
        print('feature is aci')
        logger = setup_logger('ACI-ANNOTATIONS', 'logs/aci-annotations.log')

    elif feature == 'kafka':
        print('feature is kafka')
        logger = setup_logger('KAFKA', 'logs/kafka.log')

    if facility == 'debug':
        print('facility is debug')
        logger.debug(message)
    elif facility == 'info':
        print('facility is info')
        logger.info(message)
    elif facility == 'warning':
        print('facility is warning')
        logger.warning(message)
    elif facility == ('error'):
        print('facility is error')
        logger.error(message)
    elif facility == 'critical':
        print('facility is critical')
        logger.critical(message)

# Send email
def email(subject, body):
    # Open the global configuration file
    try:
        configuration = json.load(open('alfred_configuration_temp.json'))
    except Exception:
        exit(1)

    if configuration['mail_server_proto'] == 'smtp':
        server_port = 25
    elif configuration['mail_server_proto'] == 'smtptls':
        server_port = 587
    else:
        print('Unsupported mail protocol')
        exit(1)

    server = smtplib.SMTP(configuration['mail_server_address'], server_port)
    msg = MIMEMultipart()
    msg['From'] = configuration['mail_server_sender']
    msg['To'] = configuration['mail_server_recipient']
    msg['Subject'] = subject
    body = body

    msg.attach(MIMEText(body, 'plain'))

    if configuration['mail_server_auth'] == 'yes':
        server.ehlo()
        if server_port == 587:
            server.starttls()
        server.ehlo()
        server.login(configuration['mail_server_user'], configuration['mail_server_password'])

    text = msg.as_string()
    server.sendmail(configuration['mail_server_sender'], configuration['mail_server_recipient'], text)