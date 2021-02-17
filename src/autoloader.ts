import _ from 'lodash'
import { gql } from 'apollo-server'
import { DocumentNode } from 'graphql'
import { RESTDataSource } from 'apollo-datasource-rest'

import { FileNamingConventions } from './__types__/conventions'
import { getConventions, FilesOfConvention } from './filewalker'

interface AutoloaderConfig {
  searchPaths: string[]
  conventions?: FileNamingConventions
  fileExtensions?: string[]
  datasourceDecorators?: (new (instance: RESTDataSource) => RESTDataSource)[],
  exclude?: string[],
}

export const defaultConfig: AutoloaderConfig = {
  searchPaths: ['.'],
  conventions: {
    types: { schema: 'typeDef' },
    resolvers: { queries: 'queries', mutations: 'mutations' },
    datasources: { Datasource: 'Datasource' },
  },
  fileExtensions: ['ts'],
  datasourceDecorators: [],
  exclude: ['[^\/]+\.(spec|test)', '__tests__'], // eslint-disable-line
}

export const Autoloader = (config: AutoloaderConfig) => {
  const _defaultConfig = _.cloneDeep(defaultConfig)
  const _config = _.merge(_defaultConfig, config)
  return {
    getTypeDefs: async () => TypeDefLoader(_config),
    getResolvers: async () => ResolverLoader(_config),
    getDatasources: async () => DatasourceLoader(_config),
  }
}

const TypeDefLoader = async ({ searchPaths, conventions, fileExtensions, exclude }: AutoloaderConfig): Promise<DocumentNode> => {
  const filesOfConvetion = getConventions(searchPaths, conventions!.types!, fileExtensions!, exclude!)
  const typeDefs = await getImports(filesOfConvetion)
  return typeDefs.reduce((curr, next): DocumentNode => gql`
    ${curr}
    ${next}
  `, '')
}

const ResolverLoader = async ({ searchPaths, conventions, fileExtensions, exclude }: AutoloaderConfig) => {
  const filesOfConvetion = getConventions(searchPaths, conventions!.resolvers!, fileExtensions!, exclude!)
  const resolvers = await getImports(filesOfConvetion)
  return resolvers.reduce((curr, next) => {
    return _.merge(curr, next)
  }, {})
}

interface Datasource extends RESTDataSource {
  id: string
  new(): Datasource
}
const DatasourceLoader = async ({ searchPaths, conventions, fileExtensions, exclude, datasourceDecorators }: AutoloaderConfig) => {
  const filesOfConvetion = getConventions(searchPaths, conventions!.datasources!, fileExtensions!, exclude!)
  const datasources = await getImports(filesOfConvetion)
  return () => datasources.reduce((curr: { [key: string]: Datasource }, NextDatasource: Datasource) => {
    let datasource = new NextDatasource() as RESTDataSource
    datasourceDecorators?.forEach((Decorator) => {
      datasource = new Decorator(datasource)
    })
    return {
      ...curr,
      [NextDatasource.id]: new NextDatasource(),
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