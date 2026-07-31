import { Request, Response } from "express";
import logger from "../config/logger.config";
import loggerModel from "../model/logger.model";
import resHelper from "../common/response.helper";
import * as service from "../service/service.service";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, duration } = req.body;
    if (!name) {
      resHelper.badReq(res, null, "Service name is required");
      return;
    }

    const result = await service.create({ name, description, duration });
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in service create controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "service/create",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.getAll();
    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in service getAll controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "service/getAll",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const serviceId = parseInt(req.params.id as string, 10);
    if (isNaN(serviceId)) {
      resHelper.badReq(res, null, "Invalid service ID");
      return;
    }

    const result = await service.getById(serviceId);
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in service getById controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "service/getById",
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
      resHelper.badReq(res, null, "Invalid service ID");
      return;
    }

    const { name, description, duration } = req.body;
    const result = await service.update(id, { name, description, duration });
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in service update controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "service/update",
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
      resHelper.badReq(res, null, "Invalid service ID");
      return;
    }

    const result = await service.remove(id);
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in service remove controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "service/remove",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}
