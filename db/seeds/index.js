const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');

exports.seed = function(knex) {
  const csv = fs.readFileSync(path.join(__dirname, '../../data/cmip5.csv'));
  const records = parse(csv, { columns: true });
  console.log('CSV parsed, records:', records.length);

  // Geography column:
  // https://stackoverflow.com/questions/8150721/which-data-type-for-latitude-and-longitude
  const insertions = records.map((record) => {
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
          model_85_warming,
          geography
        )
        VALUES (
          :place_name,
          :lat_label,
          :lon_label,
          :obs_warming,
          :model_26_warming,
          :model_45_warming,
          :model_60_warming,
          :model_85_warming,
          'SRID=4326;POINT(${record.lon_label} ${record.lat_label})'
        )
      `,
      record,
    );
  });
  return Promise.all(insertions);
};
