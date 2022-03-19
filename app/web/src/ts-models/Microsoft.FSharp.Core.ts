/* eslint-disable prettier/prettier */
export type FSharpOption_string_Case_None = {
  case: "None",
  fields: []
}

export const defaultFSharpOption_string_Case_None: FSharpOption_string_Case_None = {
  case: "None",
  fields: []
}
export type FSharpOption_string_Case_Some = {
  case: "Some",
  fields: [string | null]
}

export const defaultFSharpOption_string_Case_Some: FSharpOption_string_Case_Some = {
  case: "Some",
  fields: [null]
}

export type FSharpOption_string = FSharpOption_string_Case_None | FSharpOption_string_Case_Some

export const defaultFSharpOption_string: FSharpOption_string = defaultFSharpOption_string_Case_None
