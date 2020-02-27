# apollo-server-autoloader - Autoload your typeDefs, resolvers and datasources

This package enables autoloading of schemas, resolvers and datasources based on configurable naming conventions.

## Install

```bash
npm i apollo-server-autoloader
# or
yarn add apollo-server-autoloader
```

## Usage

The following example asumes, that you define your types, resolvers and datasources in the `api` folder of your project.

```js
import * as path from 'path'
import { buildFederatedSchema } from '@apollo/federation'
import { ApolloServer } from '...'
import { Autoloader } from 'apollo-server-autoloader'

const autoloaderConfig = {
  searchPaths: [path.resolve(__dirname, 'api')]
}

const createServer = async () => {
  import autoloader = Autoloader(autoloaderConfig)
  const typeDefs = await autoloader.getTypeDefs()
  const resolvers = await autoloader.getResolvers()
  const datasources = await autoloader.getDatasources()

  return new ApolloServer({
    dataSources,
    schema: buildFederatedSchema([{ typeDefs, resolvers }])
    ...
  });
}
```

## Autoloader config

```js
interface AutoloaderConfig {
  // (required) search paths
  searchPaths: string[]
  // naming conventions
  conventions?: FileNamingConventions
  // which file extensions should be considered
  fileExtensions?: string[]
  // which files should be excluded (regex)
  exclude: string[]
}

interface FileNamingConventions {
  // naming conventions for schema files
  types?: NamingConvention
  // naming conventions for resolver files
  resolvers?: NamingConvention
  // naming conventions for datasource files
  datasources?: NamingConvention
}

interface NamingConvention {
  // The "key" is the pattern for the file name
  // The ExportPattern is the pattern for the export variable
  //  If your schemas for example are located in files
  // which are named "schema.ts" and they provide an export 
  // variable named "typeDef" the naming convention would look like follows:
  // { schema: 'typeDef' }
  [key: string]: ExportPattern
}
```

## Example Config

Asume your project structure looks like follows:

```
|- /api
|- |- schemaFile.ts
|- |- queriesFile.ts
|- |- mutationsFile.ty
|- |- DatasourceFile.ts
|- |- /subolder
|- |- |- schemaFile.ts
...
```

Your file exports look like follows:

```js
// schemaFile.ts
export const myTypeDef = gql`...`
// queriesFile.ts
export const myQueries = { ... }
// mutationsFile.ts
export const myMutations = { ... }
// DatasourceFile.ts
export class MyDatasource { ... }
```

In this case the corresponding config for the autoloader should look like follows:

```js
const config = {
  searchPaths: [path.resolve(__dirname, 'api')],
  conventions: {
    types: {
      schemaFile: 'myTypeDef',
    },
    resolvers: {
      queriesFile: 'myQueries',
      mutationsFile: 'myMutations',
    },
    datasources: {
      DatasourceFile: 'MyDatasource',
    }
  },
  fileExtensions: ['.ts'],
  exclude: ['[^\/]+\.(spec|test)', '__tests__'],
}
```

### Default config

The **default config** for the autoloader looks like follows:

```js
export const defaultConfig: AutoloaderConfig = {
  searchPaths: ['.'],
  conventions: {
    types: { schema: 'typeDef' },
    resolvers: { queries: 'queries', mutations: 'mutations' },
    datasources: { Datasource: 'Datasource' },
  },
  fileExtensions: ['ts']
}
```

If you don't change the config, this means you must name your schema files `schema.ts`, your resolver files `queries.ts` or `mutations.ts` and your datasource files `Datasource.ts`. The export for schema files must be named `typeDef`, for resolver files `queries` or `mutations` and `Datasource` for datasource files.
