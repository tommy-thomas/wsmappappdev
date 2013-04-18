var sqldb=null;

// api-storage  "Create DB"
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS DEMO');
    tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data)');
    tx.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
    tx.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');
}
function errorCB(err) {
   console.log("Error processing SQL: " + err.code);
   $('#sql-result').html("<strong>Error processing SQL: " + err.code + "</strong>");
}
function successCreateCB() {
   console.log("Success creating Database 1.0");
   $('#sql-result').html("<strong>Success creating Database 1.0</strong>");
}
var db = 0;
function createDB(){
    if (!db) {
        db = window.openDatabase("Database", "1.0", "PhoneGap Training", 200000);
    }
    db.transaction(populateDB, errorCB, successCreateCB);    
}

// api-storage  "Get SQL Result Set"
function querySuccess(tx, results) {
    // this will be empty since no rows were inserted.
    //console.log("Insert ID = " + results.insertId);
    // this will be 0 since it is a select statement
    console.log("Rows Affected = " + results.rowAffected);
    // the number of rows returned by the select statement
    console.log("Num. Rows Returned = " + results.rows.length);
    $('#sql-result').html("<strong>Num. Rows Returned = " + results.rows.length + "</strong>");
}
function queryDB(tx) {
    tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}
function getSqlResultSet() {
    if (!db) {
        db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
    }
    db.transaction(queryDB, errorCB);    
}

// api-storage   Local Storage
function writeLocalStorage() {
    window.localStorage.setItem("myKey", "myValue");
    var keyname = window.localStorage.key(0); // 0 because first and only setItem!
    $('#local-storage-result').html("Wrote key: <strong>" + keyname + "</strong>");
}
function readLocalStorage() {
    var value = window.localStorage.getItem("myKey");
    if (!value) {
        $('#local-storage-result').html("<strong>Null</strong> - Try Write first");        
    } else {
        $('#local-storage-result').html("Got value: <strong>" + value + "</strong>");
    }
}
function removeItemLocalStorage() {
    window.localStorage.removeItem("myKey");
    $('#local-storage-result').html("Removed key/value: <strong>myKey/myValue</strong>");    
}
