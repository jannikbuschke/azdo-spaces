namespace AzdoTasks

open System.Collections.Generic
open System.Threading.Tasks
open Microsoft.Extensions.Logging
open Microsoft.TeamFoundation.Core.WebApi
open Microsoft.TeamFoundation.WorkItemTracking.WebApi
open System
open Glow.Azdo.Authentication
open Marten
open System.Linq
open MediatR
open Glow.Core.Actions
open Microsoft.VisualStudio.Services.WebApi.Patch
open Microsoft.VisualStudio.Services.WebApi.Patch.Json
open Microsoft.TeamFoundation.WorkItemTracking.WebApi.Models
open Spaces
open AzdoProjects
open Glow.Validation

module AzdoTasks =

  [<Action(Route = "api/get-task", AllowAnonymous = true)>]
  type GetTask() =
    interface IRequest<WorkItem>

    [<NotEmpty>]
    member val WorkspaceId = Unchecked.defaultof<Guid> with get, set

    [<System.ComponentModel.DataAnnotations.RequiredAttribute>]
    member val TaskId = Unchecked.defaultof<int> with get, set

  type GetTaskHandler(clients: AzdoClients, session: IDocumentSession, logger: ILogger<GetTaskHandler>) =
    interface IRequestHandler<GetTask, WorkItem> with
      member this.Handle(request, token) =
        task {
          let! workspace = session.LoadAsync<Workspace>(request.WorkspaceId)
          let! client = getClientForWorkspace<WorkItemTrackingHttpClient> clients workspace logger

          let! data =
            client.GetWorkItemAsync(
              id = request.TaskId,
              expand = WorkItemExpand.All
            //              fields =
//                [| "System.Id"
//                   "System.Title"
//                   "System.State"
//                   "System.BoardColumn
//"System.Description"
//"System.BoardColumnDon"
//"Microsoft.VSTS.Common.Priority"
//"Microsoft.VSTS.Common.StateChangeDate"
//"Microsoft.VSTS.Common.AcceptanceCriteria
//                   "System.AreaPath"
//                   "System.TeamProject"
//                   "Microsoft.VSTS.Common.Priority"
//                   "System.Tags"
//                   "System.Reason"
//                   "System.ChangedDate"
//                   "System.ChangedBy"
//"System.CommentCount"
//                   "System.CreatedDate"
//                   "System.AssignedTo"
//                   "System.WorkItemType" |]
            )

          return data
        }

  [<Action(Route = "api/create-task", AllowAnonymous = true)>]
  type CreateTask() =
    interface IRequest<WorkItem>
    member val Title = String.Empty with get, set
    member val Description = String.Empty with get, set
    member val WorkItemType = String.Empty with get, set
    member val WorkspaceId = Guid.Empty with get, set
    member val CreatedBy = String.Empty with get, set

  [<Action(Route = "api/update-task", AllowAnonymous = true)>]
  type UpdateTask() =
    interface IRequest<WorkItem>
    member val TaskId = 0 with get, set
    member val Title = String.Empty with get, set
    member val Description = String.Empty with get, set

  type UpdateTaskHandler(clients: AzdoClients, session: IDocumentSession, logger: ILogger<UpdateTaskHandler>) =
    interface IRequestHandler<CreateTask, WorkItem> with
      member this.Handle(request, token) =
        task {
          let workspace =
            session
              .Query<Workspace>()
              .Single(fun v -> v.Id = request.WorkspaceId)

          let! client = clients.GetAppClient<WorkItemTrackingHttpClient>()
          let doc = JsonPatchDocument()

          doc.Add(JsonPatchOperation(Operation = Operation.Add, Path = "/fields/System.Title", Value = request.Title))

          doc.Add(JsonPatchOperation(Operation = Operation.Add, Path = "/fields/System.Description", Value = request.Description))

          doc.Add(JsonPatchOperation(Operation = Operation.Add, Path = "/fields/x_CreatedBy", Value = request.CreatedBy))

          let areaPath =
            workspace
              .AreaPath
              .Replace("\\Area\\", "\\")
              .Substring(1)

          doc.Add(JsonPatchOperation(Operation = Operation.Add, Path = "/fields/System.AreaPath", Value = areaPath))

          let! entity = client.CreateWorkItemAsync(doc, workspace.ProjectId, request.WorkItemType)
          return entity
        }

    interface IRequestHandler<UpdateTask, WorkItem> with
      member this.Handle(request, token) =
        task {
          let! client = clients.GetAppClient<WorkItemTrackingHttpClient>()
          let doc = JsonPatchDocument()

          doc.Add(JsonPatchOperation(Operation = Operation.Add, Path = "/fields/System.Title", Value = request.Title))

          doc.Add(JsonPatchOperation(Operation = Operation.Add, Path = "/fields/System.Description", Value = request.Description))

          let! result = client.UpdateWorkItemAsync(doc, request.TaskId, false, false, null, token)
          return result
        }

  type CreateTaskViewmodel() =
    member val Id = Guid.Empty with get, set
    member val WorkItemTypes: List<WorkItemType> = List<WorkItemType>() with get, set

  [<Action(Route = "api/get-create-task-viewmodel", AllowAnonymous = true)>]
  type GetCreateTaskViewmodel() =
    interface IRequest<CreateTaskViewmodel>
    member val WorkspaceId = Guid.Empty with get, set

  type GetCreateTaskViewmodelHandler(clients: AzdoClients, session: IDocumentSession) =
    interface IRequestHandler<GetCreateTaskViewmodel, CreateTaskViewmodel> with
      member this.Handle(request, token) =
        task {
          let! client = clients.GetAppClient<WorkItemTrackingHttpClient>()

          let workspace =
            session
              .Query<Workspace>()
              .Single(fun v -> v.Id = request.WorkspaceId)

          let! types = client.GetWorkItemTypesAsync(workspace.ProjectId)

          let result =
            types
              .Where(fun v ->
                v.Name = "Bug"
                //                || v.Name = "Task"
                || v.Name = "User Story"
                || v.Name = "Meeting")
              .ToList()

          return CreateTaskViewmodel(WorkItemTypes = result)
        }

  [<Action(Route = "api/get-comments", AllowAnonymous = true)>]
  type GetComments() =
    interface IRequest<WorkItemComments>
    member val TaskId = 0 with get, set

  type GetCommentsHandler(clients: AzdoClients) =
    interface IRequestHandler<GetComments, WorkItemComments> with
      member this.Handle(request, token) =
        task {
          let! client = clients.GetAppClient<WorkItemTrackingHttpClient>()
          let! comments = client.GetCommentsAsync(id = request.TaskId)
          return comments
        }

  [<Action(Route = "api/get-tasks", AllowAnonymous = true)>]
  type GetTasks() =
    interface IRequest<List<WorkItem>>
    member val WorkspaceId = Guid.Empty with get, set
    member val ApiKey = String.Empty with get, set
    member val StateFilter = Unchecked.defaultof<string> with get, set

  type WorkspaceViewmodel() =
    member val WorkspaceId = Guid.Empty with get, set
    member val ProjectName = String.Empty with get, set
    member val AreaPath = String.Empty with get, set

  [<Action(Route = "api/get-workspace-viewmodel", AllowAnonymous = true)>]
  type GetWorkspaceViewmodel() =
    interface IRequest<WorkspaceViewmodel>
    member val WorkspaceId = Guid.Empty with get, set
    member val ApiKey = String.Empty with get, set

  type GetTasksHandler(clients: AzdoClients, session: IDocumentSession, logger: ILogger<GetTasksHandler>) =
    interface IRequestHandler<GetWorkspaceViewmodel, WorkspaceViewmodel> with
      member this.Handle(request, token) =
        task {
          let workspace =
            session
              .Query<Workspace>()
              .Single(fun v -> v.Id = request.WorkspaceId)

          let! client = getClientForWorkspace<ProjectHttpClient> clients workspace logger
          let! project = client.GetProject(workspace.ProjectId.ToString())
          return WorkspaceViewmodel(WorkspaceId = workspace.Id, ProjectName = project.Name, AreaPath = workspace.AreaPath)
        }

    interface IRequestHandler<GetTasks, List<WorkItem>> with
      member this.Handle(request, token) =
        task {
          let workspace =
            session
              .Query<Workspace>()
              .Single(fun v -> v.Id = request.WorkspaceId)

          let areaPath =
            workspace
              .AreaPath
              .Replace("\\Area\\", "\\")
              .Replace("\\Area", "")
              .Substring(1)

          Console.WriteLine areaPath

          let stateFilter =
            if request.StateFilter = null then
              ""
            else
              $"AND [System.State] = '{request.StateFilter}'"

          let query =
            $"SELECT [System.Id], [System.Title], [System.State], [Id], [Title], [State], [Microsoft.VSTS.Common.Priority] FROM workitems WHERE [System.AreaPath] = '{areaPath}' {stateFilter} ORDER BY [System.CreatedDate] asc"

          let workspace =
            session
              .Query<Workspace>()
              .Single(fun v -> v.Id = request.WorkspaceId)
          let! client = getClientForWorkspace<WorkItemTrackingHttpClient> clients workspace logger

          let! queryResults = client.QueryByWiqlAsync(Wiql(Query = query), workspace.ProjectId)

          let emptyList =
            Task.FromResult((ResizeArray<WorkItem> []).ToList())

          let! data =
            match queryResults.WorkItems.Count() with
            | 0 -> emptyList
            | _ ->
              client.GetWorkItemsBatchAsync(
                WorkItemBatchGetRequest(
                  Ids =
                    queryResults
                      .WorkItems
                      .Skip(0)
                      .Take(1000)
                      .Select(fun v -> v.Id),
                  Fields =
                    [| "System.Id"
                       "System.Title"
                       "System.State"
                       "System.ChangedDate"
                       "System.AreaPath"
                       "Microsoft.VSTS.Common.Priority" |],
                  AsOf = queryResults.AsOf
                )
              )

          return data
        }
