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

    const { products, delivery_name, delivery_phone, delivery_address, shippingMethod, shippingFee } = req.body;

    const SHIPPING_FEES = { standard: 2, instant: 8 };
    // Always recalculate shipping fee server-side — never trust the client value
    const resolvedMethod = ['standard', 'instant'].includes(shippingMethod) ? shippingMethod : 'standard';
    const resolvedFee = SHIPPING_FEES[resolvedMethod];

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
      shipping_method: resolvedMethod,
      shipping_fee: resolvedFee,
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

    // Update the order with totals (products subtotal + shipping fee)
    await model.orders.update(
      { total_price: total_price + resolvedFee, order_quantity: order_quantity },
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

// Get all users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    
    if (role && role !== 'all') {
      whereCondition.role_id = role === 'admin' ? 1 : 2;
    }

    let data = await model.users.findAll({
      where: whereCondition,
      include: ["role"],
      order: [["user_id", "DESC"]]
    });
    responseData(res, "Success", data, 200);
  } catch (error) {
    responseData(res, "Error fetching users", "", 500);
  }
};

// Enable User (Admin)
export const enableUser = async (req, res) => {
  try {
    let { user_id } = req.params;
    await model.users.update({ is_active: true }, { where: { user_id } });
    responseData(res, "User enabled successfully", "", 200);
  } catch {
    responseData(res, "Error enabling user", "", 500);
  }
};

// Disable User (Admin)
export const disableUser = async (req, res) => {
  try {
    let { user_id } = req.params;
    const user = await model.users.findOne({ where: { user_id } });
    if (user && user.role_id === 1) {
      return responseData(res, "Cannot disable an admin", "", 403);
    }
    await model.users.update({ is_active: false }, { where: { user_id } });
    responseData(res, "User disabled successfully", "", 200);
  } catch {
    responseData(res, "Error disabling user", "", 500);
  }
};

// Delete User (Admin)
export const deleteUser = async (req, res) => {
  try {
    let { user_id } = req.params;
    const user = await model.users.findOne({ where: { user_id } });
    if (!user) return responseData(res, "User not found", "", 404);
    if (user.role_id === 1) {
      return responseData(res, "Cannot delete an admin user", "", 403);
    }
    await model.users.destroy({ where: { user_id } });
    responseData(res, "User deleted successfully", "", 200);
  } catch(err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return responseData(res, "Cannot delete user because they have associated orders or chats.", "", 400);
    }
    responseData(res, "Error deleting user", "", 500);
  }
};

// Admin comprehensive user update
export const adminUpdateUser = async (req, res) => {
  try {
    let { user_id } = req.params;
    let { user_name, full_name, phone, email, bank_account, role_id, is_active, is_email_verified } = req.body;

    const user = await model.users.findOne({ where: { user_id } });
    if (!user) {
      return responseData(res, "User not found", "", 404);
    }
    
    // Admins cannot change role or status of another Admin (to prevent locking out the system)
    if (user.role_id === 1 && (role_id === 2 || is_active === false)) {
      return responseData(res, "Cannot demote or disable an admin.", "", 403);
    }

    await model.users.update({
      user_name: user_name ?? user.user_name,
      full_name: full_name ?? user.full_name,
      phone: phone ?? user.phone,
      email: email ?? user.email,
      bank_account: bank_account ?? user.bank_account,
      role_id: role_id ?? user.role_id,
      is_active: is_active ?? user.is_active,
      is_email_verified: is_email_verified ?? user.is_email_verified
    }, {
      where: { user_id }
    });

    const updatedUser = await model.users.findOne({ where: { user_id } });
    responseData(res, "User updated successfully (Admin override)", updatedUser, 200);
  } catch (error) {
    responseData(res, "Error updating user", "", 500);
  }
};
