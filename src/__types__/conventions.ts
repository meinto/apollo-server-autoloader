type FileNamePattern = string
type ExportPattern = string

export interface NamingConvention {
  // key: FileNamePattern
  [key: string]: ExportPattern
}

export interface FileNamingConventions {
  types?: NamingConvention
  resolvers?: NamingConvention
  datasources?: NamingConvention
}