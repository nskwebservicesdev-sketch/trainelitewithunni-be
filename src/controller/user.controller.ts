import { Request, Response } from "express";
import * as userService from "../service/user.service";
import constants from "../common";
import logger from "../config/logger.config";
import loggerModel from "../model/logger.model";
import resHelper from "../common/response.helper";

/**
 * Controller to handle user registration.
 * Performs request validation and returns the standardized response.
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    // Fast inline validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !password) {
      resHelper.badReq(res, null, 'Name, email, and password are required');
      return;
    }

    if (!emailRegex.test(email)) {
      resHelper.badReq(res, null, 'Invalid email format');
      return;
    }

    if (password.length < 6) {
      resHelper.badReq(res, null, "Password must be at least 6 characters long");
      return;
    }

    const result = await userService.registerUser({ name, email, password, role });

    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, "Registration successful");
  } catch (error: any) {
    logger.error(`Error in registerUser controller: ${error.message}`);
    await loggerModel.insertException(
      req.originalUrl || "user/register",
      { body: req.body, params: req.params, query: req.query },
      error.stack || error.message
    );
    resHelper.error(res, null, 'Something went wrong');
  }
}

/**
 * Controller to handle user login.
 * Performs request validation and returns the standardized response with JWT token.
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(constants.BAD_REQ).json({
        status: constants.BAD_REQ,
        message: "Email and password are required",
      });
      return;
    }

    const result = await userService.loginUser({ email, password });

    if (!result.success) {
      resHelper.unauthorized(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, "Login successful");
  } catch (error: any) {
    logger.error(`Error in loginUser controller: ${error.message}`);
    await loggerModel.insertException(
      req.originalUrl || "user/login",
      { body: req.body, params: req.params, query: req.query },
      error.stack || error.message
    );
    resHelper.error(res, null, 'Something went wrong');
  }
}