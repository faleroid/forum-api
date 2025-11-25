/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    owner: {
      type: 'varchar(50)',
      notNull: true,
    },
    comment_id: {
      type: 'varchar(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('likes', 'fk_likes.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('likes', 'fk_likes.comment_id_comments.id', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};