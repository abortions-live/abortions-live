const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.disable("x-powered-by");
app.use(express.static(
    path.join(__dirname,'')
));
app.use((req, res, next) => { bodyParser.json()(req, res, next); });


app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './' });
})

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

