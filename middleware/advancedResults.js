const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query（パラメーターで指定された内容をとってきてコピーしただけのもの）
  const reqQuery = { ...req.query };

  // Fields to exclude selectとかのパラメーターフィールドはreqQueryから除外する
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)（大なり小なりなど）
  //   greater than/ greater than or equal...
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource Queryのあるオブジェクトを見つけてくる
  query = model.find(JSON.parse(queryStr));

  // Select Fields（セレクトされたプロパティだけが帰ってくる）
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort（ソートの対象のプロパティの値の順番で帰ってくる）
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  //   parseInt　number typeにする。第2引数は10進法であることの指定
  //   nページ目か？？？
  const page = parseInt(req.query.page, 10) || 1;
  //   1ページにn件表示するか
  const limit = parseInt(req.query.limit, 10) || null;
  //   nページ目の、最初のオブジェクトの番号
  const startIndex = (page - 1) * limit;
  //   nページ目の、全部の件数のうちの、最後のオブジェクトの番号
  const endIndex = page * limit;
  //   全件の件数
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  //   nページ目の最後のインデックス番号が全件の件数より少ない場合（最後のページじゃない場合）の、次のページのページ番号と、表示件数
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }
  //   nページ目の最初のインデックス番号が0より大きい場合（最初のページじゃない場合）の、前のページのページ番号と、表示件数
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
