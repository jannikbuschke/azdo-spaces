import * as React from "react"
import { TypedForm, useTypedQuery } from "../ts-models/api"
import { useParams } from "react-router"
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Tooltip,
} from "@chakra-ui/react"
import {
  defaultWorkItem,
  defaultWorkItemComments,
} from "../ts-models/Microsoft.TeamFoundation.WorkItemTracking.WebApi.Models"
import dayjs from "dayjs"
import { duration } from "moment"
import { Field as FormikField } from "formik"
import { RichTextEditor } from "../rich-text-editor"
import { useToast } from "@chakra-ui/react"
import { ErrorBanner } from "../shared/error-banner"

export function TaskDetail() {
  const { id, spaceId } = useParams<{ id: string; spaceId: string }>()
  const taskId = Number.parseInt(id!)
  const { data, refetch, isFetching } = useTypedQuery("/api/get-task", {
    input: { taskId, workspaceId: spaceId! },
    placeholder: defaultWorkItem,
  })
  const { data: comments, error } = useTypedQuery("/api/get-comments", {
    input: { taskId },
    placeholder: defaultWorkItemComments,
    queryOptions: { enabled: false },
  })
  const toast = useToast()
  const [key, setKey] = React.useState(1)
  React.useEffect(() => {
    setTimeout(() => {
      setKey(Math.random())
    }, 200)
  }, [data.id])
  return (
    <Box background="gray.50" padding={4}>
      <Stack>
        <ErrorBanner message={error} />
        <TypedForm
          actionName="/api/update-task"
          onSuccess={() => {
            toast({ title: "Success", status: "success" })
          }}
          enableReinitialize={true}
          initialValues={{
            taskId,
            title: data.fields["System.Title"] || "-",
            description: data.fields["System.Description"] || "",
          }}
        >
          {(f) => (
            <>
              <Stack
                direction="column"

                // _loading={true || isFetching}
              >
                {/* <Heading size="md">{f.values.title}</Heading> */}
                <FormikField name="title">
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={form.errors.name && form.touched.title}
                    >
                      {/* <FormLabel htmlFor="title">Title</FormLabel> */}
                      <Input
                        size="lg"
                        {...field}
                        paddingLeft={0}
                        border="none"
                        fontWeight="bold"
                        id="title"
                        placeholder="Title"
                      />
                      <FormErrorMessage>{form.errors.title}</FormErrorMessage>
                    </FormControl>
                  )}
                </FormikField>
                <ButtonGroup
                  size="sm"
                  isAttached={true}
                  // variant="outline"
                  // flexDirection="row-reverse"
                >
                  {/* <Button>Delete</Button> */}
                  <Button isLoading={isFetching} onClick={() => refetch()}>
                    Reload
                  </Button>
                  <Button
                    onClick={() => f.submitForm()}
                    isLoading={f.isSubmitting}
                  >
                    Submit
                  </Button>
                </ButtonGroup>
                <FormikField name="description">
                  {({ form }: any) => (
                    <FormControl
                      isInvalid={
                        form.errors.description && form.touched.description
                      }
                    >
                      <FormLabel htmlFor="description">Description</FormLabel>
                      <Box background="gray.200" rounded={4}>
                        <RichTextEditor key={key} name="description" />
                      </Box>
                      <FormErrorMessage>
                        {form.errors.description}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </FormikField>
              </Stack>
            </>
          )}
        </TypedForm>
        <br />
        {/* <Field label="Titel">{data.fields["System.Title"]}</Field> */}
        <Field label="State">{data.fields["System.State"]}</Field>
        <Field label="Created">
          {dayjs(data.fields["System.CreatedDate"]).format("llll")} (
          {duration(
            dayjs(data.fields["System.CreatedDate"]).diff(dayjs()),
          ).humanize(true)}
          )
        </Field>
        {/* <Field label="Created by">{data.fields["Custom.x_CreatedBy"]}</Field> */}
        <Tooltip label={data.fields["System.CreatedBy"]?.displayName}>
          <Field label="Created by">
            {data.fields["Custom.x_CreatedBy"] ||
              data.fields["System.CreatedBy"]?.displayName}
          </Field>
        </Tooltip>
        <Field label="Updated">
          {dayjs(data.fields["System.ChangedDate"]).format("llll")} (
          {duration(
            dayjs(data.fields["System.ChangedDate"]).diff(dayjs()),
          ).humanize(true)}
          )
        </Field>
        {/* <Field label="Assigned">{data.fields["System.AssignedTo"]}</Field> */}
        <Field label="Type">{data.fields["System.WorkItemType"]}</Field>
        <Field label="Tags">{data.fields["System.Tags"]}</Field>
        <Field label="Area">{data.fields["System.AreaPath"]}</Field>
        <Field label="TeamProject">{data.fields["System.TeamProject"]}</Field>
        <Field label="Prio">
          {data.fields["Microsoft.VSTS.Common.Priority"]}
        </Field>

        <br />
        <Field label="Comments" display="block">
          {comments.comments.map((v, i) => (
            <div key={i}>
              <div dangerouslySetInnerHTML={{ __html: v.text || "" }} />
            </div>
          ))}
        </Field>

        {/* <RenderObject {...comments} /> */}
      </Stack>
    </Box>
  )
}

function Field({
  label,
  children,
  display,
}: React.PropsWithChildren<{
  label: string
  display?: "inline-block" | "block"
}>) {
  return (
    <div>
      <FormLabel
        style={{
          width: "120px",
          display: display || "inline-block",
        }}
      >
        {label}:{" "}
      </FormLabel>
      {children}
    </div>
  )
}
