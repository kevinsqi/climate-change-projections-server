const express = require('express');
const app = express();

const knex = require('./db/knex');

// Parse incoming request JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const router = express.Router();
router.get('/location', (req, res) => {
  const { lat, lon } = req.query;

  if (lat == null || lon == null) {
    return res.status(400).json({
      error: 'LAT_AND_LON_REQUIRED',
    });
  }

  knex.raw(`
    SELECT * FROM temperatures_cmip5
    ORDER BY geography <-> 'SRID=4326;POINT(-122.401780 37.797650)'
    LIMIT 1
  `).then((result) => {
    return res.status(200).json({
      query: {
        lat: lat,
        lon: lon,
      },
      result: result.rows[0],
    });
  });
});
app.use('/api', router);


// Listen
const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
