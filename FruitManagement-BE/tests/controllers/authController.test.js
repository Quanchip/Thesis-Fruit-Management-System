import { test } from 'vitest'
import request from 'supertest'
import express from 'express'
import authRoutes from '../../src/routes/authRoutes.js'
import app from '../../src/server.js'

// Success case
test('login', async ({ expect }) => {
    try {
        app.use('/auth', authRoutes)

        const response = await request(app)
            .post('/auth/login')
            .send({ user_name: 'johndoe', user_password: 'password123' }) // replace with valid credentials
        
        
        // Check status code
        expect(response.status).toBe(200)
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Object)) // if the response is a token object
    } catch (error) {
        console.error(error)

    }
})

// Error case
test('login', async ({ expect }) => {
    try {
        app.use('/auth', authRoutes)

        const response = await request(app)
            .post('/auth/login')
            .send({ user_name: '1johndoe'}) // replace with valid credentials
        
        
        // Check status code
        expect(response.status).toBe(500)
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual('') // if the response is a token object
    } catch (error) {
        console.error(error)
    }
})

// wrong password
test('login', async ({ expect }) => {
    try {
        app.use('/auth', authRoutes)

        const response = await request(app)
            .post('/auth/login')
            .send({ user_name: 'johndoe', user_password: 'password1234' }) // replace with valid credentials
        
        
        // Check status code
        expect(response.status).toBe(400)
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual('') // if the response is a token object
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})

// user doesn't exist
test('login', async ({ expect }) => {
    try {
        app.use('/auth', authRoutes)

        const response = await request(app)
            .post('/auth/login')
            .send({ user_name: '1johndoe', user_password: 'password1234' }) // replace with valid credentials
        
        
        // Check status code
        expect(response.status).toBe(400)
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual('') // if the response is a token object
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})


// Success case
test('signup', async ({ expect }) => {
    try {
        app.use('/auth', authRoutes)

        const newUser = {
            full_name: 'New1',
            address: 'New1',
            user_name: 'newuser1',
            bank_account: '1234567890000',
            user_password: 'newuser1',
            phone: '0905903608',
            email: 'hetestuser@test.com',
        }

        const response = await request(app)
            .post('/auth/signup')
            .send(newUser)
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual('') // if the response is an empty string
    } catch (error) {
        console.error(error)
    }
})

// Username already exists
test('signup', async ({ expect }) => {
    try {
        app.use('/auth', authRoutes)

        const newUser = {
            full_name: 'Test User`',
            address: 'Test Address',
            user_name: 'testuser',
            bank_account: '12345678900',
            user_password: 'testpassword',
            phone: '1234567890',
            email: 'testuser@test.com',
        }

        const response = await request(app)
            .post('/auth/signup')
            .send(newUser)
        
        // Check status code
        expect(response.status).toBe(400)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual('') // if the response is an empty string
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})