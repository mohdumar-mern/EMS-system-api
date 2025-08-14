import rateLimit from "express-rate-limit";


// 🌐 Global rate limiter
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many requests. Please try again later.",
    },
    handler: (req, res, next, options) => {
      console.warn(`🌐 Rate limit exceeded on ${req.method} ${req.originalUrl} from IP: ${req.ip}`);
      res.status(options.statusCode).json(options.message);
    },
  });
  
// 🔐 Rate limiter for login route with logging
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 5 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
  handler: (req, res, next, options) => {
    console.warn(
      `🚨 Brute force attempt detected: ${req.method} ${req.originalUrl} from IP: ${req.ip}`
    );
    res.status(options.statusCode).json(options.message);
  },
});


export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many registrations from this IP, please try again later.",
    },
    handler: (req, res, next, options) => {
      console.warn(
        `🚨 High registration frequency: ${req.method} ${req.originalUrl} from IP: ${req.ip}`
      );
      res.status(options.statusCode).json(options.message);
    },
  });
  