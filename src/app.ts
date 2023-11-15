import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { userRoutes } from './routes/userRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.use(cors());

const allowedOrigins = ['https://poip.vercel.app'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
