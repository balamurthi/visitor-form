/*const express = require('express');
const mysql = require('mysql2');

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', // Update with your actual MySQL root password
    database: 'visitor'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});



app.post('/api/visitors', (req, res) => {


    const visitor = req.body;
    console.log(visitor.purposeRemark)

    // console.log(JSON.stringify(visitor.otherRemark))
    //console.log(visitor)
    // console.log(JSON.stringify(visitor))

    const sql = 'INSERT INTO visitors (name, licNo, mobile, meetTo, department, purposeremark, purposegroup, timein, timeout, otherremark, visitCard, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [visitor.name, visitor.licNo, visitor.mobile, visitor.meetTo, visitor.department, visitor.purposeRemark, visitor.purposeGroup, visitor.timeIn, visitor.timeOut, visitor.otherRemark, visitor.visaCard, visitor.photo],
        (err, result) => {
            if (err) {
                console.error('Error inserting visitor:', err);
                res.status(500).send('Error inserting visitor');
                return;
            }
            res.status(201).send({ "message": "visitor added" });
        });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});*/
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', // Update with your actual MySQL root password
    database: 'visitor'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Fetch all visitors
app.get('/api/visitors', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    db.query('SELECT * FROM visitors LIMIT ?, ?', [offset, limit], (err, results) => {
        if (err) {
            console.error('Error fetching visitors:', err);
            res.status(500).json({ error: 'An error occurred while fetching visitors.' });
        } else {
            res.json(results);
        }
    });
});
// Search visitors based on query
app.get('/api/visitors/search', (req, res) => {
    const query = req.query.q
    const sql = 'SELECT * FROM visitors WHERE name LIKE ? OR licNo LIKE ? OR mobile LIKE ? OR meetTo LIKE ? OR department LIKE ? OR purposeremark LIKE ? OR purposegroup LIKE ?';
    const values = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error searching visitors:', err);
            res.status(500).json({ error: 'An error occurred while searching visitors.' });
        } else {
            results.forEach(data => {
                if (data.photo) {
                    data.photo = Buffer.from(data.photo).toString('base64');
                }
            });
            res.json(results);
        }
    });
});

// Fetch a single visitor by ID
app.get('/api/visitors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM visitors WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching visitor:', err);
            res.status(500).json({ error: 'An error occurred while fetching the visitor.' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Visitor not found.' });
        } else {
            const visitor = results[0];
            if (visitor.photo) {
                visitor.photo = Buffer.from(visitor.photo).toString('base64');
            }
            res.json(visitor);
        }
    });
});
// add new visitorr
app.post('/api/visitors', (req, res) => {
    const visitor = req.body;
    let photoBuffer = null;
    if (visitor.photo) {
        const base64Data = visitor.photo.replace(/^data:image\/\w+;base64,/, "");
        photoBuffer = Buffer.from(base64Data, 'base64');
    }

    const sql = 'INSERT INTO visitors (name, licNo, mobile, meetTo, department, purposeremark, purposegroup, timein, timeout, otherremark, visitCard, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [
        visitor.name,
        visitor.licNo,
        visitor.mobile,
        visitor.meetTo,
        visitor.department,
        visitor.purposeRemark,
        visitor.purposeGroup,
        visitor.timeIn,
        visitor.timeOut,
        visitor.otherRemark,
        visitor.visitCard,
        photoBuffer
    ], (err, result) => {
        if (err) {
            console.error('Error adding visitor:', err);
            res.status(500).send('Error adding visitor');
            return;
        }
        res.status(200).send({ message: 'Visitor added' });
    });
});


// Update a visitor by ID
app.put('/api/visitors/:id', (req, res) => {
    const id = req.params.id;
    const visitor = req.body;
    let photoBuffer = null;
    if (visitor.photo) {
        const base64Data = visitor.photo.replace(/^data:image\/\w+;base64,/, "");
        photoBuffer = Buffer.from(base64Data, 'base64');
    }

    const sql = 'UPDATE visitors SET name = ?, licNo = ?, mobile = ?, meetTo = ?, department = ?, purposeremark = ?, purposegroup = ?, timein = ?, timeout = ?, otherremark = ?, visitCard = ?, photo = ? WHERE id = ?';

    db.query(sql, [
        visitor.name,
        visitor.licNo,
        visitor.mobile,
        visitor.meetTo,
        visitor.department,
        visitor.purposeRemark,
        visitor.purposeGroup,
        visitor.timeIn,
        visitor.timeOut,
        visitor.otherRemark,
        visitor.visitCard,
        photoBuffer,
        id
    ], (err, result) => {
        if (err) {
            console.error('Error updating visitor:', err);
            res.status(500).send('Error updating visitor');
            return;
        }
        res.status(200).send({ message: 'Visitor updated' });
    });
});

// Delete a visitor by ID
app.delete('/api/visitors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM visitors WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting visitor:', err);
            res.status(500).send('Error deleting visitor');
            return;
        }
        res.status(200).send({ message: 'Visitor deleted' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});