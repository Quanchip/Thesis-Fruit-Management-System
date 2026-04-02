import axios from "axios";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

/**
 * Get a short-lived OAuth2 access token from PayPal.
 * @returns {Promise<string>} Bearer access token
 */
export const getAccessToken = async () => {
    const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
    const response = await axios.post(
        `${PAYPAL_BASE_URL}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
    return response.data.access_token;
};

/**
 * Create a PayPal order with intent CAPTURE.
 * @param {number} totalAmount - Total in USD (e.g. 19.99)
 * @param {string} returnUrl - URL PayPal redirects to after approval
 * @param {string} cancelUrl - URL PayPal redirects to on cancel
 * @returns {Promise<object>} PayPal order object (includes approval link)
 */
export const createOrder = async (totalAmount, returnUrl, cancelUrl) => {
    const accessToken = await getAccessToken();
    const response = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: parseFloat(totalAmount).toFixed(2),
                    },
                },
            ],
            application_context: {
                return_url: returnUrl,
                cancel_url: cancelUrl,
                user_action: "PAY_NOW",
                brand_name: "Manach",
            },
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};

/**
 * Capture an approved PayPal order.
 * @param {string} paypalOrderId - The PayPal order ID from the approval redirect
 * @returns {Promise<object>} Capture result from PayPal
 */
export const captureOrder = async (paypalOrderId) => {
    const accessToken = await getAccessToken();
    const response = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};
