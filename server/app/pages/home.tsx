import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { ResolvedPageRoute, Routes } from '../routes.js'
import { title } from '../../config.js'
import Style from '../components/style.js'
import { Locale, LocaleVariants } from '../components/locale.js'
import { Link } from '../components/router.js'

// Calling <Component/> will transform the JSX into AST for each rendering.
// You can reuse a pre-compute AST like `let component = <Component/>`.

// If the expression is static (not depending on the render Context),
// you don't have to wrap it by a function at all.

let style = Style(/* css */ `
`)

let content = (
  <div id="home">
    <h1>
      <Locale en="Home" zh_hk="主頁" zh_cn="主页" />
    </h1>

    <p>
      <Locale
        en="This is a simple color mixing game."
        zh_hk="這是一個簡單的顏色混合遊戲。"
        zh_cn="这是一个简单的颜色混合游戏。"
      />
    </p>

    <p>
      <Locale
        en="In each level, you have to mix the existing colors to match the target color."
        zh_hk="在每個關卡中，你需要混合現有的顏色以匹配目標顏色。"
        zh_cn="在每个关卡中，你需要混合现有的颜色以匹配目标颜色。"
      />
    </p>

    <Link href="/play">
      <Locale en="Start Playing" zh_hk="開始遊戲" zh_cn="开始游戏" />
    </Link>

    <SourceCode page="home.tsx" />
  </div>
)

let home = (
  <>
    {style}
    {content}
  </>
)

// And it can be pre-rendered into html as well

let route: LocaleVariants<ResolvedPageRoute> = {
  en: {
    title: title('Home'),
    description:
      'Getting Started with ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
    node: prerender(home, { language: 'en' }),
  },
  zh_hk: {
    title: title('主頁'),
    description:
      '開始使用 ts-liveview - 一個具有漸進增強功能的伺服器端渲染即時網頁應用框架',
    node: prerender(home, { language: 'zh_hk' }),
  },
  zh_cn: {
    title: title('主页'),
    description:
      '开始使用 ts-liveview - 一个具有渐进增强功能的服务器端渲染即时网页应用框架',
    node: prerender(home, { language: 'zh_cn' }),
  },
}

let routes = {
  '/': {
    menuText: <Locale en="Home" zh_hk="主頁" zh_cn="主页" />,
    resolve(context) {
      return Locale(route, context)
    },
  },
} satisfies Routes

export default { routes }
