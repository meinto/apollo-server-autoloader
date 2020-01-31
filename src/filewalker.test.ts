import * as path from 'path'
import { defaultConfig } from './autoloader'
import { getFilesOfConventions, FilesOfConvention } from './filewalker'

jest.mock('graphql', () => {})
jest.mock('apollo-server', () => {})

describe('filewalker', () => {

  const mockFileExtensions = ['.ts', '.js']
  const expectedOutputSchemaFiles: FilesOfConvention = {
    schema: {
      convention: defaultConfig.conventions!.types!,
      files: [
        path.resolve(__dirname, '..', '.testdata/schema.js'),
        path.resolve(__dirname, '..', '.testdata/schema.ts'),
        path.resolve(__dirname, '..', '.testdata/subfolder1/schema.ts'),
        path.resolve(__dirname, '..', '.testdata/subfolder1/subfolder2/schema.ts'),
      ],
    }
  }

  const expectedOutputResolverFiles: FilesOfConvention = {
    queries: {
      convention: { queries: defaultConfig.conventions!.resolvers!.queries },
      files: [
        path.resolve(__dirname, '..', '.testdata/queries.js'),
        path.resolve(__dirname, '..', '.testdata/subfolder1/queries.ts'),
        path.resolve(__dirname, '..', '.testdata/subfolder1/subfolder2/queries.ts'),
      ],
    },
    mutations: {
      convention: { mutations: defaultConfig.conventions!.resolvers!.mutations },
      files: [
        path.resolve(__dirname, '..', '.testdata/subfolder1/mutations.ts'),
        path.resolve(__dirname, '..', '.testdata/subfolder1/subfolder2/mutations.js'),
      ],      
    }
  }

  const expectedOutputDatasourceFiles: FilesOfConvention = {
    Datasource: {
      convention: defaultConfig.conventions!.datasources!,
      files: [
        path.resolve(__dirname, '..', '.testdata/Datasource.ts'),
        path.resolve(__dirname, '..', '.testdata/subfolder1/Datasource.ts'),
        path.resolve(__dirname, '..', '.testdata/subfolder1/subfolder2/Datasource.ts'),
      ],    
    }
  }
  it('returns expected schema files', () => {
    expect(getFilesOfConventions(path.resolve(__dirname, '..', '.testdata'), defaultConfig.conventions!.types!, mockFileExtensions)).toEqual(expectedOutputSchemaFiles)
  })

  it('returns expected resolver files', () => {
    expect(getFilesOfConventions('../.testdata', defaultConfig.conventions!.resolvers!, mockFileExtensions)).toEqual(expectedOutputResolverFiles)
  })

  it('returns expected datasource files', () => {
    expect(getFilesOfConventions('../.testdata', defaultConfig.conventions!.datasources!, mockFileExtensions)).toEqual(expectedOutputDatasourceFiles)
  })

})