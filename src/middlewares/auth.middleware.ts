import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import resCont from "../common/response.helper";
import logger from "../config/logger.config";
import * as model from "../model/user.model"


export async function isValid (req: Request, res: Response, next: NextFunction) {
  // Checking whether the client sends auth token
  if (!req.headers.authorization) {
    return resCont.unauthorized(res);
  }

  const token = req.headers.authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) return resCont.unauthorized(res);

  try {
    const { userId, email, role, name }: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    );
    (req as any).userData = {
      userId,
      email,
      role,
      name,
    };

    const res01 = await model.getUserVerify(userId);
    if (res01 === "valid") {
      return next(); // <-- return added
    } else {
      return resCont.unauthorized(res);
    }
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn("JWT EXPIRED");
      return res.status(401).send({
        status: 401,
        data: [],
        message: "Token expired",
      });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      logger.warn("JWT INVALID");
      return resCont.unauthorized(res);
    }

    logger.error("W_ERROR:" + err.stack);
    return resCont.unauthorized(res);
  }
}

export async function checkRole (req: Request, res: Response, next: NextFunction) {
  const { role } = (req as any).userData;
  if (role !== "admin") {
    return resCont.unauthorized(res, "Only admin has access to this action.");
  }
  next();
}
