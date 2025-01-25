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
import { db } from '../../../db/db.js'

let pageTitle = 'Leader Board'
let addPageTitle = 'Add Leader Board'

let style = Style(/* css */ `
#LeaderBoard {

}
`)

let page = (
  <>
    {style}
    <div id="LeaderBoard">
      <h1>{pageTitle}</h1>
      <Main />
    </div>
  </>
)

let select_leader = db.prepare<
  void[],
  {
    user_id: number
    name: string | null
    count: number
  }
>(/* sql */ `
select
  user_id
, ifnull(user.nickname, user.username) as name
, count(*) as count
from color_mix
inner join user on user.id = color_mix.user_id
where user_id is not null
group by user_id
order by count desc
`)

function Main(attrs: {}, context: Context) {
  let user = getAuthUser(context)
  let leaders = select_leader.all()
  return (
    <>
      <ul>
        {mapArray(leaders, leader => {
          let name: string = leader.name || `#${leader.user_id}`
          return (
            <li>
              {name} ({leader.count})
            </li>
          )
        })}
      </ul>
      {user ? (
        <Link href="/leader-board/add">
          <button>{addPageTitle}</button>
        </Link>
      ) : (
        <p>
          You can add leader board after <Link href="/register">register</Link>.
        </p>
      )}
    </>
  )
}

let routes = {
  '/leader-board': {
    title: title(pageTitle),
    description: 'TODO',
    menuText: pageTitle,
    node: page,
  },
} satisfies Routes

export default { routes }
