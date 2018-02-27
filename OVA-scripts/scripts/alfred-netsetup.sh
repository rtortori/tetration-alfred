#!/bin/bash

IPADDR=$(vmtoolsd --cmd "info-get guestinfo.ovfenv" | grep IP_Address | cut -f4 -d"\"")
NETMASK=$(vmtoolsd --cmd "info-get guestinfo.ovfenv" | grep Subnet_Mask | cut -f4 -d"\"")
DNS1=$(vmtoolsd --cmd "info-get guestinfo.ovfenv" | grep DNS_Address | cut -f4 -d"\"")
GATEWAY=$(vmtoolsd --cmd "info-get guestinfo.ovfenv" | grep Default_Gateway | cut -f4 -d"\"")

# Configure Network settings
sed -i "/IPADDR/c\IPADDR=\"$IPADDR\"" /etc/sysconfig/network-scripts/ifcfg-ens160
sed -i "/PREFIX/c\NETMASK=\"$NETMASK\"" /etc/sysconfig/network-scripts/ifcfg-ens160
sed -i "/DNS1/c\DNS1=\"$DNS1\"" /etc/sysconfig/network-scripts/ifcfg-ens160
sed -i "/GATEWAY/c\GATEWAY=\"$GATEWAY\"" /etc/sysconfig/network-scripts/ifcfg-ens160

# Restart Network
systemctl restart network
# Enable IPv4 forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# Configure Kafka Listener
sed -i "/^listeners=PLAINTEXT/c\listeners=PLAINTEXT:\/\/$IPADDR:9092" /opt/kafka/config/server.properties 
sed -i "/^advertised.listeners/c\advertised.listeners=PLAINTEXT:\/\/$IPADRR:9092" /opt/kafka/config/server.properties
