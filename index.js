require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files (HTML, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection URI from .env
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Define the student schema and collection
let studentsCollection;

// Connect to MongoDB and initialize the collection
async function connectToDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Ping MongoDB to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to MongoDB!");

    // Initialize the "students" collection from the "studentDB" database
    const database = client.db('Cluster0');  // Replace with your actual database name
    studentsCollection = database.collection('students');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// POST route to add new student
app.post('/api/students', async (req, res) => {
  console.log("Received request to add student:", req.body);  // Log request data

  const { name, skill, contact } = req.body;

  const student = { name, skill, contact };
  try {
    await studentsCollection.insertOne(student);
    console.log("Student added successfully:", student);  // Log success
    res.status(201).send('Student added successfully');
  } catch (error) {
    console.error('Error adding student:', error);  // Log error
    res.status(500).send('Error adding student');
  }
});

// GET route to search students by skill
app.get('/api/students', async (req, res) => {
  const skillQuery = req.query.skill;
  console.log("Received search request for skill:", skillQuery);  // Log search query

  try {
    const students = await studentsCollection.find({ skill: new RegExp(skillQuery, 'i') }).toArray();
    console.log("Search results:", students);  // Log the search results
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);  // Log error
    res.status(500).send('Error fetching students');
  }
});

// Fallback route for any other request (in case of direct /api paths)
// If no API route matches, serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server after connecting to MongoDB
const port = process.env.PORT || 10000;

connectToDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to start the server:', err);
});
