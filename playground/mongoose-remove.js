const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then(result => {
//     console.log(result);
// });

Todo.findOneAndRemove({_id: '5b0ca6e7d6a7728a6e3a31c6'}).then(todo => console.log(todo));
// Todo.findByIdAndRemove   

// Todo.findByIdAndRemove('5b0ca64fd6a7728a6e3a31b0').then(todo => console.log(todo));