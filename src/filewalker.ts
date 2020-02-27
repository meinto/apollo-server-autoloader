import _ from 'lodash'
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

export const getConventions = (searchPaths: string[], searchPatterns: NamingConvention, fileExtensions: string[], exclude: string[]): FilesOfConvention => {
  const filesOfConvention: FilesOfConvention = {}
  searchPaths.forEach(dir => {
    const conventionsOfDir = getConventionsForPath(dir, searchPatterns, fileExtensions, exclude)
    Object.keys(conventionsOfDir).forEach(key => {
      const conventionOfDir = conventionsOfDir[key]
      const availableConvention = filesOfConvention[key]
      if (availableConvention) {
        const availableFiles = availableConvention.files
        filesOfConvention[key] = {
          ...conventionOfDir,
          files: [...availableFiles, ...conventionOfDir.files]
        }
      } else {
        filesOfConvention[key] = conventionOfDir
      }
    })
  })
  return filesOfConvention
}

export const getConventionsForPath = (dir: string, searchPatterns: NamingConvention, fileExtensions: string[], exclude: string[]): FilesOfConvention => {
  const filesOfConvention: FilesOfConvention = {}
  const relativeDirPathes = fs.readdirSync(path.resolve(__dirname, dir))
  const fileNamePatterns = Object.keys(searchPatterns)
  fileNamePatterns.forEach(fileNamePattern => {
    const convention = searchPatterns[fileNamePattern]
    let files: string[] = []
    for (let ipath = 0; ipath < relativeDirPathes.length; ipath++) {
      const relativePath = relativeDirPathes[ipath]
      const absolutePath = path.resolve(__dirname, dir, relativePath)
      const pathStats = fs.statSync(absolutePath)
      
      let shouldExclude = false
      for (let iexclude = 0; iexclude < exclude.length; iexclude++) {
        const excludePattern = exclude[iexclude]
        const excludeRegExp = new RegExp(excludePattern)
        shouldExclude = excludeRegExp.test(absolutePath)
        if (shouldExclude) break
      }

      if (pathStats && pathStats.isDirectory()) {
        const fileOfSubPath = getConventionsForPath(absolutePath, searchPatterns, fileExtensions, exclude)[fileNamePattern].files
        files = files.concat(fileOfSubPath)
      } else if (!shouldExclude && absolutePath.indexOf(fileNamePattern) > 0) {
        fileExtensions.forEach(ext => {
          if (absolutePath.endsWith(ext)) {
            files.push(absolutePath)
          }
        })
      }
    }
    filesOfConvention[fileNamePattern] = {
      convention: { [fileNamePattern]: convention },
      files,
    }
  })
  return filesOfConvention
}