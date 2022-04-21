import * as React from "react"
import { TypedForm, useTypedAction, useTypedQuery } from "../ts-models/api"
import { useParams, useNavigate } from "react-router"
import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  FormHelperText,
  Heading,
  Input,
  Stack,
  InputGroup,
  InputRightAddon,
  Box,
  Flex,
} from "@chakra-ui/react"
import { SelectArea, SelectProject } from "./select-project"
import { Field, FieldProps } from "formik"
import {
  defaultWorkspace,
  defaultUpsertWorkspace,
  UpsertWorkspace,
} from "../ts-models/AzdoTasks"
import { Link } from "react-router-dom"
import { useToast } from "@chakra-ui/react"
import { RenderObject } from "glow-core"

function makeid(length: number) {
  var result = ""
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function UpsertAreaForm({
  initialValues,
}: {
  initialValues: UpsertWorkspace
}) {
  const [deleteWorkspace] = useTypedAction("/api/delete-workspace")
  const navigate = useNavigate()
  const toast = useToast()
  // return <RenderObject {...initialValues} />
  return (
    <Box background="gray.200" flex={1}>
      <TypedForm
        actionName="/api/upsert-workspace"
        initialValues={initialValues}
        onSuccess={() => {
          toast({ title: "Success", status: "success" })
        }}
      >
        {(f) => (
          <Flex direction="column">
            <Stack
              padding={4}
              alignItems="center"
              justifyContent="space-between"
              direction="row"
              flex={1}
            >
              <Heading as="h2">{f.values.displayName}</Heading>
              <ButtonGroup size="md" isAttached={true}>
                <Button
                  isLoading={f.isSubmitting}
                  onClick={() => f.submitForm()}
                  background="gray.200"
                >
                  Save
                </Button>
                {initialValues.id !== null && (
                  <Button
                    background="gray.200"
                    onClick={async () => {
                      await deleteWorkspace({ id: initialValues.id! })
                      navigate(-1)
                    }}
                  >
                    Delete
                  </Button>
                )}
              </ButtonGroup>
            </Stack>
            <Stack padding={4} spacing={4}>
              <Field name="displayName">
                {({ field, form }: FieldProps) => (
                  <FormControl
                    size="sm"
                    isInvalid={Boolean(form.errors.name && form.touched.title)}
                  >
                    <FormLabel htmlFor="displayName">Displayname</FormLabel>
                    <Input
                      {...field}
                      size="sm"
                      id="displayName"
                      placeholder="Displayname"
                    />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="organizationUrl">
                {({ field, form }: FieldProps) => (
                  <FormControl>
                    <FormLabel htmlFor="organizationUrl">
                      Organization URL
                    </FormLabel>
                    <Input
                      {...field}
                      size="sm"
                      id="organizationUrl"
                      placeholder="OrganizationUrl"
                    />
                    <FormHelperText>{f.values.organizationUrl}</FormHelperText>
                    <FormErrorMessage>
                      {form.errors.organizationUrl}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="pat">
                {({ field, form }: FieldProps) => (
                  <FormControl>
                    <FormLabel htmlFor="pat">
                      Personal Accces Token (PAT)
                    </FormLabel>
                    <Input {...field} size="sm" id="pat" placeholder="PAT" />
                    <FormHelperText>{f.values.pat}</FormHelperText>
                    <FormErrorMessage>{form.errors.pat}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              {f.values.pat === "***" ? (
                <div />
              ) : (
                <>
                  <Field name="projectId">
                    {({ form }: FieldProps) => (
                      <FormControl>
                        <FormLabel htmlFor="projectId">Project</FormLabel>
                        <SelectProject
                          onChange={(v) => form.setFieldValue("projectId", v)}
                        />
                        <FormHelperText>{f.values.projectId}</FormHelperText>
                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="areaPath">
                    {({ form }: FieldProps) => (
                      <FormControl>
                        <FormLabel htmlFor="areaPath">Area Path</FormLabel>
                        <SelectArea
                          projectId={f.values.projectId}
                          onChange={(v) => form.setFieldValue("areaPath", v)}
                        />
                        <FormHelperText>{f.values.areaPath}</FormHelperText>
                        <FormErrorMessage>
                          {form.errors.areaPath}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </>
              )}

              <Field name="apiKeys[0]">
                {({ field }: FieldProps) => (
                  <FormControl>
                    <FormLabel htmlFor="apiKeys[0]">Api Key 0</FormLabel>
                    <Stack>
                      <InputGroup size="sm">
                        <Input
                          {...field}
                          id="apiKeys[0]"
                          placeholder="Api Key 0"
                        />
                        <InputRightAddon>
                          <Button
                            size="sm"
                            onClick={() => {
                              f.setFieldValue("apiKeys[0]", makeid(12))
                            }}
                          >
                            new
                          </Button>
                        </InputRightAddon>
                      </InputGroup>
                      <Link
                        to={`/space/${initialValues.id}/join?api-key=${f.values.apiKeys[0]}`}
                      >
                        Link to join
                      </Link>
                      <Link to={`/space/${initialValues.id}`}>
                        Link to space
                      </Link>
                    </Stack>

                    {/* <FormErrorMessage>{form.errors.api}</FormErrorMessage> */}
                  </FormControl>
                )}
              </Field>
            </Stack>
            {/* <FormikDebug /> */}
          </Flex>
        )}
      </TypedForm>
    </Box>
  )
}

export function AreaCreate() {
  return <UpsertAreaForm initialValues={defaultUpsertWorkspace} />
}

export function AreaDetail() {
  const { id } = useParams()
  const { data } = useTypedQuery("/api/get-workspace", {
    input: { id: id! },
    placeholder: defaultWorkspace,
  })
  if (!id) {
    return <div>Not found</div>
  }
  const { organizationUrl, pat, ...rest } = data

  const initialValues: UpsertWorkspace = {
    ...rest,
    organizationUrl:
      organizationUrl?.case === "Some"
        ? organizationUrl.fields[0] || null
        : null,
    pat: pat?.case === "Some" ? pat.fields[0] || null : null,
  }

  return <UpsertAreaForm initialValues={initialValues} />
}
