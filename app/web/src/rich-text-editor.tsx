import * as React from "react"
import { useField } from "formik"
import styled from "styled-components"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Document from "@tiptap/extension-document"
import Image from "@tiptap/extension-image"

export function RichTextEditor({
  name,
  readonly,
  id,
  placeholder,
}: {
  name: string
  readonly?: boolean
  id?: string
  placeholder?: string
}) {
  const [field, , meta] = useField(name)

  const editor = useEditor({
    extensions: [StarterKit, Document, Image],
    editable: true, //readonly === false,
    content: field.value,
    onUpdate: (v) => {
      meta.setValue(v.editor.getHTML())
    },
  })

  if (field.value === null || field.value === undefined) {
    return <div>{typeof field.value}</div>
  }
  if (editor === null) {
    return <div>editor is null</div>
  }
  return <StyledEditorContent editor={editor} />
}

const StyledEditorContent = styled(EditorContent)`
  // border: 1px solid rgb(217, 217, 217);
  // border-radius: 4px;
  padding: 8px;
  > .ProseMirror {
    padding: 2px 0px;
    // padding: 4px;
    // border: 1px solid rgb(217, 217, 217);
  }
  > .ProseMirror-focused {
    padding-left: 10px;
  }
  > li {
    margin-left: 20px;
  }
  li {
    margin-left: 20px;
  }
  blockquote {
    background: #f9f9f9;
    border-left: 8px solid #ccc;
    border-radius: 2px;
    --margin: 1em 10px;
    padding: 0.5em 10px;
  }
`
