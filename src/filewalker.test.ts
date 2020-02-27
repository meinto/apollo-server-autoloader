import * as path from 'path'
import { defaultConfig } from './autoloader'
import { getConventionsForPath, getConventions, FilesOfConvention } from './filewalker'

jest.mock('graphql', () => {})
jest.mock('apollo-server', () => {})

describe('filewalker', () => {

  describe('getConventionsForPath', () => {
    const mockFileExtensions = ['.ts', '.js']
    const expectedOutputSchemaFiles: FilesOfConvention = {
      schema: {
        convention: defaultConfig.conventions!.types!,
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/schema.js'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/schema.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/schema.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/subfolder2/schema.ts'),
        ],
      }
    }

    const expectedOutputResolverFiles: FilesOfConvention = {
      queries: {
        convention: { queries: defaultConfig.conventions!.resolvers!.queries },
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/queries.js'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/queries.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/subfolder2/queries.ts'),
        ],
      },
      mutations: {
        convention: { mutations: defaultConfig.conventions!.resolvers!.mutations },
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/mutations.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/subfolder2/mutations.js'),
        ],      
      }
    }

    const expectedOutputDatasourceFiles: FilesOfConvention = {
      Datasource: {
        convention: defaultConfig.conventions!.datasources!,
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/Datasource.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/Datasource.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/subfolder2/Datasource.ts'),
        ],    
      }
    }

    it('returns expected schema files', () => {
      expect(getConventionsForPath(
        path.resolve(__dirname, '..', '.testdata/searchFolder2'), 
        defaultConfig.conventions!.types!, 
        mockFileExtensions,
        defaultConfig.exclude!,
      )).toEqual(expectedOutputSchemaFiles)
    })

    it('returns expected resolver files', () => {
      expect(getConventionsForPath(
        '../.testdata/searchFolder2', 
        defaultConfig.conventions!.resolvers!, 
        mockFileExtensions,
        defaultConfig.exclude!,
      )).toEqual(expectedOutputResolverFiles)
    })

    it('returns expected datasource files', () => {
      expect(getConventionsForPath(
        '../.testdata/searchFolder2', 
        defaultConfig.conventions!.datasources!, 
        mockFileExtensions,
        defaultConfig.exclude!,
      )).toEqual(expectedOutputDatasourceFiles)
    })
  })

  describe('getConventions', () => {
    const mockFileExtensions = ['.ts']
    const searchPaths = ['../.testdata/searchFolder2', '../.testdata/searchFolder1']
    const expectedOutputSchemaFiles: FilesOfConvention = {
      schema: {
        convention: defaultConfig.conventions!.types!,
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/schema.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/schema.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/subfolder2/schema.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder1/schema.ts'),
        ],
      }
    }

    const expectedOutputResolverFiles: FilesOfConvention = {
      queries: {
        convention: { queries: defaultConfig.conventions!.resolvers!.queries },
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/queries.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/subfolder2/queries.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder1/queries.ts'),
        ],
      },
      mutations: {
        convention: { mutations: defaultConfig.conventions!.resolvers!.mutations },
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/mutations.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder1/mutations.ts'),
        ],      
      }
    }

    const expectedOutputDatasourceFiles: FilesOfConvention = {
      Datasource: {
        convention: defaultConfig.conventions!.datasources!,
        files: [
          path.resolve(__dirname, '..', '.testdata/searchFolder2/Datasource.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/Datasource.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder2/subfolder1/subfolder2/Datasource.ts'),
          path.resolve(__dirname, '..', '.testdata/searchFolder1/Datasource.ts'),
        ],    
      }
    }

    it('returns expected schema files', () => {
      expect(getConventions(
        searchPaths, 
        defaultConfig.conventions!.types!, 
        mockFileExtensions,
        defaultConfig.exclude!,
      )).toEqual(expectedOutputSchemaFiles)
    })

    it('returns expected resolver files', () => {
      expect(getConventions(
        searchPaths, 
        defaultConfig.conventions!.resolvers!, 
        mockFileExtensions,
        defaultConfig.exclude!,
      )).toEqual(expectedOutputResolverFiles)
    })

    it('returns expected datasource files', () => {
      expect(getConventions(
        searchPaths, 
        defaultConfig.conventions!.datasources!, 
        mockFileExtensions,
        defaultConfig.exclude!,
      )).toEqual(expectedOutputDatasourceFiles)
    })
  })

})