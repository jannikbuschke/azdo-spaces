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
  function map(node: WorkItemClassificationNode) {
    return { id: node.id, path: node.path }
  }
  const root = map(data)
  const children = data.children ? data.children.flatMap(map) : []
  return (
    <div>
      <Select
        placeholder="Select AreaPath"
        size="sm"
        onChange={(e) => {
          onChange(e.target.value)
        }}
      >
        {[root, ...children].map((v) => (
          <option key={v.path} value={v.path!}>
            {v.path}
          </option>
        ))}
      </Select>
      {/* <RenderObject {...data} /> */}
    </div>
  )
}
