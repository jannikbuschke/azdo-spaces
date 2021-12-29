import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react"
import * as React from "react"
import { Outlet, useParams, useLocation, useNavigate } from "react-router"
import { useTypedQuery } from "../ts-models/api"
import { defaultWorkspaceViewmodel } from "../ts-models/AzdoTasks"
import { TaskList } from "./tasks-list"

function useSearchParams() {
  const { search } = useLocation()

  return React.useMemo(() => new URLSearchParams(search), [search])
}

export function JoinSpace() {
  const { spaceId: workspaceId } = useParams()
  const searchParams = useSearchParams()
  const apiKey = searchParams.get("api-key")
  const navigate = useNavigate()

  const [username, setUsername] = React.useState("")
  function finish() {
    if (username === "") {
      return
    }
    localStorage.setItem("api-key", apiKey!)
    localStorage.setItem("username", username)
    navigate(`/space/${workspaceId}`, { replace: true })
  }

  if (!workspaceId) {
    return <div>unknown id</div>
  }

  return apiKey ? (
    <Center flex={1} background="gray.300" direction="column">
      <Center background="gray.400" padding={10} shadow="sm" rounded={10}>
        <Stack>
          <Heading>Join</Heading>
          <Input
            background="gray.50"
            autoFocus={true}
            onKeyPress={(v) => {
              if (v.code === "Enter") {
                finish()
              }
            }}
            maxWidth={600}
            value={username}
            onChange={(v) => setUsername(v.target.value)}
            placeholder="Username"
          />
          <Button
            onClick={() => {
              finish()
            }}
          >
            Enter
          </Button>
        </Stack>
      </Center>
    </Center>
  ) : (
    <div>No Api Key</div>
  )
}
