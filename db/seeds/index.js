const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');

function load_cmip5(knex) {
  const csv = fs.readFileSync(path.join(__dirname, '../../data/cmip5.csv'));
  const records = parse(csv, { columns: true });
  console.log('cmip5 CSV parsed, records:', records.length);

  // Geography column:
  // https://stackoverflow.com/questions/8150721/which-data-type-for-latitude-and-longitude
  return records.map((record) => {
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
}

function load_noaa_climate_explorer(knex) {
  const csv = fs.readFileSync(
    path.join(__dirname, '../../data/noaa_climate_explorer/san_francisco_num_days_above_100f.csv'),
  );
  const records = parse(csv, { columns: true });
  console.log('CSV parsed, records:', records.length);

  return records.map((record) => {
    const { rcp45_weighted_mean, rcp45_min, rcp45_max, rcp85_min, rcp85_max } = record;

    const fullRecord = {
      attribute: 'num_days_above_100f',
      place_name: 'San Francisco, CA',
      // TODO: automate this with google geolocation queries
      lat: 37.773972,
      lon: -122.431297,
      rcp45_weighted_mean,
      rcp45_min,
      rcp45_max,
      rcp85_weighted_mean: record['rcp85_weighted mean'],
      rcp85_min,
      rcp85_max,
    };

    return knex.raw(
      `
        INSERT INTO noaa_projections (
          place_name,
          attribute,
          lat,
          lon,
          geography,
          rcp45_weighted_mean,
          rcp45_min,
          rcp45_max,
          rcp85_weighted_mean,
          rcp85_min,
          rcp85_max
        )
        VALUES (
          :place_name,
          :attribute,
          :lat,
          :lon,
          'SRID=4326;POINT(${fullRecord.lon} ${fullRecord.lat})',
          :rcp45_weighted_mean,
          :rcp45_min,
          :rcp45_max,
          :rcp85_weighted_mean,
          :rcp85_min,
          :rcp85_max
        )
      `,
      fullRecord,
    );
  });
}

exports.seed = function(knex) {
  const insertions = [];
  insertions.push(...load_cmip5(knex));
  insertions.push(...load_noaa_climate_explorer(knex));
  return Promise.all(insertions);
};
