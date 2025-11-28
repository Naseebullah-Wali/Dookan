const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM users WHERE email = 'test@gmail.com'", [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log(JSON.stringify(rows, null, 2));
});

db.close();
