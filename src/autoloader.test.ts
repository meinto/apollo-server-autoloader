import { getConventions } from './filewalker'
import { defaultConfig, getImports } from './autoloader'

describe('autoloader', () => {
  describe('getImports', () => {
    const searchPaths = ['../.testdata/searchFolder2', '../.testdata/searchFolder1']

    it('returns imports for typeDefs', async() => {
      const filesOfConventions = getConventions(
        searchPaths, 
        defaultConfig.conventions!.types!, 
        defaultConfig.fileExtensions!,
        defaultConfig.exclude!,
      )
      const imports = await getImports(filesOfConventions)
      expect(imports).toEqual([
        'searchFolder2/schema.ts',
        'searchFolder2/subfolder1/schema.ts',
        'searchFolder2/subfolder1/subfolder2/schema.ts',
        'searchFolder1/schema.ts',
      ])
    })

    it('returns imports for resolvers', async() => {
      const filesOfConventions = getConventions(
        searchPaths, 
        defaultConfig.conventions!.resolvers!, 
        defaultConfig.fileExtensions!,
        defaultConfig.exclude!
      )
      const imports = await getImports(filesOfConventions)
      expect(imports).toEqual([
        'searchFolder2/subfolder1/queries.ts',
        'searchFolder2/subfolder1/subfolder2/queries.ts',
        'searchFolder1/queries.ts',
        'searchFolder2/subfolder1/mutations.ts',
        'searchFolder1/mutations.ts',
      ])
    })

    it('returns imports for datasources', async() => {
      const filesOfConventions = getConventions(
        searchPaths, 
        defaultConfig.conventions!.datasources!, 
        defaultConfig.fileExtensions!, 
        defaultConfig.exclude!
      )
      const imports = await getImports(filesOfConventions)
      expect(imports).toEqual([
        'searchFolder2/Datasource.ts',
        'searchFolder2/subfolder1/Datasource.ts',
        'searchFolder2/subfolder1/subfolder2/Datasource.ts',
        'searchFolder1/Datasource.ts',
      ])
    })
  })
})