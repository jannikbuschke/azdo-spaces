/* Mandatory Parameters  */
@description('Tenant Id used for the Key Vault')
param tenantId string

@description('Name of the application')
param application string

@description('Short name of the customer, use "intl" for internal. 2 to 4 characters long')
param customer string

@description('Name of the environment, e.g. "dev"')
param env string

@description('Instance in the environment. Use single digit number, e.g. "1"')
param instance string = ''

@description('The admin user of the SQL Server')
param sqlAdministratorLogin string

@description('The password of the admin user of the SQL Server')
@secure()
param sqlAdministratorLoginPassword string

/* Optional Parameters  */
@description('Location for all resources.')
param location string = resourceGroup().location

@description('Location for Microsoft.Insights/components, Microsoft.Logic/workflows and Microsoft.Web/Connection resources.')
param secondaryLocation string = resourceGroup().location

@description('Override name of the storage account.')
param storageAccount_name string = 'st${customer}${application}${env}${instance}'

@description('Override name of the app service plan.')
param hostingPlan_name string = 'app-${customer}-${env}'

@description('Describes plan\'s pricing tier and instance size. Check details at https://azure.microsoft.com/en-us/pricing/details/app-service/')
@allowed([
  'F1'
  'D1'
  'B1'
  'B2'
  'B3'
  'S1'
  'S2'
  'S3'
  'P1'
  'P2'
  'P3'
  'P4'
])
param skuName string = 'S1'

@description('Describes plan\'s instance count')
@minValue(1)
param skuCapacity int = 1

@description('Override name of the app service.')
param appService_name string = 'app-${customer}-${application}-${env}${instance}'

@description('Override name of the SQL server.')
param sqlServer_name string = 'sql-${customer}-${application}-${env}${instance}'

@description('Override name of the PostgreSQL server.')
param postgresqlServer_name string = 'psql-${customer}-${application}-${env}${instance}'

@description('Override name of the PostgreSQL database.')
param postgresqlServer_database_name string = 'psql-db-${customer}-${application}-${env}${instance}'

@description('Override name of the SQL database.')
param sqlDatabase_name string = 'sqldb-${customer}-${application}-${env}${instance}'

@description('Override name of the key vault.')
param keyvault_name string = 'kv-${customer}-${application}-${env}${instance}'

@description('Override name of tapplication insights instance.')
param appInsights_name string = 'appi-${customer}-${env}${instance}'

/* trick bicep validity parsing for hardcoded urls for now  */
// var net = 'net'
// var authAudience = 'https://vault.azure.${net}'

resource postgresServer 'Microsoft.DBforPostgreSQL/servers@2017-12-01'={
  name: postgresqlServer_name
  location: location
  properties:{
    createMode: 'Default'
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorLoginPassword
  }
}

resource postgresqlDatabase 'Microsoft.DBforPostgreSQL/servers/databases@2017-12-01' = {
  name: postgresqlServer_database_name
  parent: postgresServer
}

resource sqlserver 'Microsoft.Sql/servers@2014-04-01' = {
  name: sqlServer_name
  location: location
  tags: {
    application: application
    environment: '${env}${instance}'
  }
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorLoginPassword
    version: '12.0'
  }
}

resource sql_database 'Microsoft.Sql/servers/databases@2014-04-01' = {
  parent: sqlserver
  name: sqlDatabase_name
  location: location
  tags: {
    application: application
    environment: '${env}${instance}'
    displayName: 'Database'
  }
  properties: {
    edition: 'Basic'
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: '1073741824'
    requestedServiceObjectiveName: 'Basic'
  }
}

resource sqlserver_AllowAllWindowsAzureIps 'Microsoft.Sql/servers/firewallrules@2014-04-01' = {
  parent: sqlserver
  name: 'AllowAllWindowsAzureIps'
  properties: {
    endIpAddress: '0.0.0.0'
    startIpAddress: '0.0.0.0'
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2020-12-01' = {
  name: hostingPlan_name
  location: location
  tags: {
    application: application
    environment: '${env}${instance}'
    displayName: 'HostingPlan'
  }
  sku: {
    name: skuName
    capacity: skuCapacity
  }
}

resource webSite 'Microsoft.Web/sites@2019-08-01' = {
  name: appService_name
  identity: {
    type: 'SystemAssigned'
  }
  location: location
  tags: {
    application: application
    environment: '${env}${instance}'
    'hidden-related:${hostingPlan.id}': 'empty'
    displayName: 'Website'
  }
  properties: {
    serverFarmId: hostingPlan.id
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsights_name
  location: secondaryLocation
  tags: {
    application: application
    environment: '${env}${instance}'
    'hidden-link:${webSite.id}': 'Resource'
    displayName: 'AppInsightsComponent'
  }
  kind: 'web'
  properties: {
    Application_Type: 'web'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource keyvault_resource 'Microsoft.KeyVault/vaults@2016-10-01' = {
  name: keyvault_name
  location: location
  tags: {
    application: application
    environment: '${env}${instance}'
  }
  dependsOn: [
    appInsights
  ]
  properties: {
    tenantId: tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: [
      {
        tenantId: webSite.identity.tenantId
        objectId: webSite.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: false
  }
}

resource keyvault_ConnectionString 'Microsoft.KeyVault/vaults/secrets@2021-06-01-preview' = {
  parent: keyvault_resource
  name: 'SqlServerConnectionString'
  properties: {
    contentType: 'text/plain'
    value: 'Data Source=tcp:${sqlserver.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabase_name};User Id=${sqlAdministratorLogin}@${sqlserver.properties.fullyQualifiedDomainName};Password=${sqlAdministratorLoginPassword};SslMode=Require;'
  }
}

resource keyvault_PostgresConnectionString 'Microsoft.KeyVault/vaults/secrets@2021-06-01-preview' = {
  parent: keyvault_resource
  name: 'ConnectionString'
  properties: {
    contentType: 'text/plain'
    value: 'Host=${postgresServer.properties.fullyQualifiedDomainName};Port=5432;Pooling=true;Connection Lifetime=0;Database=${postgresqlServer_database_name};User ID=${sqlAdministratorLogin}@${postgresServer.properties.fullyQualifiedDomainName};Password=${sqlAdministratorLoginPassword};'
  }
}

resource app_Storage 'Microsoft.Storage/storageAccounts@2021-04-01' = {
  name: storageAccount_name
  location: location
  tags: {
    application: application
    environment: '${env}${instance}'
  }
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
}


output appServicePrincipalId string = webSite.identity.principalId
output appServiceName string = appService_name
output keyVaultName string = keyvault_name
output siteUri string = webSite.properties.hostNames[0]
output sqlSvrFqdn string = sqlserver.properties.fullyQualifiedDomainName
