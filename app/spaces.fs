namespace AzdoTasks

open System.Collections.Generic
open Microsoft.Extensions.Logging
open Microsoft.TeamFoundation.Core.WebApi
open Microsoft.TeamFoundation.WorkItemTracking.WebApi
open Microsoft.VisualStudio.Services.WebApi
open System
open Glow.Azdo.Authentication
open Marten
open System.Linq
open MediatR
open Glow.Core.Actions
open Microsoft.VisualStudio.Services.WebApi.Patch
open Microsoft.VisualStudio.Services.WebApi.Patch.Json
open Microsoft.TeamFoundation.WorkItemTracking.WebApi.Models

module Spaces =

  [<Action(Route = "api/get-area-paths", AllowAnonymous = true)>]
  type GetAreaPaths() =
    interface IRequest<WorkItemClassificationNode>
    member val ProjectId: Nullable<Guid> = Nullable() with get, set

  type GetAreaPathsHandler(clients: AzdoClients) =
    interface IRequestHandler<GetAreaPaths, WorkItemClassificationNode> with

      member  this.Handle(request, token) =
        task {
          let! client = clients.GetAppClient<WorkItemTrackingHttpClient>()
          let! areaPathNode = client.GetClassificationNodeAsync(request.ProjectId.ToString(), TreeStructureGroup.Areas, depth = 15)

          return areaPathNode
        }

  [<CLIMutable>]
  type Workspace =
    { Id: Guid
      DisplayName: string
      ProjectId: Guid
      AreaPath: string
      ApiKeys: List<string> }

  [<Action(Route = "api/delete-workspace", AllowAnonymous = true)>]
  type DeleteWorkspace() =
    interface IRequest<Workspace>
    member val Id = Guid.Empty with get, set

  type DeleteWorkspaceHandler(session: IDocumentSession) =
    interface IRequestHandler<DeleteWorkspace, Workspace> with
      member this.Handle(request, token) =
        task {
          let entity =
            session
              .Query<Workspace>()
              .Single(fun v -> v.Id = request.Id)

          session.Delete entity
          session.SaveChanges()
          return entity
        }

  [<Action(Route = "api/get-workspaces", AllowAnonymous = true)>]
  type GetAreas() =
    interface IRequest<List<Workspace>>

  type GetAreasHandler(store: IDocumentStore) =
    interface IRequestHandler<GetAreas, List<Workspace>> with
      member this.Handle(request, token) =
        task {
          use session = store.LightweightSession()
          let entities = session.Query<Workspace>().ToList()
          return entities
        }

  [<Action(Route = "api/get-workspace", AllowAnonymous = true)>]
  type GetArea() =
    interface IRequest<Workspace>
    member val Id = Guid.Empty with get, set

  type GetAreaHandler(session: IDocumentSession) =
    interface IRequestHandler<GetArea, Workspace> with
      member this.Handle(request, token) =
        task {
          let entity =
            session
              .Query<Workspace>()
              .Single(fun v -> v.Id = request.Id)

          return entity
        }

  [<Action(Route = "api/upsert-workspace", AllowAnonymous = true)>]
  type UpsertWorkspace() =
    interface IRequest<Workspace>
    member val Id = Guid.Empty with get, set
    member val DisplayName: string = String.Empty with get, set
    member val ProjectId: Nullable<Guid> = Nullable() with get, set
    //    member val ProjectName: string with get, set
    member val AreaPath = String.Empty with get, set
    //    member val AreaPath: string with get,set
    member val ApiKeys: List<string> = List<string>() with get, set

  type UpsertAreaHandler(session: IDocumentSession) =
    interface IRequestHandler<UpsertWorkspace, Workspace> with
      member this.Handle(request, token) =
        task {

          let id =
            if request.Id = Guid.Empty then
              Guid.NewGuid()
            else
              request.Id

          let entity =
            { Id = id
              DisplayName = request.DisplayName
              ProjectId = request.ProjectId.Value
              AreaPath = request.AreaPath
              ApiKeys = request.ApiKeys }

          session.Store(entity)

          let! result = session.SaveChangesAsync()
          return entity
        }

  [<Action(Route = "api/get-projects", AllowAnonymous = true)>]
  type GetProjects() =
    interface IRequest<IPagedList<TeamProjectReference>>

  type GetProjectsHandler(clients: AzdoClients) =
    interface IRequestHandler<GetProjects, IPagedList<TeamProjectReference>> with
      member this.Handle(request, token) =
        task {
          let! client = clients.GetAppClient<ProjectHttpClient>()
          let! projects = client.GetProjects()
          return projects
        }
