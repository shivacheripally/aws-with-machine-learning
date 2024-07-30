const errorHandle = (req, res, next) => {
  // res.send(
  //   "<h1>Error 404 the page you are looking is not Found</h1>"
  // );
  res
    .status(404)
    .send("<h1>Error 404: The page you are looking for is not found</h1>");
};

export default errorHandle;
