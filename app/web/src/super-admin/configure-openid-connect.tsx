import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react"
import * as React from "react"
import { Route, Routes, Outlet } from "react-router"
import { useTypedAction, TypedForm } from "glow-azure"
import { Field, FieldProps } from "formik"

export function ConfigreOpenIdConnectRoutes() {
  return (
    <Routes>
      <Route path="install" element={<ConfigureOpenid />}>
        {/* <Route path=":id" element={<AreaDetail />} />
        <Route path="create" element={<AreaCreate />} /> */}
      </Route>
    </Routes>
  )
}

export function ConfigureOpenid() {
  const [action] = useTypedAction("/api/glow/set-openid-connect-options")
  const toast = useToast()
  return (
    <Flex
      background="gray.400"
      alignContent="center"
      alignItems="center"
      justifyContent="center"
      flex={1}
    >
      <Box maxWidth={600}>
        <TypedForm
          actionName="/api/glow/set-openid-connect-options"
          initialValues={{ clientId: "", clientSecret: "", tenantId: "" }}
          onSuccess={() => {
            toast({ title: "Success", status: "success" })
          }}
        >
          {(f) => (
            <Stack background="black.500" dropShadow="md">
              <Field name="clientId">
                {({ field, form }: FieldProps) => (
                  <FormControl
                    size="sm"
                    // isInvalid={Boolean(form.errors.name && form.touched.title)}
                  >
                    <FormLabel htmlFor="clientId">Client ID</FormLabel>
                    <Input
                      autoFocus={true}
                      {...field}
                      size="sm"
                      id="clientId"
                      placeholder=""
                    />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="clientSecret">
                {({ field, form }: FieldProps) => (
                  <FormControl
                    size="sm"
                    // isInvalid={Boolean(form.errors.name && form.touched.title)}
                  >
                    <FormLabel htmlFor="clientSecret">Client secret</FormLabel>
                    <Input
                      {...field}
                      size="sm"
                      id="clientSecret"
                      placeholder=""
                    />
                    <FormErrorMessage>
                      {form.errors.clientSecret}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="tenantId">
                {({ field, form }: FieldProps) => (
                  <FormControl
                    size="sm"
                    // isInvalid={Boolean(form.errors.name && form.touched.title)}
                  >
                    <FormLabel htmlFor="tenantId">Tenant ID</FormLabel>
                    <Input {...field} size="sm" id="tenantId" placeholder="" />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Button type="submit">Submit</Button>
            </Stack>
          )}
        </TypedForm>
      </Box>
    </Flex>
  )
}
