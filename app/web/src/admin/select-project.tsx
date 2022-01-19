import * as React from "react"
import { useTypedQuery } from "../ts-models/api"
import { Select } from "@chakra-ui/react"
import {
  defaultWorkItemClassificationNode,
  WorkItemClassificationNode,
} from "../ts-models/Microsoft.TeamFoundation.WorkItemTracking.WebApi.Models"

export function SelectProject({
  onChange,
}: {
  onChange: (id: string | null) => void
}) {
  const { data } = useTypedQuery("/api/get-projects", {
    input: {},
    placeholder: [],
  })
  return (
    <Select
      placeholder="Select project"
      size="sm"
      onChange={(e) => {
        onChange(e.target.value)
      }}
    >
      {data.map((v) => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </Select>
  )
}

type NodeViewmodel = { id: number; path: string }

function flatMap(node: WorkItemClassificationNode): NodeViewmodel[] {
  const result: NodeViewmodel = { id: node.id!, path: node.path! }
  if (node.children) {
    return [result, ...node.children.flatMap(flatMap)]
  }
  return [result]
}

export function SelectArea({
  onChange,
  projectId,
}: {
  projectId: string | null
  onChange: (id: string | null) => void
}) {
  const { data } = useTypedQuery("/api/get-area-paths", {
    input: { projectId },
    placeholder: defaultWorkItemClassificationNode,
    queryOptions: { enabled: projectId !== null },
  })
  React.useEffect(() => {
    if (projectId === null) {
      onChange(null)
    }
  }, [projectId])

  const nodes = flatMap(data)
  return (
    <div>
      <Select
        placeholder="Select AreaPath"
        size="sm"
        onChange={(e) => {
          onChange(e.target.value)
        }}
      >
        {nodes.map((v) => (
          <option key={v.path} value={v.path!}>
            {v.path}
          </option>
        ))}
      </Select>
      {/* <RenderObject {...data} /> */}
    </div>
  )
}
