import { Request, Response } from "express";
import logger from "../config/logger.config";
import loggerModel from "../model/logger.model";
import resHelper from "../common/response.helper";
import * as contactRequestService from "../service/contact_request.service";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      goal,
      age,
      height,
      weight,
      message,
      occupation,
      activityScale,
      medicalProblem,
    } = req.body;

    if (!fullName) {
      resHelper.badReq(res, null, "Full name is required");
      return;
    }

    const result = await contactRequestService.create({
      fullName,
      email,
      phone,
      location,
      goal,
      age,
      height,
      weight,
      message,
      occupation,
      activityScale,
      medicalProblem,
    });

    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in contact request create controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "contact-request/create",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const result = await contactRequestService.getAll();
    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in contact request getAll controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "contact-request/getAll",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      resHelper.badReq(res, null, "Invalid contact request ID");
      return;
    }

    const result = await contactRequestService.getById(id);
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in contact request getById controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "contact-request/getById",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      resHelper.badReq(res, null, "Invalid contact request ID");
      return;
    }

    const payload = req.body;
    const result = await contactRequestService.update(id, payload);
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in contact request update controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "contact-request/update",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      resHelper.badReq(res, null, "Invalid contact request ID");
      return;
    }

    const result = await contactRequestService.remove(id);
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in contact request remove controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "contact-request/remove",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}
