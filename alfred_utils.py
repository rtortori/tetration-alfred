import requests
import urllib3
import json
import csv
import tetpyclient
from tetpyclient import RestClient

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
    auth_url = "https://{}:{}/api/mo/aaaLogin.xml".format(apic_ip, apic_port)
    data = '''<aaaUser name='{}' pwd='{}'/>"'''.format(apic_user, apic_password)
    ep_url = 'https://{}:{}/api/node/class/fvCEp.json?rsp-subtree=full&rsp-subtree-include=required&rsp-subtree-filter=eq(fvIp.addr,"{}")'.format(apic_ip, apic_port, ep)
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