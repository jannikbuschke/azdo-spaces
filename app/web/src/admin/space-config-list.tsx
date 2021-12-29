import * as React from "react"
import { useTypedQuery } from "../ts-models/api"
import { useMatch, useNavigate, useResolvedPath } from "react-router"
import {
  Button,
  ButtonGroup,
  Stack,
  Box,
  Flex,
  Heading,
} from "@chakra-ui/react"
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react"
import { Link } from "react-router-dom"

export function WorkspaceList() {
  const { data, refetch } = useTypedQuery("/api/get-workspaces", {
    input: {},
    placeholder: [],
  })
  const navigate = useNavigate()

  return (
    <Flex direction="column">
      <Stack
        padding={4}
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        background="blue.100"
      >
        <Heading as="h2">{"Spaces"}</Heading>
      </Stack>
      <ButtonGroup size="sm" isAttached={true}>
        <Button borderRadius={0} onClick={() => refetch()}>
          Reload
        </Button>
        <Button borderRadius={0} onClick={() => navigate("./create")}>
          Create
        </Button>
      </ButtonGroup>
      <Table variant="unstyled" size="sm" background="gray.200">
        {/* <Thead>
            <Tr>
              <Th>Title</Th>
            </Tr>
          </Thead> */}
        <Tbody>
          {data.map((v) => (
            <Row to={`./${v.id}`} id={v.id!} displayName={v.displayName!} />
            // <Tr>
            //   <Td>
            //     <Link to={`./${v.id}`}>{v.displayName}</Link>
            //   </Td>
            // </Tr>
          ))}
        </Tbody>
      </Table>
      {/* <RenderObject {...data} /> */}
    </Flex>
  )
}

function Row({
  to,
  id,
  displayName,
}: {
  to: string
  id: string
  displayName: string
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
        <Link to={to}>{displayName}</Link>
      </Td>
    </Tr>
  )
}
