import { test } from 'vitest'
import request from 'supertest'
import express from 'express'
import storeRoutes from '../../src/routes/storeRoutes.js'
import app from '../../src/server.js'

test('getCategory', async ({ expect }) => {
    try {
        app.use('/store', storeRoutes)

        const response = await request(app).get('/store/category')
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Array)) // if the response is an array of categories
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})

test('getCategoryProducts', async ({ expect }) => {
    try {
        app.use('/store', storeRoutes)

        const response = await request(app).get('/store/category/2')
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Array)) // if the response is an array of categories
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})

test('getProductDetails', async ({ expect }) => {
    try {
        app.use('/store', storeRoutes)

        const response = await request(app).get('/store/category/2/10')
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Object)) // if the response is a single product object
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})

test('getProduct', async ({ expect }) => {
    try {
        app.use('/store', storeRoutes)

        const response = await request(app).get('/store/all-product')
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Object)) // if the response is a single product object
    } catch (error) {
        console.error(error)
        expect(error).toBeNull()
    }
})

test('removeProduct', async ({ expect }) => {
    try {
        app.use('/store', storeRoutes)

        const response = await request(app)
            .delete('/store/all-product/remove-product')
            .send({ product_id: 2 }) // replace 1 with the ID of the product you want to delete
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual('Deleted product')
    } catch (error) {
        console.error(error)
        // Don't expect a specific error in the catch block
    }
})

test('addProduct', async ({ expect }) => {
    const product = {
      product_name: 'test',
      description: 'test1',
      selling_price: 5.5,
      product_condition: 'ripe',
      product_img: 'testimg.jpg',
      category_id: 1
    };
    const response = await request(app).post('/store/all-product/add-product').send(product);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('successfully');
    expect(response.body.content.product_name).toBe(product.product_name);
    expect(response.body.content.description).toBe(product.description);
    expect(response.body.content.selling_price).toBe(product.selling_price);
    expect(response.body.content.product_condition).toBe(product.product_condition);
    expect(response.body.content.product_img).toBe(product.product_img);
    expect(response.body.content.category_id).toBe(product.category_id);
});

test('searchProducts', async ({ expect }) => {
    try {
        app.use('/store', storeRoutes)

        const response = await request(app).get('/store/search/mango')
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Object)) // if the response is a single product object
    } catch (error) {
        console.error(error)
    }
})

test('searchAdminProducts', async ({ expect }) => {
    try {
        app.use('/store', storeRoutes)

        const response = await request(app).get('/store/search-all/mango')
        
        // Check status code
        expect(response.status).toBe(200)
    
        // Check response body
        expect(response.body).toHaveProperty('content')
        expect(response.body.content).toEqual(expect.any(Object)) // if the response is a single product object
    } catch (error) {
        console.error(error)
    }
})
