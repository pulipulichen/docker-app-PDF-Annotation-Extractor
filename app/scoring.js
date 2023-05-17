// const ShellSpawn = require('./lib/ShellSpawn')
const GetExistedArgv = require('./lib/GetExistedArgv')

const path = require('path')
const fs = require('fs')

// const ExtractAnnotation = require('./lib-pdf/ExtractAnnotation.js')
// const SplitPDF = require('./lib-pdf/SplitPDF.js')

let main = async function () {
  let files = GetExistedArgv()

  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    if (file.endsWith('.anno.txt') === false) {
      continue
    }

    let filename = path.basename(file)
    let filenameNoExt = filename
    if (filenameNoExt.endsWith('.anno.txt')) {
      filenameNoExt = filenameNoExt.slice(0, -4)
    }

    // -----------------------

    let annotations = fs.readFileSync(file, 'utf-8')
    // console.log(annotations)
    let dirname = path.dirname(file)
    let outputFilePath = path.resolve(dirname, filenameNoExt + '.anno.csv')
    fs.writeFileSync(outputFilePath, scoring(annotations), 'utf-8')
  }
}

let scoring = function (annotations) {
  let lines = annotations.trim().split('\n').map(line => line.trim()).filter(line => (line !== ''))

  let students = {}

  let id = null
  let qArray = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    if (line.startsWith('|')) {
      line = line.slice(1).trim()
      id = Number(line)
      continue
    }
    else if (line.startsWith('q') && line.indexOf('.') > -1 && id !== null) {
      let parts = line.slice(1).split('.').map(p => Number(p.trim()))
      let q = parts[0]
      let score = parts[1]

      if (!students[id]) {
        students[id] = {}
      }

      if (students[id][q]) {
        throw Error(`overwrite!! ${id} : q${q}`)
      }

      students[id][q] = score

      if (qArray.indexOf(q) === -1) {
        qArray.push(q)
      }
    }
  }

  // -------------
  // 輸出

  qArray.sort()
  console.log(qArray)

  let idArray = Object.keys(students).map(s => Number(s))
  idArray.sort()

  let output = [
    ['id'].concat(qArray).concat(['total', 'adj_total']).join(',')
  ]

  console.log(idArray)
  let scoreArray = {}
  let qList = []

  for (let i = 0; i < idArray.length; i++) {
    let id = idArray[i]
    console.log(id)
    let line = [
      id
    ]

    let scores = []
    let total = 0

    for (let j = 0; j < qArray.length; j++) {
      let q = qArray[j]
      let score = 0
      if (students[id][q]) {
        score = students[id][q]
      }

      scores.push(score)
      total = total + score

      if (!scoreArray[q]) {
        scoreArray[q] = []
        qList.push(q)
      }
      scoreArray[q].push(score)
    }

    line = line.concat(scores)
    line.push(total)

    if (total > 100) {
      line.push(100)
    }
    else {
      line.push(total)
    }
    

    output.push(line.join(','))
  }

  // -------------------

  qList = qList.sort()
  const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

  let scoreArrayAvg = []
  let scoreArrayMax = []
  let scoreArrayPercent = []
  for (let i = 0; i < qList.length; i++) {
    let q = qList[i]

    let scoreList = scoreArray[q]
    let avg = average(scoreList)
    avg = Math.round(avg * 10) / 10
    scoreArrayAvg.push(avg)

    let max = Math.max(...scoreList)
    scoreArrayMax.push(max)
    
    let percent = Math.round((avg / max) * 100)
    scoreArrayPercent.push(percent)
  }

  output.push(['average'].concat(scoreArrayAvg).join(','))
  output.push(['max'].concat(scoreArrayMax).join(','))
  output.push(['percent'].concat(scoreArrayPercent).join(','))

  // -------------------

  output.push(`participants,${idArray.length}`)

  // -------------------

  console.log(output.join('\n'))
  return output.join('\n')
}

main()
