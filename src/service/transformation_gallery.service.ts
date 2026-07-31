import logger from "../config/logger.config";
import * as galleryModel from "../model/transformation_gallery.model";

export interface GalleryPayload {
  name?: string;
  description?: string;
  beforeImg?: string;
  afterImg?: string;
}

export async function create(payload: GalleryPayload) {
  const itemId = await galleryModel.createGalleryItem(payload);
  const createdItem = await galleryModel.getGalleryItemById(itemId);

  return {
    success: true,
    data: createdItem,
    message: "Transformation gallery item created successfully",
  };
}

export async function getAll() {
  const items = await galleryModel.getAllGalleryItems();
  return {
    success: true,
    data: items,
    message: "Transformation gallery items retrieved successfully",
  };
}

export async function getById(id: number) {
  const item = await galleryModel.getGalleryItemById(id);
  if (!item) {
    return { success: false, data: null, message: "Transformation gallery item not found" };
  }
  return {
    success: true,
    data: item,
    message: "Transformation gallery item retrieved successfully",
  };
}

export async function update(id: number, payload: GalleryPayload) {
  const existing = await galleryModel.getGalleryItemById(id);
  if (!existing) {
    return { success: false, data: null, message: "Transformation gallery item not found" };
  }

  await galleryModel.updateGalleryItem(id, payload);
  const updatedItem = await galleryModel.getGalleryItemById(id);

  return {
    success: true,
    data: updatedItem,
    message: "Transformation gallery item updated successfully",
  };
}

export async function remove(id: number) {
  const existing = await galleryModel.getGalleryItemById(id);
  if (!existing) {
    return { success: false, data: null, message: "Transformation gallery item not found" };
  }

  await galleryModel.deleteGalleryItem(id);
  return {
    success: true,
    data: null,
    message: "Transformation gallery item deleted successfully",
  };
}
