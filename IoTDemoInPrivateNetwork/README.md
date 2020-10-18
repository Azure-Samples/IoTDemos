# <span style="color:#0080FF">Creating an End-to-End IoT infrastructure in a Private Network</span>
The default configuration of Azure services allows public IP access to those services. For example an on-premises device with Internet access can connect to an Azure IoT Hub using a URL that resolves to a public IP address. For some scenarios or corporations this might be inappropriate, so we need to turn off public IP access to the relevant Azure services and configure all the services and communications to be on a private network. Though the process for how to do this is documented on a service-by-service basis for the various Azure services, how to connect them together is not entirely obvious.

 The goal of this document is provide a sample of securing all the services and connections in a simple IoT scenario. 

 Note: *This document does not include mouse-click-by-mouse-click instructions on how to deploy the various services. Rather it assumes a basic knowledge of Azure, and includes only what components need to be configured, and examples of the configuration.*
 
 ## <span style="color:#0080FF">Contributors</span>
 - Spyros Sakellariadis, Program Manager, Industry Innovation, Enterprise Commercial Business
 - David Apolinar, Cloud Solution Architect, US Financial Services Industry
 - John Lian, Program Manager, Azure IoT Platform

## <span style="color:#0080FF">Major elements shown in end-to-end solution</span>
This sample does not include all possible services or configurations, of course, only a few in order to demonstrate the basic structures. The components that will be described include:

1. **VPN** - IPsec tunnel between on-premises systems and Azure
2. **Azure IoT Hub** - securing against public IP access
3. **Azure VM** and **Azure Data Lake** - configuring typical Azure assets with only private IP access
4. **DNS** - name resolution for assets with no public IP access

Finally we will provide an example of sending IoT telemetry from on-premises devices through to Azure Data Lake.

## <span style="color:#0080FF">High level architecture</span>
The IoT sample described consists of some on-premises components as well as Azure. To provde a visual reference for the items discussed, here are the high level architectures.

### <span style="color:#0080FF">On-premises configuration</span>
The following diagram shows the elements in the local environment.

<img src="images/On-premises_config.jpg" width="600"/><p>

### <span style="color:#0080FF">Azure configuration</span>
The following diagram shows the elements in the sample Azure environment. 

<img src="images/Azure_config.jpg" width="600"/><p>

## <span style="color:#0080FF">Setting up the site-to-site VPN</span>
The following diagram shows the elements in the sample Azure environment needed to create an IPsec site-to-site Virtual Private Network. 

<img src="images/Site-to-site-VPN.jpg" width="450"/><p>


A 'How-to Guide' for creating a site-to-site VPN is published on the Microsoft website here: [Create a Site-to-Site connection in the Azure portal](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-site-to-site-resource-manager-portal)

Configuration of these elements in the end-to-end sample is shown below. 


### <span style="color:#0080FF">Virtual network</span>
From the Azure portal, select Add > Virtual network. Configuration in the end-to-end sample is as follows:

<img src="images/Virtual_Network.jpg" width="450"/><p>
### <span style="color:#0080FF">Virtual network gateway</span>
From the Azure portal, select Add > Virtual network gateway. The IP address of the Azure virtual network gateway needs to be the public IP of that object, assigned by the system as the gateway is being created. (Here shown as 40.x.x.x) Configuration in the end-to-end sample is as follows:

<img src="images/Virtual_Network_Gateway.jpg" width="450"/><p>


### <span style="color:#0080FF">Local network gateway</span>
From the Azure portal, select Add > Local network gateway. This object represents the device on-premises that is the local endpoint for the IPsec tunnel. The IP address of the Local network gateway needs to be the public IP of that device, for example, the public IP address of the firewall or router on the WAN port. (Here shown as 24.x.x.x)The Address space needs to be the address space of the local network behind that firewall or router. Configuration in the end-to-end sample is as follows:

<img src="images/Local_Network_Gateway.jpg" width="450"/><p>

### <span style="color:#0080FF">Connection</span>
From the Azure portal, select Add > Connection. The purpose is to create an object that is the connection between the Virtual network gateway and the local network gateway. Pick the local and Azure network gateways created above during setup of the connection. The IP addresses will be added automatically. Configuration in the end-to-end sample is as follows:

<img src="images/Connection.jpg" width="450"/><p><br>


## <span style="color:#0080FF">Deploying IoT Hub with only private IP access</span>
The following diagram shows the elements in the sample Azure environment. 

<img src="images/IoTHub.jpg" width="450"/><p>
A 'How-to Guide' for configuring IoT Hub in a vnet is published on the Microsoft website here: [IoT Hub support for virtual networks with Private Link and Managed Identity](https://docs.microsoft.com/en-us/azure/iot-hub/virtual-network-support)

Configuration of these elements in the end-to-end sample  is shown below. From the Azure portal, select Create a Resource > IoT Hub. Configuration of the IoT Hub in the end-to-end sample is as follows:

### <span style="color:#0080FF">Overview</span>
<img src="images/IoTHubOverview.jpg" width="450"/><p>
### <span style="color:#0080FF">Public endpoints</span>
The goal is to disable public IP access to the IoT Hub, which is done in in the Networking section:

<img src="images/IoTHubPublicEndpoints.jpg" width="450"/><p>

### <span style="color:#0080FF">Private endpoints</span>
Select Private endpoint connections and click + to add a private endpoint in the vnet created earlier:

<img src="images/IoTHubPrivateEndpoints.jpg" width="450"/><p>
### <span style="color:#0080FF">Private endpoint</span>

This is the private endpoint of the IoT Hub
<img src="images/IoTHubPrivateEndpoint.jpg" width="450"/><p>

Note you cannot enumerate IoT Devices or use Device Explorer to see telemetry incoming to IoT Hub because public IP addresses are blocked.

<span style="color:#FF0000">[John - please elaborate/rephrase this section]</span> In order to secure all access to the IoT Hub, it is best to route all messages from the IoT Hub to an independent Event Hub. First, create an Event Hub. From the Azure portal, select Create a Resource > Event Hub. Configuration of the Event Hub in the end-to-end sample is as follows: 

### <span style="color:#0080FF">Event Hub</span>

<img src="images/EventHub.jpg" width="450"/><p>

### <span style="color:#0080FF">Event Hub Networking</span>

<img src="images/EventHubNetworking.jpg" width="450"/><p>

### <span style="color:#0080FF">Event Hub Privte Endpoints</span>

<img src="images/EventHubPrivateEndpoints.jpg" width="450"/><p>

### <span style="color:#0080FF">Event Hub Access Control</span>
<img src="images/EventHubAccessControl.jpg" width="450"/><p>

### <span style="color:#0080FF">Message routing</span>
Having created an Event Hub with only private endpoints, now forward all telemetry coming in to the IoT Hub to that Event Hubusing the IoT Hub Message Routing Feature:

<img src="images/IoTHubMessageRouting.jpg" width="450"/><p>

### <span style="color:#0080FF">Message routing detail</span>
Routing details are as follows:

<img src="images/IoTHubMessageRoutingDetail.jpg" width="450"/><p>

## <span style="color:#0080FF">Deploying downstream Azure assets</span>
The following diagram shows the elements in the sample Azure environment. 

<img src="images/Downstream_assets.jpg" width="450"/><p>
- [Find](https://iconics.com/Documents/WhitePapers/Using-IoTWorX-as-a-Gateway)
- [Find](https://iconics.com/Documents/WhitePapers/Using-IoTWorX-as-a-Gateway)

<br>

<img src="images/ADLSFirewall.jpg" width="450"/><p>
<img src="images/ADLSvnetPeering.jpg" width="450"/><p>
<img src="images/VMOverview.jpg" width="450"/><p>
<img src="images/VMIPConfig1.jpg" width="450"/><p>
<img src="images/VMIPconfigurations.jpg" width="450"/><p>
<img src="images/VMNetworking.jpg" width="450"/><p>

## <span style="color:#0080FF">Deploying DNS servers</span>
DNS servers are needed to resolve URLs for services in Azure. When those services are initially deployed, they are accessed using a URL that resolves to their public IP address. For example

mydemovm.eastus.cloudapp.azure.com may resolve to 52.168.x.x

However, since we are preventing access to any public IP address and using only private endpoints, applications would have to resolve to the private IP address. For example

mydemovm.eastus.cloudapp.azure.com may need to resolve to 10.2.0.x

To do this, a DNS conditional forwarder is needed locally, to resolve requests from on-premises devices to Azure services, and in Azure, to resolve requests from one Azure service to another. 


### <span style="color:#0080FF">Azure</span>
The following diagram shows the elements in the sample Azure environment. 

<img src="images/DNS-Azure.jpg" width="450"/><p>
- [Find](https://iconics.com/Documents/WhitePapers/Using-IoTWorX-as-a-Gateway)

### <span style="color:#0080FF">Local</span>


<br>

## <span style="color:#0080FF">Sending IoT telemetry to Azure</span>
assume that a 3rd party is installed on a local computer and configured to pull telemetry from devices and forward them to Azure IoT Hub. More on that later...

Detailed guidance on how to set up such a gateway, IoTWorX from ICONICS, is available from the following two locations, and there is no need to replicate it here:

- [Using IoTWorX as a Gateway](https://iconics.com/Documents/WhitePapers/Using-IoTWorX-as-a-Gateway), and 
- [Installing IoTWorX on IoT Edge](https://iconics.com/Documents/Whitepapers/Installing-IoTWorX-on-IoT-Edge)

Since the goal is to have all communications go through a private network, a firewall-to-Azure IPsec tunnel is used. The setup in this sample used a Barracuda F18 CloudGen firewall, though any device capable of setting up an IPsec tunnel would work. Detailed guidance on how to set up an IPsec tunnel from this model Barracuda is available here:

- [Creating a Site-to-Site VPN from a Barracuda firewall to Azure](https://github.com/spyrossak/Azure-vpn-config-samples/blob/master/Barracuda/barracuda.md)

[How to Configure an IKEv2 IPsec Site-to-Site VPN to a Routed-Based Microsoft Azure VPN Gateway](https://campus.barracuda.com/product/cloudgenfirewall/doc/73719171/how-to-configure-an-ikev2-ipsec-site-to-site-vpn-to-a-routed-based-microsoft-azure-vpn-gateway/)

The final piece needed in the local configuration is a DNS conditional forwarder. The IoTWorX gateway is configured to send data to a friendly URL for the Azure IoT Hub, but since the Azure IoT Hub will be configured to have only a private IP address, we need a local DNS server to resolve the Hub URL to the private IP address.

<img src="images/EventHubTelemetryReceived.jpg" width="450"/><p>