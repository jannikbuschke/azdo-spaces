namespace AzdoTasks

open System
open System.Collections.Generic

module Models=
  type Workspace =
    { Id: Guid
      DisplayName: string
      Pat: string option
      OrganizationUrl: string option
      ProjectId: Guid
      AreaPath: string
      ApiKeys: List<string> }