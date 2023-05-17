const {AnnotationFactory} = require('annotpdf');
const path = require('path')

module.exports = async function (inputFile) {

  // console.log(AnnotationFactory.loadFile)
  let factory = await AnnotationFactory.loadFile(inputFile)
  let filename = path.basename(inputFile)
  if (filename.indexOf('.') > -1) {
    filename = filename.slice(0, filename.lastIndexOf('.'))
  }
  
  let pages = await factory.getAnnotations()

  let output = []
  // console.log()
  pages.forEach((annotations, page_number) => {
    console.log('Page', page_number)

    let outputInPage = []
    annotations.forEach(annotation => {
      // console.log(annotation.length)
      if (annotation.type !== '/FreeText') {
        // console.log(annotation)
        return false
      }

      let contents = annotation.contents.trim()
      // console.log(contents)

      outputInPage.push(contents)
    })

    outputInPage.sort((a, b) => {
      let a1 = a.trim().slice(0, 1)
      let b1 = b.trim().slice(0, 1)
      if (a1 === '|') {
        return true
      }
      else if (b1 === '|') {
        return false
      }

      return (a > b)
    })

    output = output.concat(outputInPage)
  })

  return output
}