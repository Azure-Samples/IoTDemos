# <span style="color:#0080FF">Creating an End-to-End Azure IoT infrastructure in a Private Network</span>
The default configuration of Azure services allows public IP access to those services. For example an on-premises device with Internet access can connect to an Azure IoT Hub using a URL that resolves to a public IP address. While these Azure services can be locked down against unauthorized access and the communications between them encrypted, some organizations require an additional level of network security. Specifically, they require preventing public IP access to any services, and mandate that all the services and communications to be on a private network. Though the process for how to do this is documented on a service-by-service basis for the various Azure services, the process for how to connect them all together is not entirely obvious.

 The goal of this document is to provide a sample of securing all the services and connections in a simple IoT scenario. 

 Note: *This document does not include mouse-click-by-mouse-click instructions on how to deploy the various services. Rather it assumes a working knowledge of Azure, and includes only what components need to be configured, and examples of the configuration.*

---
TO DO:
- **Spyros** Check the Identity pieces for IoT Hub --> Event Hub. See if I can validate with Visual Studio from laptop.
- **Spyros** Check the Identity pieces for ICONICSVM --> Event Hub and IoT Hub. Confirm with Visual Studio in VM.
- **John** Please review/edit the [IoT Hub](#IoTHub) section. In my understanding, we need to route the data from IoT Hub to Event Hub to secure IoT Hub, and we need to configure a Managed Identity on the IoT Hub so that Event Hub can access it as a trusted service. Is this correct, and have I described that correctly in the IoT Hub section? If I remember correctly, the reason we cannot use ASA to access the Event Hub private endpoint currently is that we don't yet have the ability to configure a Managed Identity on the Event Hub. Is that correct? But if so, why can the virtual machine access the Event Hub?
- **David** Please review/edit the [DNS](#DNS) section. In particular, what is the role of the private DNS zones created in the portal (as opposed to the forwarders created in the DNS server), and how were they created?
- **Spyros** Resolve with Afiri whether the Barracuda firewall config is merged into master
- **Spyros** Final editing to improve flow
- **Spyros** create pull request into master, notify Teo to review, accept
---

 ## <span style="color:#0080FF">Contributors</span>
 - Spyros Sakellariadis, Program Manager, Industry Innovation, Enterprise Commercial Business
 - David Apolinar, Cloud Solution Architect, US Financial Services Industry
 - John Lian, Program Manager, Azure IoT Platform

## <span style="color:#0080FF">Major elements shown in end-to-end sample</span>
This sample does not include all possible services or configurations, of course, it includes only a few services in order to demonstrate the basic structures and principles. The components that will be described include:

1. **Site-to-site VPN** - an IPsec tunnel between on-premises systems and Azure
2. **Azure IoT Hub** and **Event Hub** - disabling public IP access to these services
3. **Azure VM** - configuring a typical Azure asset with only private IP access
4. **DNS** - name resolution for assets with no public IP access

## <span style="color:#0080FF">High level architecture</span>
The IoT sample described consists of some on-premises components as well as Azure services. To provde a visual reference for the items discussed, here are the high level architectures.

### <span style="color:#0080FF">On-premises configuration</span><a name="OnPremDiagram"></a>
The following diagram shows the elements in the sample's local environment.

<img src="images/On-premises_config.jpg" width="600"/><p>

As shown in the diagram above, a 3rd party gateway is installed on a computer which serves to pull telemetry from IoT devices and forwards the data to Azure IoT Hub. Guidance on how to set up one such gateway, [ICONICS IoTWorX](https://iconics.com/Products/IoTWorX), is available in the following locations and there is no need to replicate it here:

- [Using IoTWorX as a Gateway](https://iconics.com/Documents/WhitePapers/Using-IoTWorX-as-a-Gateway) 
- [Installing IoTWorX on IoT Edge](https://iconics.com/Documents/Whitepapers/Installing-IoTWorX-on-IoT-Edge)

The output from the gateway should be in a standard JSON format. In the sample shown, data from the gateway looks like this:<a name="DeviceTelemetry"></a>

```
{"gwy": "iotworx","name": "Output_Voltage","value": 0,"timestamp": "2020-10-20T13:48:55.247Z","status": true}
{"gwy": "iotworx","name": "DC_Bus_Voltage","value": 320.5,"timestamp": "2020-10-20T13:48:55.247Z","status": true}
{"gwy": "iotworx","name": "Capacitance_Temperature","value": 47.1,"timestamp": "2020-10-20T13:48:55.247Z","status": true}
{"gwy": "iotworx","name": "Drive_Run_or_Halt","value": 2,"timestamp": "2020-10-20T13:48:55.248Z","status": true}
```

In addition, a hardware firewall is installed in the local environment, which serves as the local endpoint of the site-to-site VPN to Azure. Configuration of 
the firewall depends upon the make and model of the firewall, of which there are many. Some sample configurations can be found here:

- [Azure VPN Gateways VPN device configuration samples](https://github.com/Azure/Azure-vpn-config-samples)
- [Creating a Site-to-Site VPN from a Barracuda firewall to Azure](https://github.com/spyrossak/Azure-vpn-config-samples/blob/master/Barracuda/barracuda.md)

Finally, there is a DNS server in the local environment. Configuration of this server is described later in this document.

### <span style="color:#0080FF">Azure configuration</span><a name="AzureDiagram"></a>
The following diagram shows the elements in the sample's Azure environment. 

<img src="images/Azure_config.jpg" width="600"/><p>

Each of these elements is described in the following sections.

## <span style="color:#0080FF">Setting up the site-to-site VPN</span>
The following diagram shows the elements in the sample Azure environment needed to create an IPsec site-to-site Virtual Private Network. 

<img src="images/Site-to-site-VPN.jpg" width="450"/><p>


A 'How-to Guide' for creating a site-to-site VPN is published on the Microsoft website here: [Create a Site-to-Site connection in the Azure portal](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-site-to-site-resource-manager-portal)

Configuration of these elements in the end-to-end sample is shown below. 


### <span style="color:#0080FF">Virtual network in Azure</span>
From the Azure portal, start the process of creating a virtual network by selecting **Create a Resource** > **Virtual network**. During setup, accept the proposed private IP address range, for example 10.2.0.0/16. When deployment is complete, select the resource. The result should look similar to the following, with the exception of the DNS server, which will be added later:

<img src="images/Virtual_Network.jpg" width="800"/><p>

### <span style="color:#0080FF">Virtual network gateway</span>
From the Azure portal, select **Create a Resource** > **Virtual network gateway**. Select the Virtual Network just created, and accept the proposed public IP address. The result should look similar to this:

<img src="images/Virtual_Network_Gateway.jpg" width="800"/><p>

### <span style="color:#0080FF">Local network gateway</span>
From the Azure portal, select **Create a Resource** > **Local network gateway**. This object represents the device on-premises that is the local endpoint for the IPsec tunnel. The IP address of the Local network gateway needs to be the public IP of that device, for example, the public IP address of the firewall or router on the WAN port provided by the ISP providing connectivity to the local site. (Here shown as 24.x.x.x). The Address space needs to be the address space of the local network behind that firewall or router. Configuration in the end-to-end sample is as follows:

<img src="images/Local_Network_Gateway.jpg" width="800"/><p>

### <span style="color:#0080FF">Connection</span>
From the Azure portal, select **Create a Resource** > **Connection**. The purpose is to create an object that represents the connection between the Virtual Network Gateway and the Local Network Gateway. Pick the local and Azure network gateways created above during setup of the connection. The IP addresses will be added automatically. Configuration in the end-to-end sample is as follows: 

<img src="images/Connection.jpg" width="800"/><p>

### <span style="color:#0080FF">Peering</span>
Finally, in the end-to-end sample we created a second vnet in another Azure region, in order to emulate more complex environments where all of the assets are not in the same region. Having done this, all we need to do is create a vnet peering. From the vnet resource page, configure the peering between the two vnets in the Peerings section:

<img src="images/ADLSvnetPeering.jpg" width="800"/><p>

## <span style="color:#0080FF">Deploying an IoT Hub</span><a name="IoTHub"></a>
The on-premises gateway will push telemetry data to the Azure IoT Hub, and all Azure services and applications will use that IoT Hub as the source of data from the on-premises devices. The following elements need to be created in Azure for the sample configuration:

<img src="images/IoTHub.jpg" width="450"/><p>

A 'How-to Guide' for configuring IoT Hub in a vnet is published on the Microsoft website here: [IoT Hub support for virtual networks with Private Link and Managed Identity](https://docs.microsoft.com/en-us/azure/iot-hub/virtual-network-support)

Configuration of these elements in the end-to-end sample  is shown below. From the Azure portal, select **Create a Resource** > **IoT Hub**. When deployment is complete, select the resource. The Overview should be similar to the following:

### <span style="color:#0080FF">Overview</span>
<img src="images/IoTHubOverview.jpg" width="800"/><p>

### <span style="color:#0080FF">Public access</span>
In the How-to Guide referenced above it says the folloiwng:

The built-in Event Hub compatible endpoint doesn't support access over private endpoint. When configured, an IoT hub's private endpoint is for ingress connectivity only. Consuming data from built-in Event Hub compatible endpoint can only be done over the public internet.

IoT Hub's IP filter also doesn't control public access to the built-in endpoint. To completely block public network access to your IoT hub, you must

1. Configure private endpoint access for IoT Hub
2. Turn off public network access or use IP filter to block all IP
3. Stop using the built-in Event Hub endpoint by setting up routing to not send data to it
4. Turn off the fallback route
5. Configure egress to other Azure resources using trusted Microsoft service

The first step is to disable public IP access to the IoT Hub, which is done in in the Networking section:

<img src="images/IoTHubPublicAccess.jpg" width="800"/><p>

### <span style="color:#0080FF">Private endpoints</span>
Next, create private IP endpoints for this hub. Select the **Private endpoint connections** tab:

<img src="images/IoTHubPrivateEndpoints.jpg" width="800"/><p>

Click **+ Private endpoint** to create the private endpoint. The result should look similar to this:

<img src="images/IoTHubPrivateEndpoint.jpg" width="800"/><p>

## <span style="color:#0080FF">Event Hub</span><a name="EventHub"></a>
Next, set up another Azure resource, an Event Hub, and route all messages from the IoT Hub to it. Create an Event Hub. From the Azure portal, select **Create a Resource** > **Event Hub**. When deployment is complete, configuration should be similar to this: 

### <span style="color:#0080FF">Overview</span>
<img src="images/EventHubNamespace.jpg" width="800"/><p>

### <span style="color:#0080FF">Event Hub Networking</span>
Disable public access by choosing **Allow access from selected networks**, selecting your virtual network, and checking the radio button to **Allow trusted Microsoft services to bypass this firewall**. Also add your client (e.g. laptop) IP address in the firewall section, or you will not be able to access the Event Hub to manage it.

<img src="images/EventHubNetworking.jpg" width="800"/><p>

### <span style="color:#0080FF">Event Hub Private Endpoints</span>
Create a private endpoint for the Event Hub by clicking **+ Private endpoint**:

<img src="images/EventHubPrivateEndpoints.jpg" width="800"/><p>

### <span style="color:#0080FF">Event Hub Shared Access Policies</span>
Next, select **Shared access policies** and click **+ Add** to create a policy for the routing from IoT Hub. Make sure to select both **Listen** and **Send** rights:

<img src="images/EventHubsInstanceSharedAccessPolicies.jpg" width="1000"/><p>

### <span style="color:#0080FF">Event Hub Access Control</span>

 As stated in the How-to Guide referenced above, to allow other services to find your IoT hub as a trusted Microsoft service, it must have a system-assigned managed identity: "To allow the routing functionality to access an event hubs resource while firewall restrictions are in place, your IoT Hub needs to have a managed identity." First, on the Event Hub: 

Select **Access control (IAM)** and **Add**. Select **Add a role assignment** from the drop-down menu. In the Add role assignment pane, choose **Event Hubs Data Sender** for role, **Azure AD user, group, or service principal** for Assign access to, and  your IoT Hub's resource name ('IoTHubforVPNTesting') in the next drop-down list. 

<img src="images/EventHubAccessControl.jpg" width="1000"/><p>

## <span style="color:#0080FF">IoT Hub Message Routing</span>
On your IoT Hub's resource page, navigate to the Identity tab. In the **Status** section, select **On**:

<img src="images/IoTHubIdentity.jpg" width="800"/><p>

Under **Permissions**, click **Azure role assignments** and confirm that **Azure Events Hub Data Sender** had been added by the Event Hub configuration steps:

<img src="images/IoTHubRoleAssignments.jpg" width="800"/><p>

Finally, navigate to Message routing tab and forward all telemetry coming in to the IoT Hub to the Event Hub, using the IoT Hub Message routing feature:

<img src="images/IoTHubMessageRouting.jpg" width="800"/><p>

Routing details in the sample are set so as to forward everything to the Event Hub by setting **Routing query** to **true**, with a consequence that no data can be retrieved from the IoT Hub itself by any application. 

<img src="images/IoTHubMessageRoutingDetail.jpg" width="800"/><p>

Test the routing by opening Visual Studio Code on your laptop. Install the [Azure Event Hub Explorer](https://marketplace.visualstudio.com/items?itemName=Summer.azure-event-hub-explorer). Right-click in a Terminal window, select **Select an Event Hub**, and pick your subscription, resource group, and finally Event Hub name. Then right-click in the Terminal window and select **Start Monitoring Event Hub Message** to see the data being received in the Event Hub:

<img src="images/EventHubTelemetryReceived.jpg" width="800"/><p>

## <span style="color:#0080FF">Azure virtual machine</span><a name="AzureVM"></a>

The sample contains an Azure virtual machine simply as an example of setting up something in Azure that is accessible only through private addresses and as a way to show how to access other services that have only private addresses.

Guidance for creating an Azure virtual machine is published on the Microsoft website here: [Quickstart: Create a Windows virtual machine in the Azure portal](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/quick-create-portal).

Configuration of the virtual machine in the end-to-end sample is shown below. From the Azure portal, select **Create a Resource** > **Windows Server 2019 Datacenter**. During setup enter selections so that it is deployed in the virtual network with only private IP access. (For the sample we named the virtual machine `ICONICSinVNET` because in a subsequent article we will deploy the [ICONICS GENESIS64](https://iconics.com/Products/GENESIS64) software in the virtual machine to analyze the IoT data and forward telemetry to an Azure Data Lake, but that is out of scope for the current sample.)  When deployment is complete, the configuration should be similar to the following:


<img src="images/VMOverview.jpg" width="800"/><p>

Disable public IP address access and configure the network interfaces:

<img src="images/VMNetworking.jpg" width="800"/><p>
<img src="images/VMIPconfigurations.jpg" width="800"/><p>


To verify that data arriving at the Event Hub is visible within the virtual machine, you can use Visual Studio code with the [Azure Event Hub Explorer](https://marketplace.visualstudio.com/items?itemName=Summer.azure-event-hub-explorer) installed. After launching Visual Studio code and selecting the Event Hub above, right click and select **Start Monitoring**. You should see the data that is arriving at the Event Hub from inside the VM:

<img src="images/EventHubTelemetryReceivedinVM.jpg" width="800"/><p>

This should be the same as the data coming out of the local gateway, shown in the [local gateway configuration](#DeviceTelemetry) section above.

## <span style="color:#0080FF">Deploying DNS servers</span><a name="DNS"></a>

DNS servers are needed to resolve URLs for services in Azure. When those services are initially deployed, they are accessed using a URL that resolves to their public IP address. For example, [http://mydemovm.eastus.cloudapp.azure.com](http://mydemovm.eastus.cloudapp.azure.com) may resolve to `40.x.x.x`. However, since we are preventing access to any public IP address and using only private endpoints, applications would have to resolve to the private IP address. For example, it should resolve to `10.2.0.x` instead of `40.x.x.x`.

To do this, two DNS conditional forwarders are created. Locally, to resolve requests from on-premises devices to Azure services, and in Azure, to resolve requests from one Azure service to another. 


### <span style="color:#0080FF">Azure</span>
A virtual machine, `DNSforVNET`, is the deployed in the sample in the same manner as `ICONICSinVNET`, in the virtual network and configured to have only private IP access:

<img src="images/DNS-Azure.jpg" width="450"/><p>

In the sample, the DNS server got an IP address of `10.2.0.6`. In that virtual machine, the DNS Service is turned on and conditional forwarding records created for the Azure private domains used by the sample's assets. These conditional forwarders pass resolution requests to the standard Azure DNS service at `168.63.129.16`:

<img src="images/DNS-Azure-DNSManagerCF1.jpg" width="800"/><p>

Next, the network configuration of the Azure VM created [above](#AzureVM) (`ICONICSinVNET`), and shown in the [Azure configuration diagram](#AzureDiagram), is edited to use the new Azure DNS server (`DNSforVNET`) at `10.2.0.6`:

```
   IPv4 Address. . . . . . . . . . . : 10.2.0.5(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.2.0.1
   DNS Servers . . . . . . . . . . . : 10.2.0.6
```

When we used Visual Studio Code in the application virtual machine to connect to the [Event Hub](#EventHub) `eventhubinvpn`, the DNS server running in `DNSforVNST` forwarded the request to resolve the name to the DNS service at `168.63.129.16`, which in turn resolved this as the address `10.2.0.8`, the private IP address of the Event Hub.

### <span style="color:#0080FF">On-premises</span>
In the on-premises network, the DNS service is configured on any computer, for example one at `192.168.1.8`. In the DNS running on `192.168.1.8` two conditional forwarding records are added for the Azure assets behind private IP addresses:

<img src="images/DNS-Local-DNSManagerCF1.jpg" width="800"/><p>

Next, the IP configuration of the gateway computer, shown in the [On-premises configuration diagram](#OnPremDiagram), is modified to use this new DNS server:

```
   IPv4 Address. . . . . . . . . . . : 192.168.1.122
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.168.1.8
```   

When the local gateway software connects to `HostName=IoTHubForVPNTesting.azure-devices.net;DeviceId=iotworx;SharedAccessKey=******`, the local DNS server forwards the request to resolve the name `IoTHubForVPNTesting.azure-devices.net` to `10.2.0.6`, the DNS server we created in Azure. In turn, that DNS server forwards the request to `168.63.129.16`, which in turn resolves this as `10.2.0,4`, the private IP address of the [IoT Hub](#IoTHub), (as shown in the [Azure configuration diagram](#AzureDiagram)).










