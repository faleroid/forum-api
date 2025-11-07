/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    body: {
      type: 'text',
      notNull: true,
    },
    owner: {
      type: 'varchar(50)',
      notNull: true,
    },
    date: {
      type: 'timestamptz',
      notNull: true,
    },
  });

  pgm.addConstraint('threads', 'fk_threads.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('threads', 'fk_threads.owner_users.id');
  pgm.dropTable('threads');
};