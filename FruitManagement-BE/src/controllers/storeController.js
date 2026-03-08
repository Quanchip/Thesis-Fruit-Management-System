import { responseData } from "../config/response.js";
import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import { Op } from "sequelize";
import fs from "fs";

let model = initModels(sequelize);

// Done, get all the category for choosing
export const getCategory = async (req, res) => {
  try {
    let data = await model.categories.findAll();
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// After choosing the category, get all the products on shelf belong to the category chosen
// and the quantity of that product in shelf must > 0
export const getCategoryProducts = async (req, res) => {
  try {
    let { category_id } = req.params;
    let data = await model.products.findAll({
      where: {
        category_id,
      },
      include: [
        {
          model: model.shelf_products,
          as: "shelf_products",
          required: true,
          where: {
            quantity: {
              [Op.gt]: 0, // Use shelf_products.quantity as condition
            },
          },
          attributes: ["quantity"],
        },
      ],
    });
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Click to see details of product
export const getProductDetails = async (req, res) => {
  try {
    let { product_id, category_id } = req.params;
    let data = await model.products.findOne({
      where: {
        category_id,
        product_id,
      },
      include: [
        {
          model: model.shelves,
          as: "shelf_id_shelves",
          attributes: ["date_on_shelf"],
        },
      ],
    });
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Get all product in Products (must be >0 kg on shelf)
export const getProduct = async (req, res) => {
  try {
    let data = await model.products.findAll({
      include: [
        {
          model: model.shelf_products,
          as: "shelf_products",
          attributes: ["quantity"],
          where: {
            quantity: {
              [Op.gt]: 0,
            },
          },
        },
      ],
    });
    responseData(res, "Success", data, 200);
  } catch {
    responseData(res, "Error ...", "", 500);
  }
};

// Remove the quantity in warehouse and shelf, then
export const removeProduct = async (req, res) => {
  try {
    let { product_id } = req.body;

    // Update quantity to 0 in shelf_products
    await model.shelf_products.update(
      { quantity: 0 },
      {
        where: {
          product_id,
        },
      }
    );

    responseData(res, "successfully", "Deleted product", 200);
  } catch {
    responseData(res, "Error...", "", 500);
  }
};

// Add all the information, img not yet upload by file
export const addProduct = async (req, res) => {
  try {
    let {
      product_name,
      description,
      selling_price,
      product_condition,
      category_id,
    } = req.body;

    let { file } = req;
    let imageData = fs.readFileSync(
      process.cwd() + "/public/imgs/" + file.filename
    );
    // Convert image data to base64 encoding
    let base64Image = `data:${file.mimetype}; base64, ${Buffer.from(
      imageData
    ).toString("base64")}`;

    let data = await model.products.create({
      product_name,
      description,
      selling_price,
      product_condition,
      product_img: base64Image,
      category_id,
      import_price: 1,
    });
    await data.save();

    responseData(res, "successfully", data, 200);
  } catch (exception) {
    responseData(res, "Error...", "", 500);
  }
};

export const searchProducts = async (req, res) => {
  try {
    let { product_name } = req.params;
    let data = await model.products.findAll({
      where: {
        product_name: {
          [Op.like]: "%" + product_name + "%",
        },
      },
      include: [
        {
          model: model.shelf_products,
          as: "shelf_products",
          attributes: [],
          where: {
            quantity: {
              [Op.gt]: 0,
            },
          },
        },
      ],
    });
    responseData(res, "successfully", data, 200);
  } catch {
    responseData(res, "Error", "", 500);
  }
};

export const uploadPictures = async (req, res) => {
  // try {
  // Read the image file from the file system
  let { file } = req;
  let { category_id } = req.params;
  let imageData = fs.readFileSync(
    process.cwd() + "/public/imgs/" + file.filename
  );

  // Convert image data to base64 encoding
  let base64Image = `data:${file.mimetype}; base64, ${Buffer.from(
    imageData
  ).toString("base64")}`;

  // Update the admin table with the image data
  let data = await model.categories.findOne({
    where: { category_id },
  });

  // Update the product_img column with the base64 encoded image
  data.category_img = base64Image;
  await data.save();
  responseData(res, "Success", data, 200);
  // } catch (err) {
  //   responseData(res, "Error ...", "", 500);
  // }
};
