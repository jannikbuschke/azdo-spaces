namespace AzdoTasks

open Microsoft.Extensions.Logging
open Microsoft.TeamFoundation.Core.WebApi
open Microsoft.TeamFoundation.WorkItemTracking.WebApi
open Microsoft.VisualStudio.Services.WebApi
open System
open Glow.Azdo.Authentication
open MediatR
open Glow.Core.Actions
open Microsoft.TeamFoundation.WorkItemTracking.WebApi.Models
open Spaces

module AzdoProjects =

  let getClientForWorkspace<'T when 'T :> VssHttpClientBase> (clients: AzdoClients) (workspace: Workspace) (logger:ILogger)=
    task {

      let! client =
        match workspace.Pat.IsSome
              && workspace.OrganizationUrl.IsSome with
        | true ->
          logger.LogInformation($"Create client with URL ${workspace.OrganizationUrl.Value} and PAT")
          clients.GetAppClient<'T>(workspace.OrganizationUrl.Value, workspace.Pat.Value)
        | false -> clients.GetAppClient<'T>()

      return client
    }

  [<Action(Route = "api/get-area-paths", AllowAnonymous = true)>]
  type GetAreaPaths() =
    interface IRequest<WorkItemClassificationNode>
    member val ProjectId: Nullable<Guid> = Nullable() with get, set
    member val Pat = Unchecked.defaultof<string> with get, set
    member val OrganizationUrl = Unchecked.defaultof<string> with get, set

  type GetAreaPathsHandler(clients: AzdoClients, logger: ILogger<GetAreaPathsHandler>) =
    interface IRequestHandler<GetAreaPaths, WorkItemClassificationNode> with

      member this.Handle(request, token) =
        task {

          if not request.ProjectId.HasValue then
            failwith "projectid empty"

          logger.LogInformation $"path {request.Pat} {request.OrganizationUrl}"

          let! client =
            match request.Pat = null with
            | false ->
              match request.OrganizationUrl = null with
              | false -> clients.GetAppClient<WorkItemTrackingHttpClient>(request.OrganizationUrl, request.Pat)
              | true -> clients.GetAppClient<WorkItemTrackingHttpClient>()
            | true -> clients.GetAppClient<WorkItemTrackingHttpClient>()


          let! areaPathNode = client.GetClassificationNodeAsync(request.ProjectId.ToString(), TreeStructureGroup.Areas, depth = 15)

          return areaPathNode
        }

  [<Action(Route = "api/get-projects", AllowAnonymous = true)>]
  type GetProjects() =
    interface IRequest<IPagedList<TeamProjectReference>>
    member val Pat = Unchecked.defaultof<string> with get, set
    member val OrganizationUrl = Unchecked.defaultof<string> with get, set

  type GetProjectsHandler(clients: AzdoClients, logger: ILogger<GetProjectsHandler>) =
    interface IRequestHandler<GetProjects, IPagedList<TeamProjectReference>> with
      member this.Handle(request, token) =
        task {
          // todo test if works
          logger.LogInformation $"PAT = {request.Pat} | URL = {request.OrganizationUrl}"

          let! client =
            match request.Pat = null with
            | false ->
              match request.OrganizationUrl = null with
              | false -> clients.GetAppClient<ProjectHttpClient>(request.OrganizationUrl, request.Pat)
              | true -> clients.GetAppClient<ProjectHttpClient>()
            | true -> clients.GetAppClient<ProjectHttpClient>()

          let! projects = client.GetProjects()
          return projects
        }
