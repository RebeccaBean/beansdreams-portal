const { Op } = require("sequelize");

module.exports = function buildSearchQuery(query) {
  const where = {};

  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { email: { [Op.iLike]: `%${query.search}%` } }
    ];
  }

  if (query.role) {
    where.role = query.role;
  }

  return where;
};
