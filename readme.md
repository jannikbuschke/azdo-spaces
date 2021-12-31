This app allows to u expose azdo areas to users without account. The goal is to provide easy view or read access to certain parts of your azure devops backlog.

# Local setup

Preqrequesites: dotnet 6, node/npm9, postgreSQL

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
