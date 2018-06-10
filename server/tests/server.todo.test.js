const expect = require('expect');
const request = require('supertest');

const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text.';
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token.toString())
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create a todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token.toString())
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        }); 
    });
});

describe('GET /todos', (done) => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token.toString())
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    })
});

describe('GET /todos/:id', (done) => {
    it('should return todo doc', done => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token.toString())
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should not return todo doc created by other user', done => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token.toString())
        .expect(404)
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token.toString())
        .expect(404)
        .end(done);
    });

    it('should return 404 for non object ids', (done) => {
        request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token.toString())
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', done => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token.toString())
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then(todo => {
                    expect(todo).toBeFalsy();
                    done();
                }).catch(e => {
                    done(e);
                });
            });
    });

    it('should not remove a todo created by another user', done => {
        var hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token.toString())
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then(todo => {
                    expect(todo).toBeTruthy();
                    done();
                }).catch(e => {
                    done(e);
                });
            });
    });

    it('should return 404 if todo not found', done => {
        request(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[1].tokens[0].token.toString())
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', done => {
        request(app)
        .delete('/todos/123')
        .set('x-auth', users[1].tokens[0].token.toString())
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', done => {
        var id = todos[0]._id.toHexString();
        var text = 'Something brand new!';

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token.toString())
            .send({
                completed: true,
                text
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(typeof res.body.todo.completedAt).toBe('number');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then(todo => {
                    expect(todo.text).toBe(text);
                    expect(todo.completed).toBe(true);
                    expect(typeof todo.completedAt).toBe('number');
                    done();
                })
                .catch(err => {
                    done(err);
                });
            });
    });

    it('should not update the todo created by another user', done => {
        var id = todos[0]._id.toHexString();
        var text = 'Something brand new new newwwwwwwwwwww!';
        
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token.toString())
            .send({
                completed: true,
                text
            })
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then(todo => {
                    expect(todo.text).not.toEqual(text);
                    expect(todo.completed).toEqual(false);
                    expect(todo.completedAt).toBeFalsy();
                    done();
                })
                .catch(err => {
                    done(err);
                });
            });
    });

    it('should clear completedAt when todo is not completed', done => {
        var todo = todos[1];
        var id = todo._id.toHexString();
        var newTextValue = 'Something really new!';
        todo.text = newTextValue;
        todo.completed = false;

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token.toString())
            .send(todo)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(newTextValue);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeFalsy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then(todo => {
                    expect(todo.text).toBe(newTextValue);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toBeFalsy();
                    done();
                })
                .catch(err => {
                    done(err);
                });
            });
    });
});