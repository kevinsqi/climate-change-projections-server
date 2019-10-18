
exports.up = function(knex) {
  return knex.schema.raw(`
    CREATE TABLE temperatures_cmip5 (
      id integer PRIMARY KEY,
      place_name text NOT NULL,
      lat float8 NOT NULL,
      lon float8 NOT NULL,
      observed_warming float8 NOT NULL,
      model_26_warming float8 NOT NULL,
      model_45_warming float8 NOT NULL,
      model_60_warming float8 NOT NULL,
      model_85_warming float8 NOT NULL,
      geography geography
    );
  `);
};

exports.down = function(knex) {
  console.warn('Down migration not implemented');  
};
