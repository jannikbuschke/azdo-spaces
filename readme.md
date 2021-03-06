This app allows to you expose azdo areas to users without account. The goal is to provide easy/unauthenticated read/write access to certain parts of your azure devops backlog.

# Todoes

- [x] Url/PAT per space
- [x] Filters
- [/] Add KeyVault configuration, allow setting keyvault values
  - [x] Add extension method in glow for minimal api
  - [ ] Add health check?
  - [ ] Test in prod environment
- [ ] Pipeline issue, "parameter cannot be empty", probably app insights key or keyvaultname
- [ ] Install Wizard
- [ ] Allow configuring ClientSecret (and maybe ClientId, TenantId)
- [ ] "Installmode" flags
- [ ] AAD Integration for admin routes
- [ ] Sortings
- [ ] Remove need for custom configurations

# Local setup

Preqrequesites: dotnet 6, node/npm, postgreSQL

```
git clone https://github.com/jannikbuschke/azdo-spaces --recursive
```

edit `/app/Properties/launchSettings.json` and adjust ConnectionString (connectionstring to your postgreSQL database, ), azdo:PAT (azure devops personal access token) and azdo:OrganizationBaseUrl (url of your azure devops organization)

```json
{
  "profiles": {
    "sample-fs": {
      "commandName": "Project",
      "launchBrowser": true,
      "applicationUrl": "https://localhost:5002;",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ConnectionString": "User ID=postgres;Password=xxx;Host=localhost;Port=5432;Database=xxx;Pooling=true;Connection Lifetime=0;",
        "azdo:PAT": "xxx",
        "azdo:OrganizationBaseUrl": "https://dev.azure.com/xxx"
      }
    }
  }
}
```

```
cd app
dotnet watch run
```

In a second terminal

```
npm i --legacy-peer-deps
npm run bootstrap
npm run tsc
cd app/web
npm run start
```

open `localhost:5002/admin` and create a `Space`. Than click `link to join space` and enter a name. Now you should be able to see the previously configured azure devops areas and create tasks.
