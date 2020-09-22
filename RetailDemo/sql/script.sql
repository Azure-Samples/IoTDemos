/****** Object:  Table [dbo].[Products] ******/
CREATE TABLE Products (
  Code [uniqueidentifier] NOT NULL,
  Name [varchar](150) NULL,
  Price MONEY NOT NULL,
  Stock INT NOT NULL,
  Rating INT NOT NULL,
  PRIMARY KEY (Code)
);

/****** Object:  Table [dbo].[SupplierOrders] ******/
CREATE TABLE SupplierOrders (
  OrderId int IDENTITY(15525,1),
  CreatedDate DATETIME NOT NULL,
  DueDate DATETIME NOT NULL,
  Supplier  [varchar](150) NULL,
  ProductCode [uniqueidentifier] NOT NULL,
  Status INT NOT NULL,
  Total MONEY NOT NULL,
  PRIMARY KEY (OrderId),
  FOREIGN KEY (ProductCode) REFERENCES Products (Code) ON DELETE CASCADE
);

/****** Object:  Table [dbo].[CustomerOrders] ******/
CREATE TABLE CustomerOrders (
  OrderId int IDENTITY(26534,1),
  CreatedDate DATETIME NOT NULL,
  DeliveryDate DATETIME NOT NULL,
  CustomerId [uniqueidentifier] DEFAULT NEWID(),
  ProductCode [uniqueidentifier] NOT NULL,
  Quantity INT NOT NULL,
  PRIMARY KEY (OrderId),
  FOREIGN KEY (ProductCode) REFERENCES Products (Code) ON DELETE CASCADE
);

/****** Object:  Table [dbo].[alerts] ******/
CREATE TABLE Alerts (
    IncidentId UNIQUEIDENTIFIER DEFAULT NEWID(),
    DeviceId NVARCHAR(50) NOT NULL,
    IncidentType NVARCHAR(50) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    ReportedTime DATETIME NOT NULL,
    LastUpdated DATETIME
);

/****** Object:  Store Procedure [CreateSupplierOrder] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE CreateSupplierOrder
(
  @ProductCode uniqueidentifier,
  @Quantity int,
  @Total MONEY,
  @CreationDateStr varchar (150)
)
AS
BEGIN
  SET NOCOUNT ON

  declare @CreationDate datetime
  Select @CreationDate = convert(datetime, @CreationDateStr)

  UPDATE dbo.Products SET Stock = Stock + @Quantity WHERE Code = @ProductCode;

  INSERT INTO dbo.SupplierOrders (CreatedDate, DueDate, Supplier, ProductCode, Status, Total)
    VALUES (@CreationDate, DATEADD(day, 1, @CreationDate), 'Northwind Traders', @ProductCode, 1, @Total)
END
GO

/****** Object:  Store Procedure [ResetDemo] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE ResetDemo
AS
BEGIN
    SET NOCOUNT ON

    TRUNCATE TABLE Alerts;
    TRUNCATE TABLE CustomerOrders;
    TRUNCATE TABLE SupplierOrders;
    DELETE FROM Products;

    INSERT INTO [dbo].[Products] ([Code],[Name],[Price],[Stock],[Rating])
      VALUES ('E116E46B-DC84-4986-BAE2-17FE1DBB759E', 'Canned Beans', 2.50, 2, 5),
      ('9A79605B-132B-4089-AD8C-622B770CBB7A', 'White Truffles', 3.98, FLOOR(RAND()*(20-10+1))+11, 4),
      ('2ACA5DD3-C46F-4FD3-ACE2-FB307B4D1FCD', 'Veggie Dip Ranch', 3.57, FLOOR(RAND()*(20-10+1))+11, 3),
      ('2B6A3EAA-7622-4669-A7D5-81303B15D9DB', 'Fresh Blueberries', 2.37, FLOOR(RAND()*(20-10+1))+11, 4),
      ('F7FD0BD1-EFEF-4F45-876D-CE4BB349B0CC', 'Great Value 2% Reduced-Fat Milk', 2.42, FLOOR(RAND()*(20-10+1))+11,4),
      ('8249EFA3-B8F0-46A4-A259-FC83797EBD05', 'Great Value Large White Eggs', 2.04, FLOOR(RAND()*(20-10+1))+11, 5),
      ('26F09080-FF55-473E-8BD7-9CBFEE92B87B', 'Milk Chocolate Candy Bars', 3.50, FLOOR(RAND()*(20-10+1))+11, 5),
      ('20419EE1-6468-4498-BB55-F2869308F1A3', 'Green Seedless Grapes', 4.46, FLOOR(RAND()*(20-10+1))+11, 4),
      ('763C5B56-9CD2-47A3-8AE7-B82362C7849C', 'Tomato Ketchup, 32 oz Bottle', 2.78, FLOOR(RAND()*(20-10+1))+11, 5),
      ('3305FBF3-CCEC-4016-9EED-02664A1E7E78', 'Creamy Peanut Butter 40 oz', 2.26, FLOOR(RAND()*(20-10+1))+11, 4)

    declare @a datetime
    Select @a = convert(varchar(30),DATEADD(minute, -1 * FLOOR(RAND()*60)+1, DATEADD(day, -1 * (FLOOR(RAND()*10)+30), CURRENT_TIMESTAMP)), 120)
    EXEC CreateSupplierOrder 'E116E46B-DC84-4986-BAE2-17FE1DBB759E', 1, '2300.20', @a
    Select @a = convert(varchar(30),DATEADD(minute, -1 * FLOOR(RAND()*60)+1, DATEADD(day, -1 * (FLOOR(RAND()*10)+20), CURRENT_TIMESTAMP)), 120)
    EXEC CreateSupplierOrder 'E116E46B-DC84-4986-BAE2-17FE1DBB759E', 1, 1700.04, @a
    Select @a = convert(varchar(30),DATEADD(minute, -1 * FLOOR(RAND()*60)+1, DATEADD(day, -1 * (FLOOR(RAND()*10)+10), CURRENT_TIMESTAMP)), 120)
    EXEC CreateSupplierOrder 'E116E46B-DC84-4986-BAE2-17FE1DBB759E', 1, 58.21, @a
END
GO

/****** Initialize data ******/
EXEC [ResetDemo]
