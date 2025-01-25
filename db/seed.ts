import { seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'

// This file serve like the knex seed file.
//
// You can setup the database with initial config and sample data via the db proxy.

if (proxy.color.length == 0) {
  seedRow(proxy.color, { css: 'rgb(255, 255, 255)' })
  seedRow(proxy.color, { css: 'rgb(255, 0, 0)' })
  seedRow(proxy.color, { css: 'rgb(0, 255, 0)' })
  seedRow(proxy.color, { css: 'rgb(0, 0, 255)' })
  seedRow(proxy.color, { css: 'rgb(0, 0, 0)' })
}
