const ViewLogsUseCase = require('../usecases/viewLogs.usecase');

class LogController {
  
  static async getLogs(req, res) {
    try {
      // req.query chứa các params: page, limit, userId, action, from, to
      const result = await ViewLogsUseCase.execute(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = LogController;
