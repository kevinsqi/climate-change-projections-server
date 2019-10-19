require('dotenv').config();
const axios = require('axios');
const express = require('express');
const morgan = require('morgan');
const app = express();
const knex = require('./db/knex');

// Logging
app.use(morgan('combined'));

// Parse incoming request JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const router = express.Router();
router.get('/location', (req, res) => {
  if (!req.query.address) {
    return res.status(400).json({ error: 'MISSING_ADDRESS' });
  }
  axios
    .get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: req.query.address,
        key: process.env.GOOGLE_MAPS_PLATFORM_KEY,
      },
    })
    .then((response) => {
      if (response.data.results.length === 0) {
        return res.status(404).json({ error: 'NO_GEOCODING_RESULTS' });
      }
      const { lat, lng } = response.data.results[0].geometry.location;
      // TODO: fix sql injection, '?' and bindings isn't working with <->?
      return Promise.all([
        knex.raw(
          `
        SELECT * FROM temperatures_cmip5
        ORDER BY geography <-> 'SRID=4326;POINT(${lng} ${lat})'
        LIMIT 1
      `,
        ),
        knex.raw(
          `
        SELECT * FROM noaa_projections
        WHERE ST_Distance(
          ST_Transform('SRID=4326;POINT(${lng} ${lat})'::geometry, 3857),
          ST_Transform(noaa_projections.geography::geometry, 3857)
        ) < 50000
        ORDER BY geography <-> 'SRID=4326;POINT(${lng} ${lat})'
        LIMIT 1
        `,
        ),
      ]);
    })
    .then(([temperatureResult, noaaResult]) => {
      return res.status(200).json({
        temperature: temperatureResult.rows[0],
        noaa: noaaResult.rows[0],
      });
    })
    .catch((error) => {
      console.error(error);
    });
});
app.use('/api', router);

// Listen
const port = process.env.PORT;
app.listen(port, () => console.log(`Server listening on port ${port}`));
