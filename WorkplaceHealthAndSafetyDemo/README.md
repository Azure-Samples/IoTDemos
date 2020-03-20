# Workplace Health and Safety Demo
## Overview
The Workplace Health and Safety Demo provides the ability to identify unsafe work conditions using AI on Edge and Location Analytics IoT architecture patterns.

The AI on Edge pattern utilizes the Vision AI DevKit which utilizes the Azure IoT Edge Runtime with a custom IoT Edge python module that runs the Vision AI model and an Azure Stream Analytics (ASA) edge module.  The Vision AI model has been trained to identify a hard hat and a safety vests.  The ASA edge module logic sends only those events where a worker is identified not wearing a hard hat or a vest.  The ASA module aggregates / buffers the data so not every frame generates an alert.

The Location Analytics pattern is implemented through Azure Maps geofencing capability. An Azure Web App has been developed to behave like a client that submits GPS information to Azure Maps. The Azure Web App is used to create the geofence and register a client that submits coordinates of the device that is used to register (via the web app).  Controls on the Web App can be used to simulate the client moving in and out of the Geofence.

## Demo Script
After deploying the demo, a sample demonstraction script can be found here (TBD).

## Architecture
![Architecture](https://github.com/Azure-Samples/IoTDemos/blob/master/WorkplaceHealthAndSafetyDemo/images/Workplace%20Safety%20Architecture.png)

## Troubleshooting
Troubleshooting information at the [end](https://github.com/Azure-Samples/IoTDemos/blob/master/WorkplaceHealthAndSafetyDemo/README.md#troubleshooting-1) of this document.

## Azure Resource Deployment

An Azure Resource Manager (ARM) template will be used to deploy all the required resources in the solution.  Click on the link below to start the deployment.<br>
<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure-Samples%2FIoTDemos%2Fmaster%2FWorkplaceHealthAndSafetyDemo%2Fdeployment%2Fazure%2Farm-template.json" target="_blank">
<img src="https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.png"/>
</a>

### Deployment of resources

Follow the steps to deploy the required Azure resources:
<b>BASICS</b>
- **Subscription**: Select the Subscription.
- **Resource group**:  Click on 'Create new' and provide a unique name for the Resource Group
- **Location**: Select the Region where to deploy the resources. Keep in mind that all resources will be deployed to this region so make sure it supports all of the required services. The template has been confirmed to work in West US 2.

<b>SETTINGS</b>
    - **Prefix**: This value will be added to the resource names.
    - **Administrator Login**: Username account for the SQL Server (default: theadmin).
    - **Administrator Login Password**: Password for the administrator account of the SQL Server (default: M1cro$oft2020).
    - **Notifications Email**: Email where to send notifications from the logic apps.

1. Read and accept the `TERMS AND CONDITIONS` by checking the box.
1. Click the `Purchase` button and wait for the deployment to finish.
1. Review the output values:
      - Go to your `Resource group` and click `Deployments` from the left navigation.
      - Click `Microsoft.Template`
      - Click `Outputs` from the left navigation.
      - Save values for future use.

>IMPORTANT: You will need these values later in the setup.

> NOTE: Connection to the SQL server is allowed from all IP Addresses by default. To update this rule, follow the instructions in the `Optional Steps` section.

### Post deploy configuration

Some resources require some extra configuration.

#### SQL Database schema

Here we will run the script for the creation of the tables required by the solution.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `SQL database` resource.
1. Click the `Query Editor` option in the menu.
1. Enter the username and password that you used as parameters during deployment and click the `Connect` button.
1. Copy the following script to the Query area:
  ```sql
  CREATE TABLE alerts (
      IncidentId UNIQUEIDENTIFIER DEFAULT NEWID(),
      DeviceId NVARCHAR(50) NOT NULL,
      IncidentType NVARCHAR(50) NOT NULL,
      Status NVARCHAR(50) NOT NULL,
      ReportedTime DATETIME NOT NULL,
      LastUpdated DATETIME
  );

  CREATE TABLE metrics (
      MetricId UNIQUEIDENTIFIER DEFAULT NEWID(),
      DeviceId NVARCHAR(50) NOT NULL,
      CurrentTime DATETIME NOT NULL,
      NumberOfMessages INT NOT NULL,
      PersonHardHatMin DECIMAL(2) NOT NULL,
      PersonHardHatMax DECIMAL(2) NOT NULL,
      PersonHardHatSum DECIMAL(2) NOT NULL,
      PersonHardHatAvg DECIMAL(2) NOT NULL,    
      PersonSafetyVestMin DECIMAL(2) NOT NULL,
      PersonSafetyVestMax DECIMAL(2) NOT NULL,
      PersonSafetyVestSum DECIMAL(2) NOT NULL,
      PersonSafetyVestAvg DECIMAL(2) NOT NULL,
      PersonNoPPEMin DECIMAL(2) NOT NULL,
      PersonNoPPEMax DECIMAL(2) NOT NULL,
      PersonNoPPESum DECIMAL(2) NOT NULL,
      PersonNoPPEAvg DECIMAL(2) NOT NULL
  );

  CREATE TABLE geofencealerts (
      AlertId UNIQUEIDENTIFIER DEFAULT NEWID(),
      DeviceId NVARCHAR(50) NOT NULL,
      AlertType NVARCHAR(50) NOT NULL,
      AlertTime DATETIME NOT NULL,
      NearestLat DECIMAL(10, 5) NOT NULL,
      NearestLon DECIMAL(10, 5) NOT NULL,
  );
  ```
1. Click the `Run` button.
1. You should be able to see the created tables in the database. 

#### Office365 connection authorization

Here we need to authorize the connection for the Office365 API resource with the account that will be used to send the alert notification emails via the Logic Apps.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `office365` API connection resource.
1. Click the `Edit API connection` option in the left menu.
1. Click the `Authorize` button to start the authorization process.
1. Follow the steps with the account you want to use.
1. When the process is finished, click the `Save` button.

#### Metrics Stream Analytics Job

Follow the next steps to setup the metrics stream job.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `Stream Analytics job` resource with the name ending with `metricscloud`.
1. Click the `Overview` option in the left menu.
1. Click the `Start` button to start the job.
1. Click the `Start` button in the right panel and wait for the job to start.

#### Edge Stream Analytics Job

Follow the next steps to setup the metrics stream job.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `Stream Analytics Job` resource with the name ending with `edgestreamanalytics`.
1. Click `Storage account settings` from the left navigation.
1. Click `Add storage account`.
1. Select the storage account created in the ARM setup and add a new container named `edgemodules`.
1. Click `Save`.
1. Select `Publish` from the left navigation.
1. Click `Publish` and wait for the operation to complete.
1. Save the `SAS URL` as you will need this later in the device deployment.


#### Azure Maps account

Here we will setup an event subscription for the Azure Maps account in order to notify the geofence events to our Logic App.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `Azure Maps Account` resource.
1. Click the `Events` option in the left menu.
1. Click the `+ Event Subscription` button in the top of the panel.
1. Enter `logicappalerts` to the `Name` input field.
1. Leave `Event Schema` as `Event Grid Schema` 
1. Uncheck the `Geofence Result` option in the `Filter to Event Types` dropdown. Ensure that only the following 2 events are selected:
    * Geofence Entered
    * Geofence Exited
1. For the `Endpoint Type` select the `Web Hook` option.
1. Click the `Select an endpoint` link.
1. In the new panel update the `Subscriber Endpoint` field with the value from the deployment output named `geofence Alerts Logic App Endpoint`.
1. Click the `Confirm Selection` button.
1. Click the `Create` button.

#### IoT Hub

Here we will setup the event for the IoT Hub that will send the data to the Logic App to handle the alerts.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `IoT Hub` resource.
1. Click the `Events` option in the left menu.
1. Click the `+ Event subscription` button in the top of the panel.
1. Enter the name `iothubalerts` to the `Name` input field.
1. Leave `Event Schema` as `Event Grid Schema` 
1. Ensure ONLY `Device Telemetry` is selected from the `Filter to Event Types` dropdown.
1. For the `Endpoint Type` select the `Web Hook` option.
1. Click the `Select an endpoint` link.
1. In the new panel update the `Subscriber Endpoint` field with the value from the deploy output `device Alerts Logic App Endpoint`.
1. Click the `Confirm Selection` button.
1. Click the `Create` button.

#### Time Series Insights event source

Follow the next steps to setup the event source for the Time Series Insights environment.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `Time Series Insights environment` resource.
1. Click the `Event Sources` option in the left menu.
1. Click the `+ Add` button on the top of the panel.
1. Set the following information:
    * Event source name: Set as `IoTEdgeTSEventSource`.
    * Source: Select `IoT Hub`.
    * IoT Hub name: `<name of your IoT Hub>`
    * Timestamp property name: `timestamp`.
1. Click the `Create` button.

#### Time Series Environment data access policies

Here we will set the data access policy to allow yourself to view data in the TSI environment

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `Time Series Insights environment` resource.
1. Select `Data Access Policies` in the left menu.
1. Click `+ Add` from the top of the panel.
1. Enter your username in the `Select user` section.
1. Select `Reader` and `Contributor` from the `Select role` section.
1. Click `Ok` to add the policy.

#### Time Series Environment model setup

Here we will setup the model defining the Types, Hierarchies and Instances.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `Time Series Insights environment` resource.
1. Click the `Go to Environment` button.
1. From the left navigation within the environment click the `Model` button.
1. Click the `Types` tab option.
    - Click the `Upload JSON` button.
    - Click the `Choose file` button and find the `types.json` file inside the `deployment\tsi` folder of the project.
    - Click the `Upload` button and wait for the type to be loaded in the list.
1. Click the `Hierarchies` tab option.
   - Click the `Upload JSON` button.
   - Click the `Choose file` button and find the `hierarchies.json` file inside the `deployment\tsi` folder of the project.
   - Click the `Upload` button and wait for the hierarchies list to be loaded.

> NOTE: Complete the following steps after you have connected your AI DevKit device later in the setup.

1. Select the `Time Series Insights environment` resource.
1. Click the `Go to Environment` button.
1. From the left navigation within the environment click the `Model` button.
1. Find your device and click `Edit` from the `Actions` menu.
1. From the `Properties` tab, select `Camera` from the `Type` dropdown.
1. From the `Instance fields` tab, select `Workplace Safety` as the Hierarchy.
1. Complete the `Instance fields` values.
1. Click `Save`. 

>IMPORTANT: If you would like to add additional mock devices, please refer to the `Time Series Environment data load` in the `Optional Steps` section.

## Vision AI DevKit Setup
In this section, we will set up your Vision AI Dev Kit to be connected to the demo environment.

> NOTE: We suggest before completing the following steps you update the firmware on your device using the following [instructions](https://azure.github.io/Vision-AI-DevKit-Pages/docs/Firmware/).

#### Setup a new Edge device
1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `IoT Hub` resource.
1. Click on `IoT Edge` from the left navigation.
1. Click `+ Add an IoT Edge Device`.
1. Enter a `Device ID` and leave all other fields as default.
1. Click `Save`.
1. Once the device has been created, select the device and copy the `Primary Connection String` for later in this setup.

#### Setup Visual Studio Code Development Environment
1. Install [Visual Studio Code](https://code.visualstudio.com/Download) (VS Code).
1. Install 64 bit [Anaconda with Python version 3.7](https://www.anaconda.com/distribution).
1. Install the following extensions for VS Code:
    * [Azure Machine Learning](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.vscode-ai) ([Azure Account](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account) and the [Microsoft Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) will be automatically installed)
    * [Azure IoT Hub Toolkit](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-toolkit)
    * [Azure IoT Edge](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-edge) 

1. Restart VS Code.
1. Select **[View > Command Palette…]** to open the command palette box, then enter **[Python: Select Interpreter]** command in the command palette box to select your Python interpreter.
1. Enter **[Azure: Sign In]** command in the command palette box to sign in Azure account and select your subscription.
1. Install [Docker Community Edition (CE)](https://docs.docker.com/install/#supported-platforms). Don't sign in to Docker Desktop after Docker CE is installed.

1. Install [Docker Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) to Visual Studio Code.
    - `code --install-extension ms-azuretools.vscode-docker`

#### Build and deploy container image to device
1. Launch Visual Studio Code, and select File > Open Workspace... command to open the `devkit\VisionModules.code-workspace`.
1. Update the .env file with the values for your container registry.
    - In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
    - Select the `Container Registry` resource.
    - Select `Access Keys` from the left navigation.
    - Update the following in `devkit/.env` with the following values from  `Access Keys` within the Container Registry: 
      
        REGISTRY_NAME=`<Login Server>` (Ensure this is the login server and NOT the Registry Name)

        REGISTRY_USER_NAME=`<Username>`

        REGISTRY_PASSWORD=`<Password>`

    - Update the following in `devkit/.env` with the following value you got earlier in the `Edge Stream Analytics Job` section
      
        ASA_BLOB_URL=`<ASA Blob URL>`

    - Save the file.
1. Sign in to your Azure Container Registry by entering the following command in the Visual Studio Code integrated terminal (replace <REGISTRY_USER_NAME>, <REGISTRY_PASSWORD>, and <REGISTRY_NAME> with your container registry values set in the .env file).
  
    `docker login -u <REGISTRY_USER_NAME> -p <REGISTRY_PASSWORD> <REGISTRY_NAME>`

    > IMPORTANT: If you would llke to deploy your own model please refer to the `Custom Vision project setup` section in the `Optional Steps` section later in this document. You will need to increment the version number in tag property of `AIVisionDevKitGetStartedModule\module.json`if you wish to push another model after the initial one. 
1. **IMPORTANT**: Ensure you have `arm32v7` selected as the architecture in the bottom navigation bar of VS Code. 
1. Right-click on `deployment.template.json` and select the `Build and Push IoT Edge Solution` command to generate a new `deployment.json` file in the config folder, build a module image, and push the image to the specified ACR repository
    > IMPORTANT: If you have amended code in your module, you will need to increment the version number in `module.json` so the new version will get deployed to the device in the next steps.
    
    > NOTE: Some red warnings "/usr/bin/find: '/proc/XXX': No such file or directory" and "debconf: delaying package configuration, since apt-utils is not installed" displayed during the building process can be ignored.
1. Ensure you have the correct Iot Hub selected in VS Code.
    - In the Azure IoT Hub extenstion, click `Select IoT Hub` from the hamburger menu.
    - Select your `Subscription`.
    - Select the `IoT Hub` you created earlier in the setup. 
1. Right-click `config\deployment.arm32v7.json` and select `Create Deployment for a Single Device`.
1. Select the device you created earlier. 
1. Wait for deployment to be completed.

#### Register Vision AI Devkit with the Azure Edge device
1. Follow the instuctions at outlined [Here](https://azure.github.io/Vision-AI-DevKit-Pages/docs/quick_start/).

    **IMPORTANT:**  Enter the `connection string` from the step `Setup a new Edge device` when prompted `Already have a connection string?`
.
1. Complete any remaining steps. 
1. Your device will be updated with all the modules setup in this section. 


## Workplace Health and Safety Demo Usage
#### Custom Vision Scenario
1. Ensure your Dev Kit has power and is turned on.
1. Create a PPE violation by removing a Safety Vest OR a Hard Hat.
    > NOTE: The demo will work with a single piece of PPE and not both at the same time. Therefore, use a safety vest OR a hard hat.
1. You will recieve an email notification regarding the violation.
1. Put back on your PPE equipment.
1. You will recieve and email notification regarding the violation has been resolved.
1. Log into your SQL enviroment to observe metrics and alerts.
1. Log into your TSI environment to observe device history.

#### Azure Maps Scenario
1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `App Service`resource.
1. Click browse to go the application on a desktop machine. Take note of the domain for the next step.
1. Open `<yourwebdomain>/register` on a mobile device.
    >  NOTE: You can use another web browser window if it is more convenient).
1. Enter your name and select `Submit`. 
1. In the web browser, you will see your location has been updated. 
1. Create a geofence using the `Set Geofence` button. Create this fence outside of where your user is situated.
1. Use the `Adjust position` controls in the register view to move your user into the geofence. 
1. You will get a toast notification and email regarding the unauthorized entry.
1. You can move your user outside the geofence to receive notifications that the user has left.
    > NOTE: The user will expire after 10 minutes of inactivity. 


## Optional Steps

In this section we will describe some steps that are not required for the demo but allow for further customization if required. 

### SQL Server IP rule update

Follow the next steps to update or remove the rule that allow the connection from all IP addresses.

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Find the `SQL server` resource and click it to see the detail.
1. Click the `Firewalls and virtual networks` option in the menu on the left under the `Security` section.
1. Check the `AllowAllIps` rule.
1. If you want to remove click the `...` button next to the rule and click the `Delete` button.
1. If you want to update the rule, click and update the values of the `Start IP` and `End IP` columns of the rule with the values you want.
  > Note: For a single IP set both values with the required IP.
1. Click the `Save` button.

### Custom Vision project setup

In this section we will use the Custom Vision Project Generator App to create a Custom Vision project with all images and a trained iteration. This model is already provided in the solution, however, this will give you the flexibility to add more images if required.

> NOTE: You will require Visual Studio 2017 or later for this setup.

#### Console App Setup

1. Open Visual Studio.
1. From the top menu click the `File | Open | Project/Solution`.
1. Open `customvision\CustomVisionLoaderApp\CustomVisionLoaderApp.sln`.
1. Open the `App.Config` file and set the following settings values from ARM deployment output:
    - **Key**: Cognitive Services Account Key
    - **Endpoint**: Cognitive Services Account Endpoint
    - **ResourceId**: Cognitive Services Account Resource Id

#### Run app

1. In Visual Studio click the `Play` button and wait for the console app to start.
2. The app will go over all the required steps for the project generation using the information from the config file:
    - Load model from local file.
    - Create the project using the name in the config file.
    - Create the tags from the model.
    - Upload all the images one by one setting the tags.
    - Train the model.
    - Publish the iteration for the model to be ready for use.

> Note: this process may take several minutes depending on your connection.

3. Following output should be display if all the setup is correct:

```console
***********************************************************
*             Custom Vision Project Setup                 *
*                                                         *
***********************************************************
*** Loading local custom vision model from: C:\...\customvision\CustomVisionLoaderApp\CustomVisionLoaderApp\Resources\cv_data_model.json ***
Tags to create: 2
Image to tag: 119
** Starting Setup of project **
  Creating new object detection project: <project name>
  Creating tags
  Reading and Uploading images
  Uploading image 1 of 119
  ...
  Uploading image 118 of 119
  Uploading image 119 of 119
  Images upload is done.
  Training
  Done training!
```

#### Adding additional images
If you would like to add more training data to better suit your environment. We recommend leveraging the `Camera Tagging Module` outlined [here](https://github.com/microsoft/vision-ai-developer-kit/tree/master/samples/official/camera-tagging).

#### Export project model

After the project generation is finished we need to export the model from the portal.

1. Go to the [Custom Vision portal](https://www.customvision.ai/) and log in if you are not already.
1. Click the new created project from the projects list.
1. Click the `Performance` option from the menu.
1. Click the `Iteration 1` if it's not selected (should be by default).
1. Click the `Export` button for the iteration.
1. Click the `Vision AI Dev Kit` icon button in the list.
1. Click the `Export` button.
1. Click the `Download` button.
1. Save the `.zip` file and extract the contents.
1. Copy and paste the contents of the file to `devkit\modules\AIVisionDevKitGetStartedModule\model`

> NOTE: If you have already deployed the provided model, you will need to increase the version value in `module.json` and create a new deployment to the device. These steps are outlined in the `AI DevKit Setup` section.


### Time Series Environment data load

In this section we will describe how to input some sample data into the Time Series Environment.

> NOTE: You will require Visual Studio 2017 or later for this setup.

#### Console App Setup

To run the app we will need the valid connection string to the IoTHub.

1. Open Visual Studio.
1. From the top menu click the `File | Open | Project/Solution`.
1. Open `tsi-data-generator\TSIDataGenerator.sln`.
1. Open the `App.Config` file and set the following value from the ARM deployment output:
    - **IoTHubConnectionString**: IoTHub Connection String

#### Run the application 
1. In Visual Studio click the `Play` button and wait for the console app to start.
2. The app will start the generation of the example data, a log with each message will be display in the console.
3. Wait until the process is finished.


#### Updating instances in the TSI environment

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `Time Series Insights environment` resource.
1. Click the `Go to Environment` button.
1. From the left navigation within the environment click the `Model` button.
1. Click the `Instances` tab option.
   - Click the `Upload JSON` button.
   - Click the `Choose file` button and find the `instances.json` file inside the `deployment/tsi` folder of the project.
   - Make sure to check the `Update only` box.
   - Click the `Upload` button and wait for the instances list to be loaded.

### Azure Maps Solution

If you would like to customize the Azure Maps solution, the source code is available under `azuremaps\src`.

To deploy your updated solution to the existing resource via Visual Studio, complete the following steps:

1. In the [Azure portal](https://portal.azure.com/) select the `Resource Group` you created earlier.
1. Select the `App Service` resource.
1. Select `Get Publish Profile` from the top navigation.
1. Open Visual Studio.
1. From the top menu click the `File | Open | Project/Solution`.
1. Open `azuremaps\src\AzureMapsDemo.sln`.
1. From the left navigation, right click on `AzureMapsDemo.Web` and click `Publish`.
1. Click `Import Profile` from the bottom left.
1. Select the publish profile you downloaded in the earlier step.
1. Wait for the deployment to be completed. 

# Troubleshooting
### Error when deploying ARM Template
We've seen issues with different subscription types: MSDN, AIRS, etc... not being able to deploy certain resources to certain regions.  We've found that deploying to East US works consistently.  If you have a deployment error, try deploying to East US.  The resources inherit their deployment region from the Resource Group location.

### No data appears from the Camera / AI DevKit
1. Reboot the camera. Instructions [Here](https://azure.github.io/Vision-AI-DevKit-Pages/docs/Reboot/)
2. Reset the camera by deploying the latest firmware.  Instructions are located  [Here](https://azure.github.io/Vision-AI-DevKit-Pages/docs/Recover_device/)
3. Look at the IoT Edge Logs for errors and submit an issue to this (IoT Demos) repo. Instructions  [Here](https://azure.github.io/Vision-AI-DevKit-Pages/docs/Review_logs/)
