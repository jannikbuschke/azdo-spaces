import * as React from "react"
import { useTypedAction, useTypedQuery } from "../ts-models/api"
import { useParams, useNavigate } from "react-router"
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react"
import { defaultCreateTaskViewmodel } from "../ts-models/AzdoTasks"
import { notifyError } from "glow-core"
import { useQueryClient } from "react-query"

export function TaskCreate() {
  const { spaceId: workspaceId } = useParams()
  const { data } = useTypedQuery("/api/get-create-task-viewmodel", {
    input: { workspaceId: workspaceId! },
    placeholder: defaultCreateTaskViewmodel,
  })
  const [value, setValue] = React.useState<string | undefined>(undefined)
  const [create, , { submitting }] = useTypedAction("/api/create-task")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const client = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()
  return (
    <Modal isOpen={true} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create working item</ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <RadioGroup onChange={setValue} value={value}>
            <Stack>
              <Input
                onChange={(v) => setTitle(v.target.value)}
                value={title}
                placeholder="Title"
              />
              <Stack direction="row">
                {data.workItemTypes.map((v) => (
                  <Radio value={v.name!} key={v.name!}>
                    <span style={{ color: `#${v.color!}` }}>{v.name}</span>
                  </Radio>
                ))}
              </Stack>
              <Textarea
                onChange={(v) => setDescription(v.target.value)}
                value={description}
                rows={15}
                placeholder="description"
              />
            </Stack>
          </RadioGroup>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Close
          </Button>
          <Button
            isLoading={submitting}
            colorScheme="blue"
            mr={3}
            onClick={async () => {
              const response = await create({
                title,
                workItemType: value!,
                workspaceId: workspaceId!,
                description,
                createdBy: localStorage.getItem("username") || "jbu",
              })
              if (response.ok) {
                client.invalidateQueries("/api/get-tasks")
                toast({ title: "Success", status: "success" })
                navigate(`../${response.payload.id}`)
              } else {
                notifyError(response.error)
              }
            }}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
