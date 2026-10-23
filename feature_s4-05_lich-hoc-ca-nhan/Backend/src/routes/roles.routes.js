const express = require('express');
const { ROLE_DETAILS, ROLES } = require('../data/roles');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách 8 vai trò và quyền hạn (S1-05)
router.get('/', authenticateToken, (req, res) => {
  res.json({
    roles: Object.values(ROLE_DETAILS),
    roleKeys: ROLES,
  });
});

module.exports = router;
