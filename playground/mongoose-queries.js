const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var todoID = '5adfcf55dc4e0c216bbf6d77';
var userID = '5adfd5f27245a7b6371de3b1'

// if (!ObjectID.isValid(todoID)) {
//     console.log('ID is not valid');
// }

User.findById(userID).then((user) => {
    if (!user) {
        return console.log('User not found');
    }

    console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
    console.log(e);
});

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found.');
//     }

//     console.log('Todo by id', todo);
// }).catch((e) => console.log(e));