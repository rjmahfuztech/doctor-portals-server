const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.af2ol.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorPortals").collection("appointments");
  const doctorCollection = client.db("doctorPortals").collection("doctors");

  // add appointment
  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  // get appointment result
  app.get('/patients', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, data) => {
        res.send(data);
      })
  })

  //filter specific user
  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;
    doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
        const filter = { date: date.date }
        if (doctors.length === 0) {
          filter.email = email;
        }

        appointmentCollection.find(filter)
          .toArray((err, documents) => {
            res.send(documents);
          })

      })
  });


  // add doctor
  app.post('/addADoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    doctorCollection.insertOne({ name, email, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  // get doctor
  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
      .toArray((err, data) => {
        res.send(data);
      })
  })


  //filter if doctor
  app.post('/isDoctor', (req, res) => {
    const email = req.body.email;
    doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
        res.send(doctors.length > 0);
      })
  });

});



app.get('/', (req, res) => {
  res.send('Do you find anything!')
})

app.listen(port);