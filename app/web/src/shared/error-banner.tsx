import { Alert, AlertIcon } from "@chakra-ui/react"
import { RenderObject } from "glow-core"
import * as React from "react"

export function ErrorBanner({
  message,
}: {
  message?: React.ReactNode | any | null | undefined
}) {
  if (!message) {
    return null
  }
  const node = React.isValidElement(message) ? (
    message
  ) : typeof message === "object" ? (
    message instanceof Error ? (
      message.message
    ) : message.title || message.detail ? (
      message.title + " " + message.detail
    ) : (
      <RenderObject msg={message} />
    )
  ) : (
    message.toString()
  )
  return (
    <Alert status="error">
      <AlertIcon />
      {node}
    </Alert>
  )
}
