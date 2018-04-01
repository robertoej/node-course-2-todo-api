// const MongoClient = require('mongodb').MongoClient;
// ES6 desctructuring
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();

console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server.', err);
    }
    
    console.log('Connected to MongoDB server.');

    // delete many
    // db.collection('Users').deleteMany({name: 'John'}).then(result => {
    //     console.log(result);
    // });
    // delete one
    db.collection('Users').deleteOne({_id: new ObjectID('5ac14597c9f03124a600c3e9')}).then(result => {
        console.log(result);
    });
    // find one and delete
    // db.collection('Users').findOneAndDelete({name: 'John 1'}).then(doc => {
    //     console.log(JSON.stringify(doc, undefined, 2));
    // });
    // db.close();
});
