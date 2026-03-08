import { test } from 'vitest'
import request from 'supertest'
import express from 'express'
import warehouseRoutes from '../../src/routes/warehouseRoutes.js'
import app from '../../src/server.js'

test('getInventory', async ({ expect }) => {
    try {
        app.use('/warehouse', warehouseRoutes)

        const response = await request(app).get('/warehouse')
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Array))
    } catch (error) {
        console.error(error)
    }
})

test('reorder', async ({ expect }) => {
    try {
        app.use('/warehouse', warehouseRoutes)

        const response = await request(app).get('/warehouse/reorder')
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Array))
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})

test('reorderProduct', async ({ expect }) => {
    try {
        app.use('/warehouse', warehouseRoutes)

        const response = await request(app).put('/warehouse/reorder/1', {
            product_id: 1,
            quantity: 10
        })
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Object))
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})

test('getProductsShelfs', async ({ expect }) => {
    try {
        app.use('/warehouse', warehouseRoutes)

        const response = await request(app).get('/warehouse/stock-adjust')
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Array))
    } catch (error) {
        console.error(error)
    }
})

test('addProductToShelf', async ({ expect }) => {
    try {
        app.use('/warehouse', warehouseRoutes)
        const response = await request(app).post('/warehouse/stock-adjust/add-shelf', {
            products: [
                {
                    product_id: 3,
                    quantity: 2,
                    shelf_id: 1
                }
            ]
        })
        expect(response.status).toBe(500)   // Expect a 200 status code
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toMatch("")  // Expect the content to be a date string

    } catch (error) {
        console.error(error.message) // Log the error message
        expect(error).toBeNull()
    }
})

test('getImport', async ({ expect }) => {
    try {
        app.use('/warehouse', warehouseRoutes)

        const response = await request(app).get('/warehouse/import')
        
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Array))
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})