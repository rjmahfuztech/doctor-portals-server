const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.af2ol.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorPortals").collection("appointments");
  
  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.get('/patients', (req, res) => {
    appointmentCollection.find({})
    .toArray((err, data) => {
      res.send(data);
    })
  })


  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    appointmentCollection.find({date: date.date})
    .toArray((err, documents) => {
      res.send(documents);
    })
    
  })

});


app.get('/', (req, res) => {
  res.send('Do you find anything!')
})

app.listen(port);