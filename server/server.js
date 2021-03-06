const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');

require('../config/config');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
    } else {
        Todo.findOne({
            _id: id,
            _creator: req.user._id.toString()
        }).then(todo => {
            if (todo) {
                res.status(200).send({todo});
            } else {
                res.status(404).send();
            }
        }).catch(e =>  {
            console.log('Fail to find Todo');

            res.status(400).send();
        });
    }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectID.isValid(id)) {
            res.status(404).send();
        } else {
            let todo = await Todo.findOneAndRemove({
                _id: id,
                _creator: req.user._id.toString()
            });
            
            if (!todo) {
                return res.status(404).send();    
            }
    
            res.send({todo});
        }
    } catch (e) {
        console.log('Failed to delete Todo', e);
    
        res.status(400).send();
    }
});

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    // get only relevant attributes from body
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id.toString()
    }, {$set: body}, {new: true}).then(todo => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch(e => {
        res.status(400).send();
    });
});

// pick only email and password
app.post('/users', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);

        let user = new User(body);
        
        await user.save();
        const token = await user.generateAuthToken();
        
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e)
    }
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users/login {email, password}
app.post('/users/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);

        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();
    }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);

        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
});

app.listen(port, () => {
    console.log(`Started on port ${port}.`);
});

module.exports = {app};