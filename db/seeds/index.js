const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');

exports.seed = function(knex) {
  const csv = fs.readFileSync(path.join(__dirname, '../../data/cmip5.csv'));
  const records = parse(csv, { columns: true });
  const insertions = records.map((record) => {
    console.log(record);
    return knex.raw(
      `
        INSERT INTO temperatures_cmip5 (
          place_name,
          lat,
          lon,
          observed_warming,
          model_26_warming,
          model_45_warming,
          model_60_warming,
          model_85_warming
        )
        VALUES (
          :place_name,
          :lat_label,
          :lon_label,
          :obs_warming,
          :model_26_warming,
          :model_45_warming,
          :model_60_warming,
          :model_85_warming
        )
      `,
      record
    );
  });
  return Promise.all(insertions);
};
