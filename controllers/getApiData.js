import Data from "../model/dataSchema.js";

export const getApiData = async (req, res) => {
  const data = await Data.findAll();
  const dataValues = data.map((record) => record.dataValues);
  return res.status(200).send({
    data: dataValues,
  });
};

export const postData = async (req, res) => {
  try {
    const { year, gdp } = req.body;
    console.log("body ", req.body);
    if (!year || !gdp) {
      return res.status(400).json({ message: "Year and GDP are required" });
    }
    await Data.create({ year, gdp });
    return res
      .status(201)
      .json({ message: "Data created successfully", data: { year, gdp } });
  } catch (err) {
    console.error(`Error while creating a record in DB: ${err}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
