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
    const fullRecord = {
      attribute: 'temperature_increase',
      year_start: 2080,
      year_end: 2100,
      ...record,
    };
    return knex.raw(
      `
        INSERT INTO temperatures_cmip5 (
          place_name,
          attribute,
          year_start,
          year_end,
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
          :attribute,
          :year_start,
          :year_end,
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
      fullRecord,
    );
  });
}

function load_noaa_climate_explorer(knex) {
  const files = [
    {
      attribute: 'num_days_above_100f',
      place_name: 'San Francisco, CA',
      lat: 37.773972,
      lon: -122.431297,
      path: 'san_francisco_num_days_above_100f.csv',
    },
    {
      attribute: 'num_dry_days',
      place_name: 'San Francisco, CA',
      lat: 37.773972,
      lon: -122.431297,
      path: 'san_francisco_num_dry_days.csv',
    },
    {
      attribute: 'num_days_above_100f',
      place_name: 'Laredo, TX',
      lat: 27.506748,
      lon: -99.502914,
      path: 'laredo_tx_num_days_above_100f.csv',
    },
    {
      attribute: 'num_dry_days',
      place_name: 'Laredo, TX',
      lat: 27.506748,
      lon: -99.502914,
      path: 'laredo_tx_num_dry_days.csv',
    },
    {
      attribute: 'num_dry_days',
      place_name: 'Idaho Falls, ID',
      lat: 43.49165,
      lon: -112.033966,
      path: 'idaho_falls_num_dry_days.csv',
    },
  ];

  return files
    .map((file) => {
      const csv = fs.readFileSync(
        path.join(__dirname, '../../data/noaa_climate_explorer', file.path),
      );
      const records = parse(csv, { columns: true });
      console.log(`${file.attribute} ${file.place_name} CSV parsed, records:`, records.length);

      return records.map((record) => {
        const { year, rcp45_weighted_mean, rcp45_min, rcp45_max, rcp85_min, rcp85_max } = record;

        const fullRecord = {
          attribute: file.attribute,
          place_name: file.place_name,
          // TODO: automate this with google geolocation queries
          lat: file.lat,
          lon: file.lon,
          year,
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
            year,
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
            :year,
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
    })
    .flat();
}

exports.seed = function(knex) {
  const insertions = [];
  insertions.push(...load_cmip5(knex));
  insertions.push(...load_noaa_climate_explorer(knex));
  return Promise.all(insertions);
};
