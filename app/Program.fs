namespace sample.fs

open Glow.Azure
open Microsoft.AspNetCore.Authentication.Cookies
open Microsoft.AspNetCore.Http
open Marten
open System
open System.Reflection
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Configuration
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open Serilog
open Glow.Core
open Glow.Tests
open Glow.Azdo.Authentication
open Glow.TypeScript
open Glow.Azure.AzureKeyVault

#nowarn "20"

module Program =

    let getPreStartLogger () =
        let envName =
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")

        let env =
            if String.IsNullOrEmpty envName then
                "Production"
            else
                envName

        if env = "Production" then
            LoggerConfiguration()
                .WriteTo.File("logs/prestart-log-.txt")
                .WriteTo.Console()
                .CreateLogger()
        else
            LoggerConfiguration()
                .WriteTo.Console()
                .CreateLogger()

    let exitCode = 0

    [<EntryPoint>]
    let main args =
        let logger: Serilog.ILogger = upcast getPreStartLogger ()
        Log.Logger = logger
        let builder = WebApplication.CreateBuilder(args)

        // TODO add KeyVault

        builder.Logging.ClearProviders()
        builder.Logging.AddSerilog()

        let services = builder.Services

        services.AddControllers()
        let assemblies = [| Assembly.GetEntryAssembly(); typedefof<GlowModuleAzure>.Assembly  |]

        services.AddGlowApplicationServices(null, null, assemblies)
        services.AddAzureKeyvaultClientProvider()

        services.AddTypescriptGeneration [| TsGenerationOptions(
                                                Assemblies = assemblies,
                                                Path = "./web/src/ts-models/",
                                                GenerateApi = true
                                            ) |]

        let authScheme =
            CookieAuthenticationDefaults.AuthenticationScheme

        let cookieAuth (o: CookieAuthenticationOptions) =
            do
                o.Cookie.HttpOnly <- true
                o.Cookie.SecurePolicy <- CookieSecurePolicy.SameAsRequest
                o.SlidingExpiration <- true
                o.ExpireTimeSpan <- TimeSpan.FromDays 7.0

        services
            .AddAuthentication(authScheme)
            .AddCookie(cookieAuth)
            .AddAzdoClientServices(fun options ->
                options.Pat <- builder.Configuration.Item("azdo:Pat")
                options.OrganizationBaseUrl <- builder.Configuration.Item("azdo:OrganizationBaseUrl"))
        |> ignore

        services.AddTestAuthentication()
        services.AddResponseCaching()


        let connectionString =
            builder.Configuration.Item("ConnectionString")

        logger.Information $"Connectionstring {connectionString}"

        let options = StoreOptions()
        options.Connection connectionString
        //    options.AutoCreateSchemaObjects <- true // if is development
        services
            .AddMarten(options)
            .UseLightweightSessions()


        builder.AddKeyVaultAsConfigurationProviderIfNameConfigured()

        builder.Services.AddGlowAadIntegration(builder.Environment, builder.Configuration)

        builder.Services.AddAuthorization
            (fun options -> options.AddPolicy("Authenticated", (fun v -> v.RequireAuthenticatedUser() |> ignore)))

        let app = builder.Build()

        let env =
            app.Services.GetService<IWebHostEnvironment>()

        let configuration =
            app.Services.GetService<IConfiguration>()

        Log.Logger <-
            LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .WriteTo.Console()
                // .WriteTo.File("logs/log-{date}.txt")
                .CreateLogger()

        Log.Logger.Information "logger reconfigured"

        app.UseResponseCaching()

        app.UseGlow(env, configuration, (fun options -> options.SpaDevServerUri <- "http://localhost:3001"))

        app.Run()

        exitCode
