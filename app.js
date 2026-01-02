import express from 'express';
import { shortenerRouter } from './routes/shortener.route.js';
import { authRouter } from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

const app = express();

// * To set template engine
app.set('view engine','ejs');

// * add static file (style, image, static docs)
app.use(express.static('public'))

// * use middleware for post method
app.use(express.urlencoded({extended:true}));

// * use cookie-parser as a middleware
app.use(cookieParser());

// * all router file write here
app.use(authRouter);
app.use(shortenerRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})
