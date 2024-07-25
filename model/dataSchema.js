import { DataTypes, INTEGER } from "sequelize";
import { sequelize } from "../config/db.js";

const Data = sequelize.define("Data", {
  year: {
    type: DataTypes.INTEGER,
    unique: true,
  },
  gdp: {
    type: INTEGER,
  },
});

export default Data;

(async () => {
  await sequelize.sync();
})();
