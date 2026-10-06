const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { ROLE_DETAILS } = require('../data/roles');

const JWT_SECRET = process.env.JWT_SECRET || 'TMS_SUPER_SECRET_KEY_JWT_2026_K15C6';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 phút

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware xác thực JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      code: 'AUTH_TOKEN_MISSING',
      message: 'Vui lòng đăng nhập để tiếp tục truy cập.',
    });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({
      code: 'AUTH_TOKEN_INVALID',
      message: 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
    });
  }

  // Kiểm tra phiên trên server còn hiệu lực hay đã bị thu hồi
  if (decoded.sessionId && !store.isSessionValid(decoded.sessionId)) {
    return res.status(401).json({
      code: 'AUTH_SESSION_REVOKED',
      message: 'Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.',
    });
  }

  // Lấy thông tin user mới nhất từ store để có vai trò và trạng thái tức thì (S1-09, S1-10)
  const user = store.findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({
      code: 'AUTH_USER_NOT_FOUND',
      message: 'Tài khoản người dùng không tồn tại.',
    });
  }

  if (user.status === 'LOCKED') {
    return res.status(403).json({
      code: 'AUTH_ACCOUNT_LOCKED',
      message: `Tài khoản của bạn đã bị khoá. Lý do: ${user.lockReason || 'Liên hệ Quản trị viên để biết thêm chi tiết.'}`,
    });
  }

  req.user = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    activeRole: decoded.activeRole && user.roles.includes(decoded.activeRole) ? decoded.activeRole : user.roles[0],
    sessionId: decoded.sessionId,
  };

  next();
}

// Middleware kiểm tra quyền theo vai trò (S1-05: Mặc định là từ chối)
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'AUTH_UNAUTHORIZED',
        message: 'Bạn chưa đăng nhập vào hệ thống.',
      });
    }

    // Kiểm tra xem vai trò hiện tại hoặc bất kỳ vai trò nào của user có khớp không
    const hasRole = req.user.roles.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        code: 'AUTH_FORBIDDEN',
        message: 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Quản trị viên.',
        requiredRoles: allowedRoles,
        currentRoles: req.user.roles,
      });
    }

    next();
  };
}

// Middleware kiểm tra quyền theo permission
function requirePermissions(...requiredPerms) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'AUTH_UNAUTHORIZED',
        message: 'Bạn chưa đăng nhập vào hệ thống.',
      });
    }

    // Tập hợp toàn bộ permission từ tất cả vai trò mà user sở hữu
    const userPerms = new Set();
    for (const r of req.user.roles) {
      const details = ROLE_DETAILS[r];
      if (details && Array.isArray(details.permissions)) {
        details.permissions.forEach(p => userPerms.add(p));
      }
    }

    const hasAll = requiredPerms.every(p => userPerms.has(p));
    if (!hasAll) {
      return res.status(403).json({
        code: 'AUTH_FORBIDDEN',
        message: 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Quản trị viên.',
        requiredPermissions: requiredPerms,
      });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  signAccessToken,
  verifyAccessToken,
  authenticateToken,
  requireRoles,
  requirePermissions,
};
