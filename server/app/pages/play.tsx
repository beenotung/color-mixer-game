import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  throwIfInAPI,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { getAuthUser } from '../auth/user.js'
import { Script } from '../components/script.js'
import { Locale } from '../components/locale.js'
import { EarlyTerminate } from '../../exception.js'

let pageTitle = 'Play'
let addPageTitle = 'Add Play'

let style = Style(/* css */ `
#Play {

}
#targetContainer {
  display: flex;
  gap: 1rem;
  align-items: center;
}
#colorPanel {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.color--cell {
  outline: 1px solid black;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color--cell.selected {
  transform: scale(1.25);
}
#mixedColor {
}
.color--label {
  font-size: 1.5rem;
  color: #000000;
  background-color: #ffffff;
  padding: 0.25rem;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn {
  font-size: 1.25rem;
  margin-top: 0.5rem;
}
`)

let script = Script(/* js */ `
function toggleSelected(event) {
  let cell = event.target
  if (cell.classList.contains('selected')) {
    cell.classList.remove('selected')
    return
  }
  let cells = document.querySelectorAll('#colorPanel .color--cell.selected')
  if (cells.length === 2) {
    let a = cells[0]
    let b = cells[1]
    if (a.markTime < b.markTime) {
      a.classList.remove('selected')
    } else {
      b.classList.remove('selected')
    }
  }
  cell.classList.add('selected')
  cell.markTime = Date.now()
  cells = document.querySelectorAll('#colorPanel .color--cell.selected')
  if (cells.length === 2) {
    let tColor = targetColor.style.backgroundColor
    let aColor = cells[0].style.backgroundColor
    let bColor = cells[1].style.backgroundColor
    let cColor = mixColor(aColor, bColor)
    console.log({ aColor, bColor, cColor, tColor })
    mixedColor.style.backgroundColor = cColor
    let matched = cColor == tColor
    if (!matched) {
      mixedColorText.textContent = '✖'
      return
    }
    mixedColorText.textContent = '✔'
    emit('/play/submit', { aColor, bColor })
  }
}
${parseColor}
${mixColor}
`)

let page = (
  <>
    {style}
    <div id="Play">
      <h1>
        <Locale en="Game Room" zh_hk="遊戲室" zh_cn="游戏室" />
      </h1>
      <Main />
    </div>
    {script}
  </>
)

let colors: string[] = [
  'rgb(255, 255, 255)',
  'rgb(255, 0, 0)',
  'rgb(0, 255, 0)',
  'rgb(0, 0, 255)',
  'rgb(0, 0, 0)',
]

let target = pickRandomTargetColor()

function parseColor(text: string) {
  // e.g. "rgb(255, 0, 0)"
  let [r, g, b] = text.slice(4, -1).split(',').map(Number)
  return [r, g, b]
}

function mixColor(aColor: string, bColor: string) {
  let aValues = parseColor(aColor)
  let bValues = parseColor(bColor)
  // let cValues = [
  //   Math.min(255, aValues[0] + bValues[0]),
  //   Math.min(255, aValues[1] + bValues[1]),
  //   Math.min(255, aValues[2] + bValues[2]),
  // ]
  let cValues = [
    Math.floor((aValues[0] + bValues[0]) / 2),
    Math.floor((aValues[1] + bValues[1]) / 2),
    Math.floor((aValues[2] + bValues[2]) / 2),
  ]
  return 'rgb(' + cValues.join(', ') + ')'
}

function pickRandomColor() {
  let index = Math.floor(Math.random() * colors.length)
  return colors[index]
}

function pickRandomTargetColor() {
  for (let i = 0; i < 1000; i++) {
    let aColor = pickRandomColor()
    let bColor = pickRandomColor()
    console.log('pickRandomTargetColor', { aColor, bColor })
    if (aColor == bColor) continue
    let cColor = mixColor(aColor, bColor)
    if (colors.includes(cColor)) continue
    return { aColor, bColor, cColor }
  }
  throw 'Failed to pick random target color'
}

function Main(attrs: {}, context: Context) {
  let user = getAuthUser(context)
  return (
    <>
      <h3>
        <Locale en="Target Color" zh_hk="目標顏色" zh_cn="目标颜色" />
      </h3>
      <div id="targetContainer">
        <div
          id="targetColor"
          class="color--cell"
          style={`background-color: ${target.cColor}`}
        ></div>
        <span>=</span>
        <div id="aColor" class="color--cell">
          <span class="color--label">?</span>
        </div>
        <span>+</span>
        <div id="bColor" class="color--cell">
          <span class="color--label">?</span>
        </div>
      </div>
      <button class="btn" onclick="emit('/play/hint')">
        <Locale en="Hint" zh_hk="提示" zh_cn="提示" />
      </button>
      <h3>
        <Locale en="Color Panel" zh_hk="顏色面板" zh_cn="颜色面板" />
      </h3>
      <div id="colorPanel">
        {mapArray(colors, color => (
          <div
            class="color--cell"
            style={`background-color: ${color}`}
            onclick="toggleSelected(event)"
          ></div>
        ))}
      </div>
      <h3>
        <Locale en="Mixed Color" zh_hk="混合顏色" zh_cn="混合颜色" />
      </h3>
      <div id="mixedColor" class="color--cell">
        <span id="mixedColorText" class="color--label">
          ?
        </span>
      </div>
    </>
  )
}

let submitParser = object({
  aColor: string(),
  bColor: string(),
})

function Hint(attrs: {}, context: DynamicContext) {
  if (context.type != 'ws') {
    throw 'This endpoint is only available via websocket'
  }
  let hint = Math.random() < 0.5 ? target.aColor : target.bColor
  context.ws.send([
    'update-attrs',
    '#aColor',
    { style: `background-color: ${hint}` },
  ])
  throw EarlyTerminate
}

function Submit(attrs: {}, context: DynamicContext) {
  try {
    if (context.type != 'ws') {
      throw 'This endpoint is only available via websocket'
    }
    // let user = getAuthUser(context)
    // if (!user) throw 'You must be logged in to submit ' + pageTitle

    let input = submitParser.parse(context.args?.[0])

    if (!colors.includes(input.aColor)) {
      throw `Color not found: ${input.aColor}`
    }
    if (!colors.includes(input.bColor)) {
      throw `Color not found: ${input.bColor}`
    }

    let cColor = mixColor(input.aColor, input.bColor)
    if (cColor != target.cColor) {
      throw `Mixed color ${cColor} does not match target color ${target.cColor}`
    }

    colors.push(target.cColor)

    target = pickRandomTargetColor()

    return <Redirect href={`/play`} />
  } catch (error) {
    return (
      <>
        {page}
        {Script(`alert(${JSON.stringify(String(error))})`)}
      </>
    )
  }
}

let routes = {
  '/play': {
    menuText: pageTitle,
    resolve(context) {
      let t = Locale(
        {
          en: 'Game Room',
          zh_hk: '遊戲室',
          zh_cn: '游戏室',
        },
        context,
      )
      let description = Locale(
        {
          en: 'Mix two colors to match the target color',
          zh_hk: '混合兩個顏色以匹配目標顏色',
          zh_cn: '混合两个颜色以匹配目标颜色',
        },
        context,
      )
      return {
        title: title(t),
        description: description,
        node: page,
      }
    },
  },
  '/play/hint': {
    title: apiEndpointTitle,
    description: 'Get a hint to match the target color',
    node: <Hint />,
    streaming: false,
  },
  '/play/submit': {
    title: apiEndpointTitle,
    description: 'Submit two colors to match the target color',
    node: <Submit />,
    streaming: false,
  },
} satisfies Routes

export default { routes }
