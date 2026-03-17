import { responseData } from "../config/response.js";
import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import { Sequelize } from "sequelize";

let model = initModels(sequelize);
let Op = Sequelize.Op;

// Get info of user
export const getProfile = async (req, res) => {
  try {
    let { user_id } = req.params;
    let data = await model.users.findOne({
      where: { user_id },
      include: ["role"],
    });
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    let { user_id } = req.params;
    let { phone, bank_account, email, full_name } = req.body;

    // Validate phone number (assuming phone number should be exactly 10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return responseData(res, "Invalid phone number format", "", 400);
    }

    // Validate bank account
    if (!/^[a-zA-Z\s]+-\d+$/.test(bank_account)) {
      return responseData(res, "Invalid bank account format", "", 400);
    }

    // Validate email address
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return responseData(res, "Invalid email address", "", 400);
    }

    let getNewProfile = await model.users.findOne({
      where: {
        user_id,
      },
    });
    getNewProfile.phone = phone;
    getNewProfile.bank_account = bank_account;
    getNewProfile.email = email;
    getNewProfile.full_name = full_name;

    await model.users.update(getNewProfile.dataValues, {
      where: {
        user_id,
      },
    });
    let data = await model.users.findOne({
      where: {
        user_id,
      },
    });
    responseData(res, "Updated profile successfully", data, 200);
  } catch {
    responseData(res, "Error", "", 500);
  }
};

// Buy products
export const checkOut = async (req, res) => {
  try {
    let { user_id } = req.params;

    const { products, delivery_name, delivery_phone, delivery_address } = req.body;

    // If the cart is empty, send a response indicating that the cart is empty
    if (!products || products.length === 0) {
      responseData(res, "Cart is empty", "", 400);
      return; // Exit the function early
    }

    // Create a new order record in the orders table
    const newOrder = await model.orders.create({
      user_id,
      delivery_name: delivery_name || null,
      delivery_phone: delivery_phone || null,
      delivery_address: delivery_address || null,
    });

    let total_price = 0;
    let order_quantity = 0;
    const productDetails = [];

    for (const product of products) {
      const { product_id, quantity } = product;

      const shelfProduct = await model.shelf_products.findOne({
        where: { product_id },
      });

      // Check if there is enough quantity available on the shelf
      if (shelfProduct.quantity < quantity) {
        responseData(
          res,
          `Insufficient quantity available for product with ID ${product_id}`,
          "",
          400
        );
        return;
      }

      // Decrease the quantity in shelf_products
      await shelfProduct.update({ quantity: shelfProduct.quantity - quantity });

      // Find the product details
      const productInfo = await model.products.findByPk(product_id);

      // Calculate the subtotal for this product
      const subtotal = productInfo.selling_price * quantity;

      // Add the subtotal to the total price
      total_price += subtotal;

      order_quantity += quantity;

      // Create a record in order_products linking the order to the product
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

    // Update the order with totals
    await model.orders.update(
      { total_price: total_price, order_quantity: order_quantity },
      { where: { order_id: newOrder.order_id } }
    );

    // Send confirmation email
    try {
      const user = await model.users.findByPk(user_id);
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
      console.error("Email send failed (non-blocking):", emailError.message);
    }

    responseData(res, "Checkout successful", newOrder, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

//
export const getOrder = async (req, res) => {
  // try {
  let { user_id } = req.params;
  let data = await model.orders.findAll({
    where: { user_id },
    include: [
      {
        model: model.products,
        as: "product_id_products_order_products",
        attributes: ["product_id", "product_name"],
      },
      {
        model: model.users,
        as: "user",
      },
    ],
  });
  responseData(res, "Success", data, 200);
  // } catch {
  //   responseData(res, "Error ...", "", 500);
  // }
};
