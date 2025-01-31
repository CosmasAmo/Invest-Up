import AuditLog from '../models/auditLogModel.js';

const auditLogger = async (req, res, next) => {
    const originalSend = res.json;
    res.json = function(data) {
        if (data.success) {
            AuditLog.create({
                userId: req.userId,
                action: req.originalUrl,
                method: req.method,
                details: JSON.stringify({
                    body: req.body,
                    params: req.params,
                    query: req.query
                }),
                ipAddress: req.ip
            });
        }
        originalSend.call(this, data);
    };
    next();
};

export default auditLogger; 