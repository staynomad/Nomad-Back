const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const https = require('https');

const { DATABASE_URI, environment } = require('./config');
const loginRouter = require('./routes/login');
const signUpRouter = require('./routes/signup');
const roommateRouter = require('./routes/roommates');
const listingRouter = require('./routes/listing');
const questionnaireRouter = require('./routes/questionnaire');
const reservationRouter = require('./routes/reservation');
const paymentRouter = require('./routes/payment');
const payoutsRouter = require('./routes/payout.js');
const userRouter = require('./routes/user');
const accountVerificationRouter = require('./routes/accountVerification');
const reviewRouter = require('./routes/reviews');
const subscribeRouter = require('./routes/subscribe');
const contactRouter = require('./routes/contact');
const googleLoginRouter = require('./routes/googleLogin');
const exportsRouter = require('./routes/exports.js');
const adminVerifyRouter = require('./routes/adminVerification');
const containerRouter = require('./routes/container');
const pingRouter = require('./routes/ping');
const housekeepingRouter = require('./routes/housekeeping');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use(morgan('dev'));
app.use('/contact', contactRouter);
app.use('/login', loginRouter);
app.use('/signup', signUpRouter);
app.use('/roommates', roommateRouter);
app.use('/listings', listingRouter);
app.use('/questionnaire', questionnaireRouter);
app.use('/reservation', reservationRouter);
app.use('/payment', paymentRouter);
app.use('/payouts', payoutsRouter);
app.use('/user', userRouter);
app.use('/accountVerification', accountVerificationRouter);
app.use('/reviews', reviewRouter);
app.use('/subscribe', subscribeRouter);
app.use('/contact', contactRouter);
app.use('/googleLogin', googleLoginRouter);
app.use('/exports', exportsRouter);
app.use('/adminVerify', adminVerifyRouter);
app.use('/container', containerRouter);
app.use('/ping', pingRouter);
app.use('/housekeeping', housekeepingRouter);

mongoose.connect(DATABASE_URI, {
  useCreateIndex: true,
  useFindAndModify: false, // flag needed to enable findOneAndUpdate
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build/'));
  app.get('*', (_, res) => {
    res.sendFile(
      path.resolve(__dirname, '..', 'client', 'build', 'index.html'),
    );
  });
}

app.get('/', async (req, res) => {
  res.json('Server is running!');
});

// error handler\
app.use((err, req, res, next) => {
  console.log(err);
  const isProduction = environment === 'production';
  res.status(err.status || 500).json({
    title: err.title || 'Server Error',
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

const pingHealthCheck = async () => {
  await https
    .get('https://hc-ping.com/aa5812c2-7b3f-4572-b7cb-5c2ee53bc3fa')
    .on('error', (err) => {
      console.log('Ping failed: ' + err);
    });
};

const cron = require('node-cron');
const { AppStream } = require('aws-sdk');
cron.schedule('0 0 * * *', require('./config/taskScheduler'), {
  timezone: 'America/Los_Angeles',
});
cron.schedule('0 8 * * * *', pingHealthCheck, {
  timezone: 'America/Los_Angeles',
});

module.exports = app;
