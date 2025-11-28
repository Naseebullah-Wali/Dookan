const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'test@gmail.com';

db.serialize(() => {
    db.run("UPDATE users SET role = 'admin' WHERE email = ?", [email], function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
    });

    db.get("SELECT id, email, role FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('User details:', row);
    });
});

db.close();
