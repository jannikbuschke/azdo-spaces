namespace AzdoTasks

open System.Collections.Generic
open System
open Marten
open System.Linq
open MediatR
open Glow.Core.Actions
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Logging

module Spaces =

  type WorkspaceListItemViewmodel = { Id: Guid; DisplayName: string }

  type Workspace =
    { Id: Guid
      DisplayName: string
      Pat: string option
      OrganizationUrl: string option
      ProjectId: Guid
      AreaPath: string
      ApiKeys: List<string> }

  [<Action(Route = "api/delete-workspace", Policy = "Authenticated")>]
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

  [<Action(Route = "api/get-workspaces", Policy = "Authenticated")>]
  type GetAreas() =
    interface IRequest<List<WorkspaceListItemViewmodel>>

  type GetAreasHandler(store: IDocumentStore, httpCtx: IHttpContextAccessor, logger: ILogger<GetAreasHandler>) =
    interface IRequestHandler<GetAreas, List<WorkspaceListItemViewmodel>> with
      member this.Handle(request, token) =
        task {
          let isAuthenticated =
            httpCtx.HttpContext.User.Identity.IsAuthenticated

          logger.LogInformation $"Is user authenticated = {isAuthenticated}"
          use session = store.LightweightSession()

          let entities =
            session
              .Query<Workspace>()
              .Select(fun v ->
                { Id = v.Id
                  DisplayName = v.DisplayName })
              .ToList()

          return entities
        }

  [<Action(Route = "api/get-workspace", Policy = "Authenticated")>]
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

          let result ={ entity with Pat = Some "***" }
          return result
        }

  [<Action(Route = "api/upsert-workspace", AllowAnonymous = true)>]
  type UpsertWorkspace() =
    interface IRequest<Workspace>
    member val Id = Unchecked.defaultof<Guid> with get, set
    member val Pat = Unchecked.defaultof<string> with get, set
    member val OrganizationUrl = Unchecked.defaultof<string> with get, set
    member val DisplayName = Unchecked.defaultof<string> with get, set
    member val ProjectId: Nullable<Guid> = Nullable() with get, set
    member val AreaPath = Unchecked.defaultof<string> with get, set
    member val ApiKeys: List<string> = List<string>() with get, set

  let toOption a = if a = null then None else Some a

  type UpsertAreaHandler(session: IDocumentSession) =
    interface IRequestHandler<UpsertWorkspace, Workspace> with
      member this.Handle(request, token) =
        task {

          let id =
            if request.Id = Guid.Empty then
              Guid.NewGuid()
            else
              request.Id

          let! storedEntity = session.Query<Workspace>().Where(fun v->v.Id = id).SingleOrDefaultAsync()
          let storedEntityOption = if (box storedEntity = null) then None else Some(storedEntity)

          let requestPat =  toOption request.Pat
          let entity =
            { Id = id
              DisplayName = request.DisplayName
              Pat = if requestPat.IsSome && requestPat.Value = "***" && storedEntityOption.IsSome then storedEntity.Pat else requestPat
              OrganizationUrl = toOption request.OrganizationUrl
              ProjectId = request.ProjectId.Value
              AreaPath = request.AreaPath
              ApiKeys = request.ApiKeys }


          session.Store(entity)

          let! result = session.SaveChangesAsync()
          return entity
        }
