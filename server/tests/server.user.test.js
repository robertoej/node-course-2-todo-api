const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');

const {User} = require('./../models/user');
const {users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);

describe('GET /users/me', () => {
    it('should return a user if authenticated', done => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            }).end(done);
    });

    it('should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            }).end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', done => {
        var email = 'robertoelerojunior@gmail.com';
        var password = '123456789';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            }).end(err => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then(user => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    expect(user.email).toBe(email);
                    done();
                }).catch(e => done(e));
            });
    })

    it('should return validation errors if request is invalid', done => {
        var email = 'roberto@gmail@.com';
        var password = '123';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).toBeFalsy();
                expect(res.body.errors).toBeTruthy();
            }).end(err => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then(user => {
                    expect(user).toBeFalsy();
                    done();
                }).catch(e => done(e));
            });
    });

    it('should not create user if email in use', done => {
        var email = users[0].email;
        var password = '123456789';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).toBeFalsy();
                expect(res.body.errmsg).toBeTruthy();
                expect(res.body.code).toBe(11000);
            }).end(err => {
                if (err) {
                    return done(err);
                }

                User.find({email}).then(users => {
                    expect(users.length).toBe(1);
                    done();
                }).catch(e => done(e));
            });
    })
});

describe('POST /user/login', () => {
    it('should login user and return auth token', done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User
                    .findById(users[1]._id)
                    .then(user => {
                        expect(user.toObject().tokens[1]).toMatchObject({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });

                        done();
                    }).catch(e => done(e));
            });
    });

    it('should reject invalid login', done => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: '123'
        })
        .expect(400)
        .expect(res => {
            expect(res.headers['x-auth']).toBeFalsy();
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User
                .findById(users[1]._id)
                .then(user => {
                    expect(user.tokens.length).toBe(1);

                    done();
                }).catch(e => done(e));
        });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', done => {
       request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token.toString())
        .expect(200)
        .end(err => {
            if (err) {
                return done(e);
            }

            User
                .findById(users[0]._id)
                .then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(e => done(e));

        }) 
    });
})