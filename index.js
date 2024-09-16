const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files (HTML, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentSkills');

// Define the student schema
const studentSchema = new mongoose.Schema({
    name: String,
    skill: String,
    contact: String
});

const Student = mongoose.model('Student', studentSchema);

// POST route to add new student
app.post('/api/students', async (req, res) => {
    const { name, skill, contact } = req.body;

    const student = new Student({ name, skill, contact });
    try {
        await student.save();
        res.status(201).send('Student added successfully');
    } catch (error) {
        res.status(500).send('Error adding student');
    }
});

// GET route to search students by skill
app.get('/api/students', async (req, res) => {
    const skillQuery = req.query.skill;

    try {
        const students = await Student.find({ skill: new RegExp(skillQuery, 'i') });
        res.json(students);
    } catch (error) {
        res.status(500).send('Error fetching students');
    }
});

// Fallback route for any other request (in case of direct /api paths)
// If no API route matches, serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
