import * as fs from 'fs'
import * as path from 'path'

import { NamingConvention } from './__types__/conventions'

interface Matching {
  convention: NamingConvention,
  files: string[],
}

export interface FilesOfConvention {
  [key: string]: Matching
}

export const getFilesOfConventions = (dir: string, searchPatterns: NamingConvention, fileExtensions: string[]): FilesOfConvention => {
  const filesOfConvention: FilesOfConvention = {}
  const relativeDirPathes = fs.readdirSync(path.resolve(__dirname, dir))
  const fileNamePatterns = Object.keys(searchPatterns)
  fileNamePatterns.forEach(fileNamePattern => {
    const convention = searchPatterns[fileNamePattern]
    let files: string[] = []
    relativeDirPathes.forEach((relativePath: string) => {
      const absolutePath = path.resolve(__dirname, dir, relativePath)
      const pathStats = fs.statSync(absolutePath)
      if (pathStats && pathStats.isDirectory()) {
        const fileOfSubPath = getFilesOfConventions(absolutePath, searchPatterns, fileExtensions)[fileNamePattern].files
        files = files.concat(fileOfSubPath)
      } else if (absolutePath.indexOf(fileNamePattern) > 0) {
        fileExtensions.forEach(ext => {
          if (absolutePath.endsWith(ext)) {
            files.push(absolutePath)
          }
        })
      }
    })
    filesOfConvention[fileNamePattern] = {
      convention: { [fileNamePattern]: convention },
      files,
    }
  })
  return filesOfConvention
}