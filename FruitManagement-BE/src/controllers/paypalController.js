import { responseData } from "../config/response.js";
import { createOrder, captureOrder } from "../services/paypalService.js";
import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";

let model = initModels(sequelize);

/**
 * POST /paypal/create-order
 * Creates a PayPal order and returns the approval URL to redirect the user.
 * Body: { totalAmount, products, deliveryInfo: { delivery_name, delivery_phone, delivery_address }, userId }
 */
export const createOrderHandler = async (req, res) => {
    try {
        const { totalAmount, shippingMethod } = req.body;

        if (!totalAmount || isNaN(totalAmount) || parseFloat(totalAmount) <= 0) {
            return responseData(res, "Invalid total amount", "", 400);
        }

        const SHIPPING_FEES = { standard: 2, instant: 8 };
        const resolvedMethod = ['standard', 'instant'].includes(shippingMethod) ? shippingMethod : 'standard';
        const resolvedFee = SHIPPING_FEES[resolvedMethod];
        const finalTotal = parseFloat((parseFloat(totalAmount) + resolvedFee).toFixed(2));

        const returnUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/check-out`;
        const cancelUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/check-out?paypal=cancelled`;

        const paypalOrder = await createOrder(finalTotal, returnUrl, cancelUrl);

        const approvalLink = paypalOrder.links.find((l) => l.rel === "approve");
        if (!approvalLink) {
            return responseData(res, "Could not get PayPal approval link", "", 500);
        }

        responseData(res, "PayPal order created", {
            paypalOrderId: paypalOrder.id,
            approvalUrl: approvalLink.href,
        }, 200);
    } catch (error) {
        console.error("PayPal create-order error:", error.response?.data || error.message);
        responseData(res, "Failed to create PayPal order", "", 500);
    }
};

/**
 * POST /paypal/capture/:orderId
 * Captures an approved PayPal order, verifies payment, then records the order in the DB.
 * Body: { products, deliveryInfo: { delivery_name, delivery_phone, delivery_address }, userId }
 */
export const captureOrderHandler = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { products, deliveryInfo, userId, shippingMethod } = req.body;

        const SHIPPING_FEES = { standard: 2, instant: 8 };
        const resolvedMethod = ['standard', 'instant'].includes(shippingMethod) ? shippingMethod : 'standard';
        const resolvedFee = SHIPPING_FEES[resolvedMethod];

        // 1. Capture from PayPal
        const captureResult = await captureOrder(orderId);

        if (captureResult.status !== "COMPLETED") {
            return responseData(res, "Payment not completed", { status: captureResult.status }, 402);
        }

        // 2. Validate cart is not empty
        if (!products || products.length === 0) {
            return responseData(res, "Cart is empty", "", 400);
        }

        // 3. Server-side total recalculation (security: never trust the client's total)
        let serverProductTotal = 0;
        for (const product of products) {
            const productInfo = await model.products.findByPk(product.product_id);
            if (productInfo) serverProductTotal += productInfo.selling_price * product.quantity;
        }
        const serverTotal = parseFloat((serverProductTotal + resolvedFee).toFixed(2));

        // 4. Verify captured amount approximately matches what we expect (±$1 tolerance for float rounding)
        const capturedAmount = parseFloat(captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 0);
        if (Math.abs(capturedAmount - serverTotal) > 1) {
            console.error(`PayPal amount mismatch: captured=${capturedAmount}, expected=${serverTotal}`);
            return responseData(res, "Payment amount mismatch", "", 402);
        }

        // 5. Record the order in the database
        const { delivery_name, delivery_phone, delivery_address } = deliveryInfo || {};

        const newOrder = await model.orders.create({
            user_id: userId,
            delivery_name: delivery_name || null,
            delivery_phone: delivery_phone || null,
            delivery_address: delivery_address || null,
            shipping_method: resolvedMethod,
            shipping_fee: resolvedFee,
        });

        let total_price = 0;
        let order_quantity = 0;
        const productDetails = [];

        for (const product of products) {
            const { product_id, quantity } = product;

            const shelfProduct = await model.shelf_products.findOne({ where: { product_id } });

            if (!shelfProduct || shelfProduct.quantity < quantity) {
                // Payment already captured from PayPal at this point — log it but continue
                console.warn(`Insufficient stock for product ${product_id} after PayPal capture.`);
                continue;
            }

            await shelfProduct.update({ quantity: shelfProduct.quantity - quantity });

            const productInfo = await model.products.findByPk(product_id);
            const subtotal = productInfo.selling_price * quantity;

            total_price += subtotal;
            order_quantity += quantity;

            await model.order_products.create({
                order_id: newOrder.order_id,
                product_id,
                order_product_quantity: quantity,
                subtotal,
            });

            productDetails.push({
                product_id,
                product_name: productInfo.product_name,
                quantity,
                subtotal,
            });
        }

        await model.orders.update(
            { total_price: serverTotal, order_quantity },
            { where: { order_id: newOrder.order_id } }
        );

        // 4. Non-blocking confirmation email (best-effort)
        try {
            const user = await model.users.findByPk(userId);
            if (user && user.email) {
                const { sendOrderConfirmation } = await import("../services/emailService.js");
                await sendOrderConfirmation(user.email, {
                    orderId: newOrder.order_id,
                    deliveryName: delivery_name || user.full_name || "Customer",
                    deliveryPhone: delivery_phone || user.phone || "",
                    deliveryAddress: delivery_address || "",
                    products: productDetails,
                    totalPrice: total_price,
                });
            }
        } catch (emailError) {
            console.error("Confirmation email failed (non-blocking):", emailError.message);
        }

        responseData(res, "Payment captured and order created successfully", {
            orderId: newOrder.order_id,
            paypalOrderId: orderId,
            total_price,
        }, 200);
    } catch (error) {
        const paypalError = error.response?.data;
        // If PayPal says the order was already captured, treat as success (double-call protection)
        if (paypalError?.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
            console.warn("PayPal order already captured — returning success to avoid false error.");
            return responseData(res, "Payment already captured and order created successfully", {}, 200);
        }
        console.error("PayPal capture error:", paypalError || error.message);
        responseData(res, "Failed to capture PayPal payment", "", 500);
    }
};
