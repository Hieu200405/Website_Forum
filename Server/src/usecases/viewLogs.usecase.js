const LogRepository = require('../repositories/log.repository');

class ViewLogsUseCase {
  /**
   * Xem log hệ thống (Admin)
   * @param {object} queryParams 
   */
  static async execute(queryParams) {
    // 1. Parse & Normalize params
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const userId = queryParams.userId ? parseInt(queryParams.userId) : null;
    const action = queryParams.action;
    const from = queryParams.from;
    const to = queryParams.to;

    // 2. Call Repository
    const result = await LogRepository.getLogs({
      userId,
      action,
      from,
      to,
      page,
      limit
    });

    // 3. Format Response
    return {
      page,
      limit,
      total: result.count,
      totalPages: Math.ceil(result.count / limit),
      logs: result.rows
    };
  }
}

module.exports = ViewLogsUseCase;
