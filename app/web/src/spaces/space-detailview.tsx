import * as React from "react"
import { useParams, Outlet } from "react-router"
import { Grid, useToast } from "@chakra-ui/react"
import { TaskList } from "./tasks-list"

export function SpaceDetailview() {
  const toast = useToast()
  const { spaceId: workspaceId } = useParams<{ spaceId: string }>()
  const apiKey = localStorage.getItem("api-key")
  React.useEffect(() => {
    if (!apiKey) {
      toast({
        title: "api key",
        description: apiKey || "no api key",
        status: apiKey ? "success" : "error",
        duration: 9000,
        isClosable: true,
      })
    }
  }, [apiKey])
  //read api key from local storage
  if (!workspaceId) {
    return <div>no workspace id</div>
  }
  return (
    <Grid gridTemplateColumns="1fr 1fr" flex={1}>
      <TaskList workspaceId={workspaceId} apiKey={apiKey!} />
      <Outlet />
    </Grid>
  )
}
