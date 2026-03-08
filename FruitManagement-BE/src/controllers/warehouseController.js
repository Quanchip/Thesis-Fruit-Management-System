import { responseData } from "../config/response.js";
import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";

let model = initModels(sequelize);

// Get all the inventory in warehouse
export const getInventory = async (req, res) => {
  try {
    let getProducts = await model.products.findAll({
      attributes: ["product_id", "product_img", "product_name"],
      include: [
        {
          model: model.warehouse_products,
          as: "warehouse_products",
          required: true,
          attributes: ["quantity"],
        },
        {
          model: model.shelf_products,
          as: "shelf_products",
          attributes: ["quantity"],
        },
      ],
    });

    // Define counters for each category
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let nearLowStockCount = 0;
    let highStockCount = 0;

    // Count products based on quantity
    getProducts.forEach((product) => {
      const quantity = product.warehouse_products.reduce(
        (total, wp) => total + wp.quantity,
        0
      );

      if (quantity === 0) {
        outOfStockCount++;
      } else if (quantity < 15) {
        lowStockCount++;
      } else if (quantity < 25) {
        nearLowStockCount++;
      } else {
        highStockCount++;
      }
    });

    const stockLevel = {
      outOfStock: outOfStockCount,
      lowStock: lowStockCount,
      nearLowStock: nearLowStockCount,
      highStock: highStockCount,
    };

    const data = {
      getProducts,
      stockLevel,
    };
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

export const reorder = async (req, res) => {
  try {
    let data = await model.warehouse_products.findAll({
      attributes: ["quantity"],
      include: [
        {
          model: model.products,
          as: "product",
          attributes: ["product_id", "product_img", "product_name"],
        },
      ],
      where: {
        quantity: 0,
      },
    });
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Function to get a random supplier_id
function getRandomSupplierId() {
  // List of supplier IDs
  const supplierIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // Get a random index from the supplierIds array
  const randomIndex = Math.floor(Math.random() * supplierIds.length);
  // Return the supplier_id at the random index
  return supplierIds[randomIndex];
}

export const reorderProduct = async (req, res) => {
  try {
    let { product_id } = req.params;
    let { quantity } = req.body;
    let randomSupplierId = getRandomSupplierId();

    let importData = {
      warehouse_id: 1,
      product_id,
      quantity,
      supplier_id: randomSupplierId,
      import_date: new Date(),
    };

    let createdImport = await model.imports.create(importData);

    let warehouseProduct = await model.warehouse_products.findOne({
      where: { product_id },
    });

    warehouseProduct.quantity = quantity;
    await warehouseProduct.save();

    responseData(res, "Success", createdImport, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Get all products on shelves, and the warehouse and shelf summary
export const getProductsShelfs = async (req, res) => {
  try {
    let getProducts = await model.products.findAll({
      attributes: ["product_id", "product_img", "product_name"],
      include: [
        {
          model: model.shelf_products,
          as: "shelf_products",
          attributes: ["shelf_id", "quantity"],
          required: true, // This ensures that only products with shelf_products are included
        },
        {
          model: model.warehouse_products,
          as: "warehouse_products",
          attributes: ["quantity"],
          required: true,
        },
      ],
    });

    // Calculate the total quantity in warehouse
    const warehouseTotalQuantity = getProducts.reduce(
      (total, product) =>
        total +
        product.warehouse_products.reduce((sum, wp) => sum + wp.quantity, 0),
      0
    );

    // Calculate the total quantity in shelf products
    const shelfTotalQuantity = getProducts.reduce(
      (total, product) =>
        total +
        product.shelf_products.reduce((sum, sp) => sum + sp.quantity, 0),
      0
    );

    // Count products with low stock in warehouse
    const lowStockWarehouseCount = getProducts.reduce(
      (count, product) =>
        count +
        (product.warehouse_products.some((wp) => wp.quantity < 15) ? 1 : 0),
      0
    );

    // Count products with low stock in shelf products
    const lowStockShelfCount = getProducts.reduce(
      (count, product) =>
        count + (product.shelf_products.some((sp) => sp.quantity < 15) ? 1 : 0),
      0
    );

    const warehouseSummary = {
      warehouseTotalQuantity,
      lowStockWarehouseCount,
    };

    const shelfSummary = {
      shelfTotalQuantity,
      lowStockShelfCount,
    };

    const data = {
      getProducts,
      warehouseSummary,
      shelfSummary,
    };

    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Add products from warehouse to shelf, then create a new export
export const addProductToShelf = async (req, res) => {
  try {
    let products = req.body.products;

    if (products.length === 0) {
      responseData(res, "Nothing to add", "", 400);
      return; // Exit the function early
    }
    const exportProducts = []; // Array to store products for export

    for (const product of products) {
      const { product_id, quantity, shelf_id } = product;

      // Check if there is enough quantity in the warehouse
      const warehouseProduct = await model.warehouse_products.findOne({
        where: {
          product_id,
        },
      });

      if (!warehouseProduct || warehouseProduct.quantity < quantity) {
        responseData(
          res,
          `Insufficient quantity in the warehouse for product ID ${product_id}`,
          "",
          400
        );
        return; // Exit the function if insufficient quantity
      }

      // Push product details to exportProducts array
      exportProducts.push({
        product_id,
        quantity,
        shelf_id,
      });

      // Update shelf_products with the desired quantity
      await model.shelf_products.increment("quantity", {
        by: quantity,
        where: {
          shelf_id, // Assuming shelf_id is provided in the request body
          product_id,
        },
      });

      // Update the quantity of the product in the warehouse
      await model.warehouse_products.decrement("quantity", {
        by: quantity,
        where: {
          product_id,
        },
      });
    }

    // Create a new export record to represent the entire operation
    const newExport = await model.exports.create({
      warehouse_id: 1, // Assuming there's only one warehouse for now
      export_date: new Date(), // Current date
    });

    const shelfIds = new Set(); // Set to store unique shelf_ids

    // Create or update export shelf records
    for (const product of exportProducts) {
      if (!shelfIds.has(product.shelf_id)) {
        // Create new export shelf record
        await model.export_shelfs.create({
          shelf_id: product.shelf_id,
          export_id: newExport.export_id,
          export_shelf_quantity: product.quantity,
        });
        shelfIds.add(product.shelf_id);
      } else {
        // Update existing export shelf record
        await model.export_shelfs.increment("export_shelf_quantity", {
          by: product.quantity,
          where: {
            shelf_id: product.shelf_id,
            export_id: newExport.export_id,
          },
        });
      }
    }

    // Create export product records
    await Promise.all(
      exportProducts.map(async (product) => {
        await model.export_products.create({
          product_id: product.product_id,
          export_shelf_id: await model.export_shelfs
            .findOne({
              where: {
                shelf_id: product.shelf_id,
                export_id: newExport.export_id,
              },
            })
            .then((shelf) => shelf.export_shelf_id),
          export_product_quantity: product.quantity,
        });
      })
    );

    // Calculate the sum of export_shelf_quantity for each export
    const exportQuantity = await Promise.all(
      Array.from(shelfIds).map(async (shelf_id) => {
        const shelf = await model.export_shelfs.findOne({
          where: {
            shelf_id,
            export_id: newExport.export_id,
          },
        });
        return shelf.export_shelf_quantity;
      })
    ).then((quantities) => quantities.reduce((total, qty) => total + qty, 0));

    // Update the export record with the total export quantity
    await model.exports.update(
      { export_quantity: exportQuantity },
      { where: { export_id: newExport.export_id } }
    );

    responseData(res, "Success", newExport, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Get all the order history
export const getImport = async (req, res) => {
  try {
    let data = await model.imports.findAll({
      include: ["supplier"],
      order: [["import_id", "DESC"]],
      limit: 1000,
    });
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};
