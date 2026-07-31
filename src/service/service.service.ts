import logger from "../config/logger.config";
import * as serviceModel from "../model/service.model";

export async function create(payload: { name: string; description?: string; duration?: string }) {
  if (!payload.name) {
    return { success: false, data: null, message: "Service name is required" };
  }

  const existing = await serviceModel.findByName(payload.name);
  if (existing) {
    return { success: false, data: null, message: "Service with this name already exists" };
  }

  const serviceId = await serviceModel.createService(payload);
  const createdService = await serviceModel.getServiceById(serviceId);

  return {
    success: true,
    data: createdService,
    message: "Service created successfully",
  };
}

export async function getAll() {
  const services = await serviceModel.getAllServices();
  return {
    success: true,
    data: services,
    message: "Services retrieved successfully",
  };
}

export async function getById(id: number) {
  const service = await serviceModel.getServiceById(id);
  if (!service) {
    return { success: false, data: null, message: "Service not found" };
  }
  return {
    success: true,
    data: service,
    message: "Service retrieved successfully",
  };
}

export async function update(id: number, payload: { name?: string; description?: string; duration?: string }) {
  const existing = await serviceModel.getServiceById(id);
  if (!existing) {
    return { success: false, data: null, message: "Service not found" };
  }

  if (payload.name && payload.name !== existing.name) {
    const duplicate = await serviceModel.findByName(payload.name);
    if (duplicate) {
      return { success: false, data: null, message: "Service with this name already exists" };
    }
  }

  await serviceModel.updateService(id, payload);
  const updatedService = await serviceModel.getServiceById(id);

  return {
    success: true,
    data: updatedService,
    message: "Service updated successfully",
  };
}

export async function remove(id: number) {
  const existing = await serviceModel.getServiceById(id);
  if (!existing) {
    return { success: false, data: null, message: "Service not found" };
  }

  await serviceModel.deleteService(id);
  return {
    success: true,
    data: null,
    message: "Service deleted successfully",
  };
}
