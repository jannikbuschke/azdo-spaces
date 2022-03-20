import React from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "react-query"
import { ChakraProvider, Flex } from "@chakra-ui/react"
import { AdminRoutes as AdminRouts } from "../admin/routes"
import { JoinSpace } from "../spaces/join-space"
import { SpaceDetailview } from "../spaces/space-detailview"
import { TaskCreate } from "../spaces/task-create"
import { TaskDetail } from "../spaces/task-detail"
import { Routes, Route, Outlet } from "react-router"
import Header from "./header"
import Gslr from "./header-2"
import { ConfigreOpenIdConnectRoutes } from "../super-admin/configure-openid-connect"

function App() {
  return (
    <Flex direction="column" background="gray.300" height="100vh">
      <Gslr />
      {/* <Header /> */}
      <Routes>
        <Route path="space" element={<Outlet />}>
          <Route path=":spaceId/join" element={<JoinSpace />} />
          <Route path=":spaceId" element={<SpaceDetailview />}>
            <Route path=":id" element={<TaskDetail />} />
            <Route path="create" element={<TaskCreate />} />
          </Route>
        </Route>
      </Routes>
      <AdminRouts />
      <ConfigreOpenIdConnectRoutes />
    </Flex>
  )
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export function Root() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={client}>
        <Router>
          <App />
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  )
}
