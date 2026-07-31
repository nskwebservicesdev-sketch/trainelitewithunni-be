import { Request, Response } from "express";
import logger from "../config/logger.config";
import loggerModel from "../model/logger.model";
import resHelper from "../common/response.helper";
import * as galleryService from "../service/transformation_gallery.service";

/**
 * Extracts the S3 key (or fallback location/filename) from a multer file object.
 */
function extractFileKey(fileObj: any): string | null {
  if (!fileObj) return null;
  return fileObj.key || fileObj.location || fileObj.filename || null;
}

/**
 * Parses image keys from req.file or req.files or req.body.
 */
function parseImageKeys(req: Request): { beforeImg?: string; afterImg?: string } {
  let beforeImg: string | undefined;
  let afterImg: string | undefined;

  // Handling single file upload via req.file
  if (req.file) {
    const key = extractFileKey(req.file);
    if (key) {
      if (req.file.fieldname === "afterImg") {
        afterImg = key;
      } else {
        beforeImg = key;
      }
    }
  }

  // Handling multiple files upload via req.files
  if (req.files) {
    if (Array.isArray(req.files)) {
      if (req.files.length > 0) beforeImg = extractFileKey(req.files[0]) || undefined;
      if (req.files.length > 1) afterImg = extractFileKey(req.files[1]) || undefined;
    } else {
      const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (filesMap["beforeImg"] && filesMap["beforeImg"].length > 0) {
        beforeImg = extractFileKey(filesMap["beforeImg"][0]) || undefined;
      }
      if (filesMap["afterImg"] && filesMap["afterImg"].length > 0) {
        afterImg = extractFileKey(filesMap["afterImg"][0]) || undefined;
      }
      if (filesMap["image"] && filesMap["image"].length > 0 && !beforeImg) {
        beforeImg = extractFileKey(filesMap["image"][0]) || undefined;
      }
    }
  }

  // Fallback to body properties if not uploaded as file
  if (!beforeImg && req.body.beforeImg) beforeImg = req.body.beforeImg;
  if (!afterImg && req.body.afterImg) afterImg = req.body.afterImg;

  return { beforeImg, afterImg };
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;
    const { beforeImg, afterImg } = parseImageKeys(req);

    const result = await galleryService.create({ name, description, beforeImg, afterImg });
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in transformation gallery create controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "transformation-gallery/create",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const result = await galleryService.getAll();
    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in transformation gallery getAll controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "transformation-gallery/getAll",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      resHelper.badReq(res, null, "Invalid ID");
      return;
    }

    const result = await galleryService.getById(id);
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in transformation gallery getById controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "transformation-gallery/getById",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      resHelper.badReq(res, null, "Invalid ID");
      return;
    }

    const { name, description } = req.body;
    const { beforeImg, afterImg } = parseImageKeys(req);

    const result = await galleryService.update(id, { name, description, beforeImg, afterImg });
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in transformation gallery update controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "transformation-gallery/update",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam as string, 10);
    if (isNaN(id)) {
      resHelper.badReq(res, null, "Invalid ID");
      return;
    }

    const result = await galleryService.remove(id);
    if (!result.success) {
      resHelper.badReq(res, null, result.message);
      return;
    }

    resHelper.success(res, result.data, result.message);
  } catch (err: any) {
    logger.error(`Error in transformation gallery remove controller: ${err.message}`);
    await loggerModel.insertException(
      req.originalUrl || "transformation-gallery/remove",
      { body: req.body, params: req.params, query: req.query },
      err.stack || err.message
    );
    resHelper.error(res, null, "Something went wrong");
  }
}
