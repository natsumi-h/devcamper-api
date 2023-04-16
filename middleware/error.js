const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  // Log to console for developer
  console.log(err.errors);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered `;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    // errorsオブジェクトの中の各プロパティの値が配列で取得されている=>[]
    // const myObject = [a:{ type: name, message: "please add a name" },b:{ type: name, message: "please add a name" },c:{ type: name, message: "please add a name" }];
    // const myValues = Object.values(myObject); // [{ type: name, message: "please add a name" },{},{}]
    // 上記から、messageだけを取得した、新しい配列をつくる// [Please add an address,Please add a description,Please add a name]
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "server error" });
};

module.exports = errorHandler;
