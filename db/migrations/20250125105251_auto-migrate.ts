import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('color'))) {
    await knex.schema.createTable('color', table => {
      table.increments('id')
      table.text('css').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('color_mix'))) {
    await knex.schema.createTable('color_mix', table => {
      table.increments('id')
      table.integer('a_color_id').unsigned().notNullable().references('color.id')
      table.integer('b_color_id').unsigned().notNullable().references('color.id')
      table.integer('c_color_id').unsigned().notNullable().references('color.id')
      table.integer('user_id').unsigned().nullable().references('user.id')
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('color_mix')
  await knex.schema.dropTableIfExists('color')
}
