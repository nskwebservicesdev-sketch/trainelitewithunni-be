import * as contactRequestModel from "../model/contact_request.model";
import { ContactRequestItem } from "../model/contact_request.model";

export async function create(payload: ContactRequestItem) {
  if (!payload.fullName || !payload.fullName.trim()) {
    return { success: false, data: null, message: "Full name is required" };
  }

  const requestId = await contactRequestModel.createContactRequest(payload);
  const createdRecord = await contactRequestModel.getContactRequestById(requestId);

  return {
    success: true,
    data: createdRecord,
    message: "Contact request submitted successfully",
  };
}

export async function getAll() {
  const records = await contactRequestModel.getAllContactRequests();
  return {
    success: true,
    data: records,
    message: "Contact requests retrieved successfully",
  };
}

export async function getById(id: number) {
  const record = await contactRequestModel.getContactRequestById(id);
  if (!record) {
    return { success: false, data: null, message: "Contact request not found" };
  }
  return {
    success: true,
    data: record,
    message: "Contact request retrieved successfully",
  };
}

export async function update(id: number, payload: Partial<ContactRequestItem>) {
  const existing = await contactRequestModel.getContactRequestById(id);
  if (!existing) {
    return { success: false, data: null, message: "Contact request not found" };
  }

  await contactRequestModel.updateContactRequest(id, payload);
  const updatedRecord = await contactRequestModel.getContactRequestById(id);

  return {
    success: true,
    data: updatedRecord,
    message: "Contact request updated successfully",
  };
}

export async function remove(id: number) {
  const existing = await contactRequestModel.getContactRequestById(id);
  if (!existing) {
    return { success: false, data: null, message: "Contact request not found" };
  }

  await contactRequestModel.deleteContactRequest(id);
  return {
    success: true,
    data: null,
    message: "Contact request deleted successfully",
  };
}
