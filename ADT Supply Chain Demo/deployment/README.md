## Logic App Setup

Azure Logic Apps is a cloud service that helps you automate workflows across apps and services. By connecting Logic Apps to the Azure Digital Twins APIs, you can create such automated flows around Azure Digital Twins and their data.

In this section we will describe how to setup the logic app that will keep updating the estimated arrival time for the shipments.

### App registration client secret generation

At this point the app registration must be created and configure with the right permissions to allow the communication with the DigitalTwins resources and we will only do the setup required by the custom logic app connector.

1. In azure portal navigate to the app registration created.
1. Click the **Certificates & secrets** option in the left menu.
1. At the **Client secrets** section click the **New client secret** button.
1. Enter the description for the client secret and the desired expiration option.
1. Click the **Add** button.
1. Verify that the client secret is visible on the **Certificates & secrets** page.
1. Take note of its value to use later (you can also copy it to the clipboard with the `Copy` icon).

### Configure connector

Azure Digital Twins does not currently have a certified (pre-built) connector for Logic Apps. Instead, the current process for using Logic Apps with Azure Digital Twins is to create a custom Logic Apps connector, using a custom Azure Digital Twins Swagger that has been modified to work with Logic Apps.

The connector resource will be created during the template deployment but we will need to do the configuration and authentication manually.

1. In azure portal navigate to the connector's overview page.
1. Click the **Edit** button.
1. In the edit page configure this information:
  * Custom connectors
    * API Endpoint: REST (leave default)
    * Import mode: OpenAPI file (leave default)
    * File: This will be a custom Swagger file. Hit Import, locate the file `digitaltwins.json` on your machine under the `deployment/logic-app` folder and hit Open.
  * General information
    * Icon: Upload an icon that you like
    * Icon background color: Enter hexadecimal code in the format '#xxxxxx' for your color.
    * Description: Fill whatever values you would like.
    * Scheme: HTTPS (leave default)
    * Host: The host name of your Azure Digital Twins instance. This value can be obtained from the overview page of the digital twins resource.
    * Base URL: / (leave default)
1. Click the **Security** button to continue.
1. Click the **Edit** button
1. Configure the information like:
  * Authentication type: OAuth 2.0
  * OAuth 2.0:
    * Identity provider: Azure Active Directory
    * Client ID: The Application (client) ID for your Azure AD app registration
    * Client secret: The Client secret you created for your Azure AD app registration
    * Login URL: `https://login.windows.net` (leave default)
    * Tenant ID: The Directory (tenant) ID for your Azure AD app registration
    * Resource URL: `0b07f429-9f4b-4714-9392-cc5e8e80c8b0`
    * Scope: `Directory.AccessAsUser.All`
    * Redirect URL: (leave default for now)
1. Note that the Redirect URL field says `Save the custom connector to generate the redirect URL`. Do this now by hitting Update connector across the top of the pane to confirm your connector settings.
1. Return to the Redirect URL field and copy the value that has been generated. You will use it in the next steps.
1. This is all the information that is required to create your connector (no need to continue past Security to the Definition step). You can close the Edit Logic Apps Custom Connector pane.

### Grant connector permissions in the Azure AD app

Next, use the custom connector's Redirect URL value you copied in the last step to grant the connector permissions in your Azure AD app registration.

1. Navigate to the App registrations page in azure portal and select your registration.
1. Click the `Authentication` option in the menu.
1. Under the `Web` and `Redirects URIs` click the **Add URI** button.
1. Enter the custom connector's Redirect URL into the new field, and hit the Save icon.
1. You are now done setting up a custom connector that can access the Azure Digital Twins APIs.

### Authorize the connector

The connector is now configured but we still need to authorize the connection.

1. Navigate to the resource group overview page in azure portal.
1. Find in the list **Api Connection** resource related with the connector in the list and click it.
1. Click the **Edit API connection** in the left menu.
1. Click the **Authorize** button and go over the authentication.
1. Click the **Save** button.
