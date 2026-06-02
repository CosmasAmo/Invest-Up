import AuditLog from '../models/AuditLog.js';

export const auditLogMiddleware = async (req, res, next) => {
    try {
        // Only create audit log if there's a valid userId
        if (req.userId) {
            await AuditLog.create({
                userId: req.userId,
                action: req.path,
                method: req.method,
                details: {
                    body: req.body,
                    params: req.params,
                    query: req.query
                },
                ipAddress: req.ip
            });
        }
        next();
    } catch (error) {
        console.error('Audit log error:', error);
        // Continue with the request even if logging fails
        next();
    }
}; 