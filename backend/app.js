const express = require('express');

const app = express();
const PORT = 3000;

app.listen(PORT, (error) =>{
    if(!error)
        console.log("App listening on port: "+ PORT);
    else 
        console.log("server error", error);
    }
);