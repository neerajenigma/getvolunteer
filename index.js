const express=require("express")
const app=express()
const cors=require('cors')
const path=require('path');
require("./connection/Connection")
const port=process.env.PORT || 8000
const router=require("./routes/Route");
// const midd=require("./middleware/Jwtauth.js");
const cookieparser=require('cookie-parser');

// const staticpath=path.join(__dirname,"/grocery/build")

// app.use(express.static(staticpath));
// app.use(cors());
console.log("req receive");
app.use(cors({
    credentials: true,
    origin: `http://localhost:8000`,
    optionsSuccessStatus: 200
  }));


//app.use(cookieparser);
app.use(express.json());
// app.use(midd);
app.use(router);
app.listen(port,()=>{
    console.log(`server on ${port} has been started.`)
})