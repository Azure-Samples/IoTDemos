-- Create table
CREATE TABLE alerts (
    IncidentId UNIQUEIDENTIFIER DEFAULT NEWID(),
    DeviceId NVARCHAR(50) NOT NULL,
    IncidentType NVARCHAR(50) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    BlobUrl NVARCHAR(255) NOT NULL,
    AlertNotified BIT DEFAULT 0,
    ReportedTime DATETIME NOT NULL,
    LastUpdated DATETIME
);

-- Create Store Procedure use by the PowerApp
CREATE PROCEDURE [dbo].[spFetchUpdateAlerts]
  @NewAlertsCount integer = NULL OUTPUT,
  @BlobUrl nvarchar(255) = NULL OUTPUT
AS
BEGIN
  -- SET NOCOUNT ON added to prevent extra result sets from
  -- interfering with SELECT statements.
  SET NOCOUNT ON

  SET @NewAlertsCount =
  (
  SELECT
    COUNT(*)
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
    SELECT
        BlobUrl
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
