import _ from 'lodash'
import { gql } from 'apollo-server'
import { DocumentNode } from 'graphql'

import { FileNamingConventions } from './__types__/conventions'
import { getConventions, FilesOfConvention } from './filewalker'

interface AutoloaderConfig {
  seachPaths: string[]
  conventions?: FileNamingConventions
  fileExtensions?: string[]
  exclude?: string[],
}

export const defaultConfig: AutoloaderConfig = {
  seachPaths: ['.'],
  conventions: {
    types: { schema: 'typeDef' },
    resolvers: { queries: 'queries', mutations: 'mutations' },
    datasources: { Datasource: 'Datasource' },
  },
  fileExtensions: ['ts'],
  exclude: ['[^\/]+\.(spec|test)', '__tests__'], // eslint-disable-line
}

export const Autoloader = (config: AutoloaderConfig) => {
  const _config = _.merge(defaultConfig, config)
  return {
    getTypeDefs: async () => TypeDefLoader(_config),
    getResolvers: async () => ResolverLoader(_config),
    getDatasources: async () => DatasourceLoader(_config),
  }
}

const TypeDefLoader = async ({ seachPaths, conventions, fileExtensions, exclude }: AutoloaderConfig): Promise<DocumentNode> => {
  const filesOfConvetion = getConventions(seachPaths, conventions!.types!, fileExtensions!, exclude!)
  const typeDefs = await getImports(filesOfConvetion)
  return typeDefs.reduce((curr, next): DocumentNode => gql`
    ${curr}
    ${next}
  `, '')
}

const ResolverLoader = async ({ seachPaths, conventions, fileExtensions, exclude }: AutoloaderConfig) => {
  const filesOfConvetion = getConventions(seachPaths, conventions!.resolvers!, fileExtensions!, exclude!)
  const resolvers = await getImports(filesOfConvetion)
  return resolvers.reduce((curr, next) => {
    return _.merge(curr, next)
  }, {})
}
const DatasourceLoader = async ({ seachPaths, conventions, fileExtensions, exclude }: AutoloaderConfig) => {
  const filesOfConvetion = getConventions(seachPaths, conventions!.datasources!, fileExtensions!, exclude!)
  const datasources = await getImports(filesOfConvetion)
  return () => datasources.reduce((curr, next) => {
    return {
      ...curr,
      [next.id]: new next(),
    }
  }, {})
}

export const getImports = async (filesOfConvention: FilesOfConvention): Promise<any[]> => {
  let imports: any[] = []
  const fileNamePatterns = Object.keys(filesOfConvention)
  for (let i = 0; i < fileNamePatterns.length; i++) {
    const filePattern = fileNamePatterns[i]
    const matchingFiles = filesOfConvention[filePattern]
    const matchingConvention = matchingFiles.convention
    const exportPattern = matchingConvention[filePattern]
    const modules = await Promise.all(matchingFiles.files.map((path: string) => import(path)))
    const importOfConvetion = modules.map((module: any) => module[exportPattern])
    imports = imports.concat(importOfConvetion)
  }
  return imports
}