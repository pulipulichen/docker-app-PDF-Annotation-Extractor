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
    annotations.forEach(annotation => {
      // console.log(annotation.length)
      if (annotation.type !== '/FreeText') {
        // console.log(annotation)
        return false
      }

      let contents = annotation.contents.trim()
      // console.log(contents)

      output.push(contents)
    })
  })

  return output
}