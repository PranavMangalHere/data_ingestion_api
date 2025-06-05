// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ingestionRoutes = require('./routes/ingestionRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
MONGODB_URI = "mongodb+srv://raghavdua130:MERN123@cluster0.7x7u3.mongodb.net"
// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://raghavdua130:MERN123@cluster0.7x7u3.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/', ingestionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));