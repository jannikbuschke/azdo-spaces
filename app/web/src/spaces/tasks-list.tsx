import * as React from "react"
import { useTypedQuery } from "../ts-models/api"
import { useNavigate, useResolvedPath, useMatch } from "react-router"
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Spinner,
  Stack,
} from "@chakra-ui/react"
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react"
import { Tag, Alert, AlertIcon } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { defaultWorkspaceViewmodel } from "../ts-models/AzdoTasks"
import { ErrorBanner } from "../shared/error-banner"

function renderTag(value: string) {
  return (
    <Tag
      size="sm"
      color={
        value === "Closed"
          ? "green"
          : value === "New"
          ? "gray"
          : value === "Removed"
          ? "black"
          : value === ""
          ? "gray"
          : "blue"
      }
    >
      {value}
    </Tag>
  )
}

export function TaskList({
  workspaceId,
  apiKey,
}: {
  workspaceId: string
  apiKey: string
}) {
  const { data: workspace, isFetching: isFetchingWorkspace } = useTypedQuery(
    "/api/get-workspace-viewmodel",
    {
      input: { workspaceId, apiKey },
      placeholder: defaultWorkspaceViewmodel,
      queryOptions: { enabled: Boolean(apiKey) },
    },
  )
  const [stateFilter, setStateFilter] = React.useState<string | null>(null)

  const { data, refetch, error, isFetching: isFetchingTasks } = useTypedQuery(
    "/api/get-tasks",
    {
      input: { workspaceId, apiKey, stateFilter },
      placeholder: [],
    },
  )
  const navigate = useNavigate()
  const areaNameSplit = workspace.areaPath?.split("\\")
  const areaName = areaNameSplit?.[areaNameSplit.length - 1]
  return (
    <Stack marginTop={4}>
      <ErrorBanner message={error} />
      <Box paddingLeft={2}>
        {/* <Heading size="md">{workspace.projectName}</Heading> */}
        <Heading size="md">{areaName || " "}</Heading>
        {(isFetchingWorkspace || isFetchingTasks) && <Spinner />}
      </Box>
      <Stack direction="row">
        <ButtonGroup size="sm" isAttached={true}>
          <Button borderRadius={0} onClick={() => refetch()}>
            Reload
          </Button>
          <Button onClick={() => navigate("./create")}>Create</Button>
        </ButtonGroup>
        <ButtonGroup size="sm" isAttached={true}>
          {["New", "Active", "Resolved", "Closed"].map((v) => (
            <Button
              background={stateFilter === v ? "black.300" : undefined}
              onClick={() => {
                if (stateFilter === v) setStateFilter(null)
                else setStateFilter(v)
              }}
            >
              {v}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
      {/* <SelectProject onChange={(v) => setProjectId(v)} /> */}
      <Table
        variant="unstyled"
        size="sm"
        // shadow="md"
        background="gray.200"
        // rounded={10}
      >
        <Thead>
          <Tr>
            <Th width={5}>Id</Th>
            <Th>Title</Th>
            <Th width={25}>State</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(({ id, fields }) => (
            <Row
              id={"" + id!}
              title={fields["System.Title"]}
              to={`./${id}`}
              state={fields["System.State"]}
            />
            // <Tr key={v.id}>
            //   <Td>
            //     <Link to={`./${v.id}`}>{v.id}</Link>
            //   </Td>
            //   <Td>
            //     <Link to={`./${v.id}`}>{v.fields["System.Title"]}</Link>
            //     <Row to={`./${v.id}`} />
            //   </Td>
            //   <Td>{renderTag(v.fields["System.State"])}</Td>
            // </Tr>
          ))}
        </Tbody>
      </Table>
      {/* <RenderObject {...data} /> */}
    </Stack>
  )
}

function Row({
  to,
  id,
  title,
  state,
}: {
  to: string
  id: string
  title: string
  state: string
}) {
  let resolved = useResolvedPath(to)
  let match = useMatch({ path: resolved.pathname, end: true })
  const navigate = useNavigate()
  return (
    <Tr
      key={id}
      background={match ? "blue.200" : undefined}
      onClick={() => navigate(to)}
    >
      <Td cursor="pointer">
        <Link to={to}>{id}</Link>
      </Td>
      <Td cursor="pointer">
        <Link to={to}>{title}</Link>
      </Td>
      <Td cursor="pointer">{renderTag(state)}</Td>
    </Tr>
  )
}
