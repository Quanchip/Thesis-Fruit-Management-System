import { test } from 'vitest'
import request from 'supertest'
import express from 'express'
import dashboardRoutes from '../../src/routes/dashboardRoutes.js'
import app from '../../src/server.js'

test('getInfoDashboard', async ({ expect }) => {
    try {
        app.use('/dashboard', dashboardRoutes)

        const response = await request(app).get('/dashboard')
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('revenue')
        expect(response.body.data).toHaveProperty('orderVolume')
        expect(response.body.data).toHaveProperty('productionVolume')
        expect(response.body.data).toHaveProperty('cost')
        expect(response.body.data).toHaveProperty('bestSellingProducts')
        expect(response.body.data.bestSellingProducts).toEqual(expect.any(Array))
        expect(response.body.data).toHaveProperty('productInWarehouse')
        expect(response.body.data).toHaveProperty('productOnShelf')
        expect(response.body.data).toHaveProperty('productSold')
        expect(response.body.data).toHaveProperty('incoming')
        expect(response.body.data).toHaveProperty('outgoing')
        expect(response.body.data).toHaveProperty('customers')
        expect(response.body.data).toHaveProperty('weeklyOrders')
        expect(response.body.data.weeklyOrders).toEqual(expect.any(Array))
        expect(response.body.data).toHaveProperty('weeklyRevenue')
        expect(response.body.data.weeklyRevenue).toEqual(expect.any(Array))
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})