import * as React from "react"
import { Routes, Route, Outlet } from "react-router"
import { Grid } from "@chakra-ui/react"
import { WorkspaceList } from "./space-config-list"
import { AreaCreate, AreaDetail } from "./space-config-detail"

export function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="admin"
        element={
          <Grid gridTemplateColumns="1fr 1fr" flex={1}>
            <WorkspaceList />
            <Outlet />
          </Grid>
        }
      >
        <Route path=":id" element={<AreaDetail />} />
        <Route path="create" element={<AreaCreate />} />
      </Route>
    </Routes>
  )
}
