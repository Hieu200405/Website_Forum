const router = require('express').Router();
const ReportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /api/reports
router.post('/', authMiddleware, ReportController.report);

module.exports = router;
