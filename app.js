const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const app = express();

app.use(bodyParser.json());

// Import booking routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use("/booking", bookingRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
