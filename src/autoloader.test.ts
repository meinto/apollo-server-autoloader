import { getFilesOfConventions } from './filewalker'
import { defaultConfig, getImports, Autoloader } from './autoloader'

describe('autoloader', () => {
  describe('getImports', () => {
    it('returns imports for typeDefs', async() => {
      const filesOfConventions = getFilesOfConventions('../.testdata', defaultConfig.conventions!.types!, defaultConfig.fileExtensions!)
      const imports = await getImports(filesOfConventions)
      expect(imports).toEqual([
        'schema.ts',
        'subfolder1/schema.ts',
        'subfolder1/subfolder2/schema.ts',
      ])
    })

    it('returns imports for resolvers', async() => {
      const filesOfConventions = getFilesOfConventions('../.testdata', defaultConfig.conventions!.resolvers!, defaultConfig.fileExtensions!)
      const imports = await getImports(filesOfConventions)
      expect(imports).toEqual([
        'subfolder1/queries.ts',
        'subfolder1/subfolder2/queries.ts',
        'subfolder1/mutations.ts',
      ])
    })

    it('returns imports for datasources', async() => {
      const filesOfConventions = getFilesOfConventions('../.testdata', defaultConfig.conventions!.datasources!, defaultConfig.fileExtensions!)
      const imports = await getImports(filesOfConventions)
      expect(imports).toEqual([
        'Datasource.ts',
        'subfolder1/Datasource.ts',
        'subfolder1/subfolder2/Datasource.ts',
      ])
    })
  })
})