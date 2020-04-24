# Forklift Detection Demo

## Azure Resource Deployment

For a quicker setup, you can use an ARM file to deploy all the required resources in the solution.

### Create Resource Group

1. Setup your Azure subscription if you don't have one already. You can setup an account [HERE](https://azure.microsoft.com/en-us/free/).
1. Create a new **Resource Group** in the Azure Portal:

    * Login to the [Azure portal](https://portal.azure.com/).
    * Click the **Create a resource** button in the portal.
    * Enter the text `Resource group` in the search input field and select the displayed option.
    * Click the **Create** button in the new page.
    * Enter the required information:

        * Select the **Subscription**.
        * Enter the **Resource group** name.
        * Select the **Region** where to setup the Resource Group. _Keep in mind that all resources will be deployed to this region so make sure it supports all of the required services. The template has been confirmed to work in West US 2._

    * Click the **Review + Create** button at the bottom of the page.
    * Click **Create** to finish the creation of the Resource Group.

### Deployment of resources

Follow the steps to deploy the required Azure resources:

1. In the [Azure portal](https://portal.azure.com/) select the **Resource Group** you created in the previous step.
1. Click the **+ Add** button or **Create resources**.
1. Enter the text **Template deployment** in the search input field and select the display option.
1. Click the **Create** button.
1. Click the **Build your own template in the editor** link.
1. Click the **Load file** button, search and select the `arm-template.json` file inside the `deployment` folder and click **Open**.
1. Click the **Save** button at the left-bottom corner.
1. Select the **Location** where to run the deployment.
1. Review and update if required all the **SETTINGS**:

    * `Prefix`: This value will be added to the resource names.
    * `Administrator Login`: Username account for the SQL Server (default: theadmin).
    * `Administrator Login Password`: Password for the administrator account of the SQL Server (default: M1cro$oft2020).

1. Read and accept the **TERMS AND CONDITIONS** by checking the box.
1. Click the **Purchase** button and wait for the deployment to finish.
1. Review the output values:

    * Go to your **Resource group** and click **Deployments** from the left navigation.
    * Click **Microsoft.Template**
    * Click **Outputs** from the left navigation.
    * Save values for future use.

    > IMPORTANT: You will need these values later in the setup.

    > NOTE: Connection to the SQL server is allowed from all IP Addresses by default. To update this rule, follow the instructions in the **Optional Steps** section.

## Post deploy configuration

Some resources require some extra configuration.

#### SQL Database schema

Here we will run the script for the creation of the tables required by the solution.

1. In the [Azure portal](https://portal.azure.com/) select the **Resource Group** you created earlier.
1. Select the **SQL database** resource.
1. Click the **Query Editor** option in the menu.
1. Enter the username and password that you used as parameters during deployment and click the **Connect** button.
1. Copy the following script to the Query area:
    ```sql
    CREATE TABLE alerts (
        IncidentId UNIQUEIDENTIFIER DEFAULT NEWID(),
        DeviceId NVARCHAR(50) NOT NULL,
        IncidentType NVARCHAR(50) NOT NULL,
        Status NVARCHAR(50) NOT NULL,
        BlobUrl NVARCHAR(255) NOT NULL,
        AlertNotified BIT DEFAULT 0,
        ReportedTime DATETIME NOT NULL,
        LastUpdated DATETIME
    )
    ```
1. Click the **Run** button.
1. You should be able to see the created table in the database.
1. Now replace the content of the Query area with the following code:

    ```sql
    CREATE PROCEDURE [dbo].[spFetchUpdateAlerts]
        @NewAlertsCount integer = NULL OUTPUT,
        @BlobUrl nvarchar(255) = NULL OUTPUT
    AS
    BEGIN
        SET NOCOUNT ON

        SET @NewAlertsCount =
        (
        SELECT COUNT(*)
        FROM dbo.alerts
        WHERE alerts.AlertNotified = 0 AND UPPER(alerts.Status) = 'UNRESOLVED'
        );

        IF (@NewAlertsCount = 0)
        BEGIN
        SET @BlobUrl = ''
        END
        ELSE
        BEGIN
        SET @BlobUrl = (
            SELECT BlobUrl
            FROM dbo.alerts
            WHERE alerts.AlertNotified = 0 AND UPPER(alerts.Status) = 'UNRESOLVED'
        );
        END

        DECLARE @MyTableVar table (
        [IncidentId] [uniqueidentifier] NULL,
        [DeviceId] [nvarchar](50) NOT NULL,
        [IncidentType] [nvarchar](50) NOT NULL,
        [Status] [nvarchar](50) NOT NULL,
        [BlobUrl] [nvarchar](255) NOT NULL,
        [AlertNotified] [bit] NULL,
        [ReportedTime] [datetime] NOT NULL,
        [LastUpdated] [datetime] NULL);

        UPDATE alerts
        SET alerts.AlertNotified = 1
        OUTPUT INSERTED.*
        INTO @MyTableVar
        WHERE alerts.AlertNotified = 0 AND UPPER(alerts.Status) = 'UNRESOLVED'
        SELECT *
        FROM @MyTableVar;
    END
    ```

1. Click the **Run** button.

## Edge Stream Analytics Job

Follow the next steps to setup the stream job.

1. In the [Azure portal](https://portal.azure.com/) select the **Resource Group** you created earlier.
1. Select the **Stream Analytics Job** resource with the name ending with **EdgeStreamJob**.
1. Click **Storage account settings** from the left navigation.
1. Click **Add storage account**.
1. Select the storage account created in the ARM setup and add a new container named `edgemodules`.
1. Click **Save** and confirm.
1. Select **Publish** from the left navigation.
1. Click **Publish** and confirm;
1. Wait for the operation to complete.
1. Save the **SAS URL** as you will need this later in the device deployment.

## Deployment Manifest Setup

### Setup Visual Studio Code Development Environment

1. Install [Visual Studio Code](https://code.visualstudio.com/Download) (VS Code).
1. Install 64 bit [Anaconda with Python version 3.7](https://www.anaconda.com/distribution).
1. Install [Docker Community Edition (CE)](https://docs.docker.com/install/#supported-platforms). Don't sign in to Docker Desktop after Docker CE is installed.
1. Install the following extensions for VS Code:
    * [Azure Machine Learning](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.vscode-ai) ([Azure Account](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account) and the [Microsoft Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) will be automatically installed)
    * [Azure IoT Hub Toolkit](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-toolkit)
    * [Azure IoT Edge](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-edge)
    * [Docker Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
1. Restart VS Code.
1. Select **[View > Command Palette…]** to open the command palette box, then enter **[Python: Select Interpreter]** command in the command palette box to select your Python interpreter.
1. Enter **[Azure: Sign In]** command in the command palette box to sign in Azure account and select your subscription.

### Container Registry Setup

1. Launch Visual Studio Code, and open the `$/device` folder.
1. Update the .env file with the values for your container registry.
    - In the [Azure portal](https://portal.azure.com/) select the **Resource Group** you created earlier.
    - Select the **Container Registry** resource.
    - Select **Access Keys** from the left navigation.
    - Update the following in `device/.env` with the following values from the **Access Keys** within the Container Registry:

        CONTAINER_REGISTRY_ADDRESS=`<Login Server>` (Ensure this is the login server and NOT the Registry Name)

        CONTAINER_REGISTRY_USERNAME=`<Username>`

        CONTAINER_REGISTRY_PASSWORD=`<Password>`

    - Save the file.
1. Sign in to your Azure Container Registry by entering the following command in the **Visual Studio Code integrated terminal** (replace <CONTAINER_REGISTRY_ADDRESS>, <CONTAINER_REGISTRY_USERNAME>, and <CONTAINER_REGISTRY_PASSWORD> with your container registry values set in the .env file).

    `docker login -u <CONTAINER_REGISTRY_USERNAME> -p <CONTAINER_REGISTRY_PASSWORD> <CONTAINER_REGISTRY_ADDRESS>`

    > IMPORTANT: If you would llke to deploy your own model please refer to the **Custom Vision Project Setup** section in the **Optional Steps** section later in this document. You will need to increment the version number in the tag property of `device/modules/ImageClassifierService/module.json` if you wish to push another model after the initial one.

### Update Deployment Template

1. Open `device/deployment.test-amd64.template.json`.
1. Update the following desired properties for the **EdgeStreamJob** module with the value you got from Edge Stream Analytics Job earlier.
    ```json
    "ASAJobInfo": "<ASA Blob URL>"
    ```
1. Next we need to update the Camera Capture module desired properties. In the [Azure portal](https://portal.azure.com/), select the **Resource Group** you created earlier.
1. Select the **Storage Account** resource with the name ending with `storage`.
1. Go to **Access Keys** in the left pane.
1. Copy the **Storage account name** and **Key** value from the output.
    - Alternatively, you can generate a SAS for the container.
    - Click on **Storage Explorer (preview)** from the left pane.
    - Expand **BLOB CONTAINERS** and right-click on **forkliftimages** and select **Get Shared Access Signature**.
    - Ensure **Create** and **Write** are selected from the permissions.
    - Obtain the key.
    > NOTE: Either key will be fine for the next step. Creating a SAS key gives you more granular control over permissions to the container.

1. Update the following **desired properties** for the `CameraCapture` module.
    ```json
    "VideoPath": "rtsp://admin:@<camera_IP>//h264Preview_01_main",
    "StorageAccountName" : "<Storage account name from previous step>",
    "StorageAccountKey" : "<Key from previous step>"
    ```

    > NOTE: the video path with be specific to the camera in use. Check the manufacturer's documentation for more details.
1. Save the file.

### Deploy solution to the Container Registry

1. Right click on `device/deployment.test-amd64.template.json`.
1. Select **Build and Push IoT Edge Solution**.
1. Wait for the process to complete.
1. Go to `device/config` and save `deployment.test-amd64.json` as you will need this for the IoT Central setup later.

## IoT Central Setup

Creating a new IoT Central environment is outside the scope of this document. Learn more about getting started [here](https://azure.microsoft.com/en-us/services/iot-central/).

Once your environment is created, complete the following steps to configure it for the demo.

### Create Device Template

1. [Sign in](https://apps.azureiotcentral.com/myapps) to your IoT Central environment.
1. Click **+ New**.
1. Click **Azure IoT Edge**.
1. Click **Next: Customize**.
1. Click **Browse**.
1. Upload the `device/config/deployment.test-amd64.json` file.
1. Click **Next: Review**.
1. Click **Create**.

### Customize Device Template

1. Click on **Module ImageClassifierService**.
1. Click **Delete** (and then **Delete** again).
    > NOTE: this module doesn't have any properties or telemetry so is considered invalid during publishing.
1. Under **Module EdgeStreamJob**, click **Manage**.
1. Using **+ Add capability**, add the following items. Each is of capability type **Telemetry**:
    * Display Name: `message_type`, schema: `String`
    * Display Name: `event_type`, schema: `String`
    * Display Name: `timestamp`, schema: `DateTime`
    * Display Name: `count`, schema: `Integer`
    * Display Name: `blob_url`, schema: `String`
    > NOTE: all other values can be left as their default.
1. Click **Save**.
1. Click **Views**.
1. Click **Visualizing the device**.
1. Check **count**.
1. Click **Add tile**.
1. Click **Save**.
1. Click **Publish** (and then **Publish** again).

### Rules

1. Click **Rules**.
1. Click **+ New**.
1. Select your new **Device Template** from the drop down.
1. Add the following conditions:
    * `message_type` Equals `alert`
    * `event_type` Does not equal `update`
    * `count` Is greater than or equal to `0`
    * `blob_url` Does not equal `http://`
1. Under **Action**, click **+ Webhook**.
1. Enter `Logic App` for the **Display name**.
1. Insert the **Device Alerts Logic App Endpoint** from the outputs of the ARM template.
1. Click **Save**.

### Devices

1. Click **Devices**.
1. Click **+ New**.
1. Optionally customize the device **ID** or **name**.
1. Click **Create**.
1. **Check the box** next to the newly created device.
1. Click **Migrate**.
1. Select your new **Device Template** from the list.
1. Click **Migrate**.
1. Click on your new **Device ID** (in the device list).
1. Click **Connect**.
1. **Copy** the following values:
    * ID scope
    * Device ID
    * Primary key
    > NOTE: these will be used to connect the device shortly using DPS.

## Device Setup

### Azure VM

The easiest option to create a device is to use the IoT Edge template available in Azure.

1. **Provision** a new VM using the [template](https://portal.azure.com/#create/microsoft_iot_edge.iot_edge_vm_ubuntuubuntu_1604_edgeruntimeonly). Consider the following when provisioning:
    * You can use the existing resource group you have created or create a new one.
    * Ensure port 22 is open (this is the default).
    * Select a machine type with at least two vCPU cores.
    * If you haven't used SSH before/recently, password-based auth might be an easier option.
1. Once provisioning is complete, open your preferred shell.
    > NOTE: ensure you have SSH installed. If you're not sure, you can always use the [Cloud Shell](https://shell.azure.com).
1. Run `ssh <your-username>@<your-machine-ip-address>`.
    > NOTE: your username will be the one you specified during provisioning and your machine IP address will be available from the Azure Portal (by viewing the VM you just created).
1. Once connected to the machine, run `sudo nano /etc/iotedge/config.yaml`.
1. Comment out the following section (i.e. add `#` before each line):
    ```yaml
    provisioning:
        source: "manual"
        device_connection_string: "<ADD DEVICE CONNECTION STRING HERE>"
    ```
1. Uncomment out the following section (i.e. remove `#` before each line):
    ```yaml
    provisioning:
        source: "dps"
        global_endpoint: "https://global.azure-devices-provisioning.net"
        scope_id: "{scope_id}"
        attestation:
          method: "symmetric_key"
          registration_id: "{registration_id}"
          symmetric_key: "{symmetric_key}"
    ```
1. Update `{scope_id}`, `{registration_id}`, and `{symmetric_key}` with the values you copied from the previous section.
    > NOTE: `scope_id` refers to ID scope, `registration_id` refers to the device ID, and the `symmetric_key` refers to the primary key.
1. Press `CTRL + X`, `Y`, and the `Enter` to save and quit.
1. Run `sudo systemctl restart iotedge`.

Learn more [here](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux#configure-the-security-daemon).

### Physical devices

If you would like to onboard an actual device, you can follow instructions here:

 - [Linux](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-linux)
 - [Windows](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-windows)
 - [Linux containers on Windows](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-install-iot-edge-windows-with-linux)  

## Power App Setup

In this section we will setup the power app that will receive the alerts connection with the SQL Server and calling the created store procedure.

### Setup the power app environment

1. Login to the [Power Apps](https://make.powerapps.com/) site.
1. Click the `Settings` icon on the right corner and click the `Admin center` option.
1. In the new window click the `Environments` option in the left menu.
1. Click + New in the upper right hand corner, make sure to select SQL Database
1. Select the environment that you will be using and click the `Settings` option in the top menu.
1. Click the `Product` option to show more options.
1. Click the `Features` option from the list.
1. Find the `Power Apps component framework for canvas apps` section.
1. Make sure that the `Allow publishing of canvas apps with code components` option is set to `On`.
1. Click the `Save` button after make any change.
1. Close the window and go back to the main site.

### Create the Connection to SQL

1. Click the **Data** option in the left menu.
1. Click the **Connections** sub option from the list.
1. Click the **+ New connection** button.
1. Click the **SQL Server** option.
1. Select the **SQL Server Authentication** option for the **Authentication Type**.
1. Enter the **SQL Server Name** and **Database name** from the outputs of the template deployment.
1. Click the **Create** button and wait for the connection to be created..

### Create the flow

1. Click the **Flows** option in the left menu.
1. Click the **+ New** option.
1. Select the **Create from template** option.
1. Select the **PowerApps button** option.
1. Select the **PowerApps** connector.
1. Click the **New step** button.
1. Search for the **SQL Server** option and find the **Execute store procedure (V2)** option.
1. Select the following options from the dropdown lists:
    * Server name
    * Database name
    * Procedure name
1. Add a new step and search for the **Response** action.
1. Select the **OutputParameters** from the stored procedure as the body.
1. Click the **Show advanced options** button.
1. Set the **Response Body JSON Schema** to:
    ```json
    {
      "type": "object",
      "properties": {
         "NewAlertsCount": {
             "type": "number"
         },
         "BlobUrl": {
             "type": "string"
         }
      },
      "required": [
         "NewAlertsCount",
         "BlobUrl"
      ]
    }
    ```
1. Click the **Save** button.
1. You can test your flow to make sure that is working as expected.

### Create the App

1. Click the **Apps** option in the menu.
1. Click the **Import canvas app** button on the top.
1. Click the **Upload** button and select the `.zip` file under the `deployment/powerapp/` folder.
1. Click the **Configure** button next to the **SQL Server Connection** resource.
1. Select the created connection and click the **Save** button.
1. Select the **Configure** button next to the **Flow** resource.
1. Select the created flow and click the **Save** button.
1. Click the **Import** button and wait for the app to be imported.
1. Open the App and allow the use of the SQL Server connection.

## Optional Steps

In this section we will describe some steps that are not required for the demo but allow for further customization if required.

### SQL Server IP rule update

Follow the next steps to update or remove the rule that allow the connection from all IP addresses.

1. In the [Azure portal](https://portal.azure.com/) select the **Resource Group** you created earlier.
1. Find the **SQL server** resource and click it to see the detail.
1. Click the **Firewalls and virtual networks** option in the menu on the left under the **Security** section.
1. Check the **AllowAllIps** rule.
1. If you want to remove click the **...** button next to the rule and click the **Delete** button.
1. If you want to update the rule, click and update the values of the **Start IP** and **End IP** columns of the rule with the values you want.
    > NOTE: For a single IP set both values with the required IP.
1. Click the **Save** button.

### Custom Vision Project Setup

In this section we will use the Custom Vision Project Generator App to create a Custom Vision project with all images and a trained iteration. This model is already provided in the solution, however, this will give you the flexibility to add more images if required.

> NOTE: You will require Visual Studio 2017 or later for this setup.

#### Console App Setup

1. Open Visual Studio.
1. From the top menu click the **File > Open > Project/Solution**.
1. Open `src\CustomVisionLoaderApp\CustomVisionLoaderApp.sln`.
1. Open the `App.Config` file and set the following settings values from ARM deployment output:
    * **Key**: Cognitive Services Account Key
    * **Endpoint**: Cognitive Services Account Endpoint
    * **ResourceId**: Cognitive Services Account Resource Id

#### Run app

1. In Visual Studio click the `Play` button and wait for the console app to start.
1. The app will go over all the required steps for the project generation using the information from the config file:
    * Load model from local file.
    * Create the project using the name in the config file.
    * Create the tags from the model.
    * Upload all the images one by one setting the tags.
    * Train the model.
    * Publish the iteration for the model to be ready for use.
    > NOTE: this process may take several minutes depending on your connection.
1. Following output should be display if all the setup is correct:
    ```
    ***********************************************************
    *             Custom Vision Project Setup                 *
    *                                                         *
    ***********************************************************
    *** Loading local custom vision model from: C:\...\src\CustomVisionLoaderApp\CustomVisionLoaderApp\Resources\cv_data_model.json ***
    Tags to create: 2
    Image to tag: 119
    ** Starting Setup of project **
        Creating new object detection project: <project name>
        Creating tags
        Reading and Uploading images
        Uploading image 1 of 94
        ...
        Uploading image 93 of 94
        Uploading image 94 of 94
        Images upload is done.
        Training
        Done training!
    ```

#### Export project model

After the project generation is finished we need to export the model from the portal.

1. Go to the [Custom Vision portal](https://www.customvision.ai/) and log in if you are not already.
1. Click the newly created project from the projects list.
1. Click the **Performance** option from the menu.
1. Click the **Iteration 1** if it's not selected (should be by default).
1. Click the **Export** button for the iteration.
1. Click the **TensorFlow** icon button in the list.
1. Click the **Export** button.
1. Click the **Download** button.
1. Save the `.zip` file and extract the contents.
1. Copy and paste `label.txt` and `model.pb` to the `device/modules/ImageClassifierService/app` folder.

> NOTE: If you have already deployed the provided model, you will need to increase the version value in `module.json` and create a new deployment to the device. These steps are outlined in the `Container Registry Setup` section.
