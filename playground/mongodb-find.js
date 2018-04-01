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

    // db.collection('Todos').find({
    //     _id: new ObjectID('5abed70983153d4b851cd742')
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch Todos.', err);
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`There are ${count} Todos in our db.`);
    // }, (err) => {
    //     console.log('Unable to count.', err);
    // });

    db.collection('Users').find({name: 'Roberto'}).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('Unable to count.', err);
    })

    db.close();
});
