# Develop and Deploy a New AIVisionDevKitGetStartedModule for Vision AI Developer Kit

This solution is used to build and deploy a new AIVisionDevKitGetStartedModule developed by QTI's python SDK to Vision AI Developer Kit.

## Setup Build Environment

1. Refer to the "Setup Visual Studio Code Development Environment" section in [VisionSample README.md](../../research/VisionSample/README.md) to setup a build environment.

1. Install [Docker Community Edition (CE)](https://docs.docker.com/install/#supported-platforms). Don't sign in to Docker Desktop after Docker CE is installed.

1. Install [Docker Extension](https://marketplace.visualstudio.com/items?itemName=PeterJausovec.vscode-docker) to Visual Studio Code.
    - `code --install-extension peterjausovec.vscode-docker`

## Develop a New AIVisionDevKitGetStartedModule

Refer to [modules/AIVisionDevKitGetStartedModule/python_iotcc_sdk/README.md](https://github.com/microsoft/vision-ai-developer-kit/tree/master/camera-sdk) to develop and test source code for a new AIVisionDevKitGetStartedModule.

## Build a Local Container Image for AIVisionDevKitGetStartedModule

1. Launch Visual Studio Code, and select **File > Open Folder...** command to open the IotEdgeSolution directory as workspace root.

1. Update the .env file with the values for your container registry. Refer to [Create a container registry](https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-python-module#create-a-container-registry) for more detail about ACR settings.

     ```bash
     REGISTRY_NAME=<YourAcrUri>
     REGISTRY_USER_NAME=<YourAcrUserName>
     REGISTRY_PASSWORD=<YourAcrPassword>
     ```

1. Sign in to your Azure Container Registry by entering the following command in the Visual Studio Code integrated terminal (replace <REGISTRY_USER_NAME>, <REGISTRY_PASSWORD>, and <REGISTRY_NAME> to your container registry values set in the .env file).
    - `docker login -u <REGISTRY_USER_NAME> -p <REGISTRY_PASSWORD> <REGISTRY_NAME>.azurecr.io`

1. The default AI model (DLC, labels.txt, and va-snpe-engine-library_config.json) for AIVisionDevKitGetStartedModule is located in  modules\AIVisionDevKitGetStartedModule\model folder. In case you want to use your own model, please change the files in that folder.

1. Open modules\AIVisionDevKitGetStartedModule\module.json and change the version setting in the tag property for creating a new version of the module image.

1. Right-click on deployment.template.json and select the **Build and Push IoT Edge Solution** command to generate a new deployment.json file in the config folder, build a module image, and push the image to the specified ACR repository.
    > Note: Some red warnings "/usr/bin/find: '/proc/XXX': No such file or directory" and "debconf: delaying package configuration, since apt-utils is not installed" displayed during the building process can be ignored.

1. Right-click on config/deployment.json, select **Create Deployment for Single Device**, and choose the targeted IoT Edge device to deploy the container image.

1. You'll find troubleshooting steps at <https://visionaidevkitsupport.azurewebsites.net/>.
