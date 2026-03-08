import { responseData } from "../config/response.js";
import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import { Model, Sequelize } from "sequelize";

let model = initModels(sequelize);

// Dashboard - done all information
export const getInfoDashboard = async (req, res) => {
  try {
    const totalOrdersResult = await model.orders.count();
    const productionVolumeResult = await model.orders.sum("order_quantity");
    const totalRevenueResult = await model.orders.sum("total_price");

    const revenue = totalRevenueResult
      ? parseFloat(totalRevenueResult.toFixed(2))
      : 0;
    const orderVolume = totalOrdersResult || 0;
    const productionVolume = productionVolumeResult || 0;

    // Fetch total import price of all products in warehouseProducts
    const warehouseProductsResult = await model.warehouse_products.findAll({
      include: [
        {
          model: model.products,
          as: "product",
          attributes: ["import_price"],
        },
      ],
    });

    // Calculate total import price from warehouseProducts
    let cost = 0;
    if (warehouseProductsResult) {
      warehouseProductsResult.forEach((warehouseProduct) => {
        const importPrice = warehouseProduct.product.import_price || 0;
        cost += importPrice;
      });
    }

    // Fetch top 3 products with the most orders
    const bestSellingProducts = await model.order_products.findAll({
      attributes: [
        "product_id",
        [Sequelize.literal("SUM(order_product_quantity)"), "total_orders"],
      ],
      include: [
        {
          model: model.products,
          as: "product",
          attributes: ["product_name", "product_img"],
        },
      ],
      group: ["product_id"],
      order: [[Sequelize.literal("total_orders"), "DESC"]],
      limit: 3,
    });

    // Fetch total import price of all products in warehouseProducts
    const productInWarehouse = await model.warehouse_products.sum("quantity");

    // Fetch total quantity of all products in shelf_products
    const productOnShelf = await model.shelf_products.sum("quantity");

    // Fetch total quantity of all products sold in order_products
    const productSold = await model.order_products.sum(
      "order_product_quantity"
    );

    const productDistribution = {
      productInWarehouse,
      productOnShelf,
      productSold,
    };

    // Fetch total import price of all products in warehouseProducts
    const incoming = await model.warehouse_products.sum("quantity");

    // Fetch total quantity of all products in shelf_products
    const outgoing = await model.shelf_products.sum("quantity");

    const warehouseActivities = {
      incoming,
      outgoing,
    };

    // Count users with role_id = 2 (Customer)
    const customers = await model.users.count({
      where: { role_id: 2 },
    });

    // Fetch total orders for each day in the past 7 days
    const totalOrdersData = await getTotalOrdersData();

    // Function to fetch total orders for each day in the past 7 days
    async function getTotalOrdersData() {
      const totalOrdersData = [];

      // Array to store day names
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      // Loop over the past 7 days
      for (let i = 6; i >= 0; i--) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i); // Subtract i days from current date
        const dayName = dayNames[currentDate.getDay()]; // Get day name

        const startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0); // Start of the day
        const endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999); // End of the day

        // Fetch total orders for the current day
        const totalOrdersForDay = await model.orders.count({
          where: {
            order_date: {
              [Sequelize.Op.between]: [startDate, endDate],
            },
          },
        });

        // Push the total orders for the current day to the array
        totalOrdersData.push({
          date: dayName,
          totalOrders: totalOrdersForDay,
        });
      }
      return totalOrdersData;
    }

    // Fetch total revenue for each day in the past 7 days
    const totalRevenueData = await getTotalRevenueData();

    // Function to fetch total revenue for each day in the past 7 days
    async function getTotalRevenueData() {
      const totalRevenueData = [];

      // Array to store day names
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      // Loop over the past 7 days
      for (let i = 6; i >= 0; i--) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i); // Subtract i days from current date
        const dayName = dayNames[currentDate.getDay()]; // Get day name

        const startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0); // Start of the day
        const endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999); // End of the day

        // Fetch total revenue for the current day
        const totalRevenueForDayResult = await model.orders.sum("total_price", {
          where: {
            order_date: {
              [Sequelize.Op.between]: [startDate, endDate],
            },
          },
        });

        // Round the total revenue to 2 decimal places
        const roundedTotalRevenue = totalRevenueForDayResult
          ? parseFloat(totalRevenueForDayResult.toFixed(2))
          : 0;

        // Push the total revenue for the current day to the array
        totalRevenueData.push({
          date: dayName,
          totalRevenue: roundedTotalRevenue,
        });
      }

      return totalRevenueData;
    }

    const responseData = {
      revenue,
      orderVolume,
      productionVolume,
      cost,
      bestSellingProducts,
      productDistribution,
      warehouseActivities,
      customers,
      weeklyOrders: totalOrdersData,
      weeklyRevenue: totalRevenueData,
    };

    res.status(200).json({
      status: "Success",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "An error occurred while fetching dashboard information.",
      error: error.message, // Including the error message for debugging purposes
    });
  }
};
