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
} from "@chakra-ui/react"
import { defaultCreateTaskViewmodel } from "../ts-models/AzdoTasks"
import { notifyError } from "glow-react"

export function TaskCreate() {
  const { spaceId: workspaceId } = useParams()
  const { data } = useTypedQuery("/api/get-create-task-viewmodel", {
    input: { workspaceId: workspaceId! },
    placeholder: defaultCreateTaskViewmodel,
  })
  const [value, setValue] = React.useState<string | undefined>(undefined)
  const [create, , { submitting }] = useTypedAction("/api/create-task")
  const [title, setTitle] = React.useState("")
  const navigate = useNavigate()
  return (
    <Modal isOpen={true} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create working item</ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <RadioGroup onChange={setValue} value={value}>
            <Stack direction="column">
              <Input
                onChange={(v) => setTitle(v.target.value)}
                value={title}
                placeholder="Title"
              />
              {data.workItemTypes.map((v) => (
                <Radio value={v.name!} key={v.name!}>
                  <span style={{ color: `#${v.color!}` }}>{v.name}</span>
                </Radio>
              ))}
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
                description: "",
                workItemType: value!,
                workspaceId: workspaceId!,
                createdBy: "jbu" || localStorage.getItem("username"),
              })
              if (response.ok) {
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
