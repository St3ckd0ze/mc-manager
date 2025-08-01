const express = require('express');
const bodyParser = require('body-parser');
const backupRoutes = require('./public/routes/backup.js');
const app = express();
const PORT = 3010;

// Statische Ordner freigeben
app.use(express.static('public'));
app.use('/dist', express.static('dist'));
app.use('/api/backup', backupRoutes);
console.log("Backup-Routen wurden registriert");



app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server gestartet auf Port: http://0.0.0.0:${PORT}`);
});

/**
 * The User List managed as an in-memory list
 */
const userList = new Map();
userList.set("thomas", { "userID": "thomas", "password": "superKlasse!", "firstName": "Thomas", "lastName": "Wiethaup", "role": "admin" });
userList.set("nicklas", { "userID": "nicklas", "password": "314159", "firstName": "Nicklas", "lastName": "Schwend", "role": "manager" });
userList.set("sabine", { "userID": "sabine", "password": "tgswh14", "firstName": "Sabine", "lastName": "Wiethaup", "role": "user" });
userList.set("verena", { "userID": "verena", "password": "V280874S", "firstName": "Verena", "lastName": "Schwend", "role": "user" });

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "Authorization");
    next();
});

app.get('/api/login', function (req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        var authenticationString = req.headers.authorization;
        let base64String = authenticationString.split(" ")[1];
        var credentials = Buffer.from(base64String, 'base64').toString('utf-8');
        const userID = credentials.split(":")[0];
        const password = credentials.split(":")[1];

        console.log("Want to login user: " + userID + " Password: " + password)

        if (userID && password) {
            let userObject = userList.get(userID);
            if (userObject) {
                if (password === userObject.password) {
                    console.log("Login success")
                    let result = { 'userID': userID,
                    role: userObject.role
                    };

                    if (userObject.firstName) {
                        result.firstName = userObject.firstName;
                    }
                    if (userObject.lastName) {
                        result.lastName = userObject.lastName;
                    }

                    res.status(200).send(result);
                }
                else {
                    console.error("Invalid password")
                    res.status(401).send({ 'Error': 'Invalid login data' });
                }
            }
            else {
                console.error("User does not exist")
                res.status(401).send({ 'Error': 'Invalid login data' });
            }
        }
        else {
            console.error("Data missing")
            res.status(401).send({ 'Error': 'Invalid login data' });
        }
    } else {
        res.status(401).send({ 'Error': 'Authorization header missing' });
    }
});

app.post('/api/users', function (req, res, next) {
    let userObject = req.body;
    if (userObject) {
        console.log("Got Body: " + JSON.stringify(req.body))
        let userID = req.body.userID;
        let password = req.body.password;
        if (userID && password) {
            if (userList.get(userID)) {
                res.status(400).send({ 'Error': 'User already exists' })
                return;
            }
            userList.set(userID, userObject);
            res.status(200).send({ 'Info': 'Added user ' + userID, 'Count': 'Have ' + userList.size + ' users' });
        }
        else {
            res.status(400).send({ 'Error': 'Incomplete data in body' })
        }
    }
    else {
        res.status(400).send({ 'Error': 'Body is missing' })
    }
});

app.get('/api/users', function (req, res, next) {
    let userArray = Array.from(userList.entries()).map(([name, value]) => {
        return value;
    });
    res.status(200).send(userArray);
});

app.get('/api/users/count', function (req, res, next) {
    res.status(200).send({ 'UserCount': userList.size });
});

// Get user by id
app.get('/api/users/:id', (req, res) => {
    const userID = req.params.id;
    const user = userList.get(userID);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
});

// Update an existing user
app.put('/api/users/:id', (req, res) => {
    const userID = req.params.id;
    const updatedUser = req.body;
    let currentUser = userList.get(userID);
    if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    else {
        if (!updatedUser.userID || !updatedUser.password) {
            return res.status(400).json({ message: 'UserID and password are required' });
        }
        console.log("Update user: " + userID + " with: " + JSON.stringify(updatedUser))
        Object.assign(currentUser, updatedUser);
        userList.set(userID, currentUser);
        console.log("Updated user: " + userID + " with: " + JSON.stringify(currentUser))
        res.status(200).json(currentUser);
    }
});

app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    console.log("Want to delete: " + userId)
    let userObject = userList.get(userId);
    if (userObject) {
        userList.delete(userId);
        res.status(204).send(); // 204 No Content on successful delete
    }
    else {
        return res.status(404).json({ message: 'User not found' });
    }
});

const { exec } = require('child_process');

// POST /api/tmux/command
app.post('/api/tmux/command', (req, res) => {
    const command = req.body.command;
    if (!command) {
        return res.status(400).json({ error: "Kein Befehl angegeben" });
    }

    // Befehl IN der Session mc_session ausführen und mit Enter abschicken
    exec(`tmux send-keys -t mc_session "${command}" Enter`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Fehler beim Ausführen des Befehls: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        res.status(200).json({ message: "Befehl ausgeführt" });
    });
});

// GET /api/tmux/output
app.get('/api/tmux/output', (req, res) => {
  exec('tmux capture-pane -t mc_session:0.0 -p -S -100', (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing tmux command:', error);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error('tmux stderr:', stderr);
    }
    res.json({ output: stdout });
  });
});

