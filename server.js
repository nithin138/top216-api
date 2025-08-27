require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');


const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());


// connect
connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/top216');


// routes
app.use('/api/submissions', require('./routes/submission'));


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));