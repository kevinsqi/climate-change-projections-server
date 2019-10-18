const express = require('express');
const app = express();


// Parse incoming request JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const router = express.Router();
router.get('/location', (req, res) => {
  const name = req.query.name;

  return res.status(200).json({
    name,
  });
});
app.use('/api', router);


// Listen
const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
