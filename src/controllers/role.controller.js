import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Role from "../models/roles.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Roles } from "../enums/role-enums.js";
import mongoose from "mongoose";

const createRole = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Role name is required");
  }

  if (!Object.values(Roles).includes(name)) {
    throw new ApiError(400, "Invalid role name. Must be one of: " + Object.values(Roles).join(", "));
  }

  const existingRole = await Role.findOne({ name });

  if (existingRole) {
    throw new ApiError(409, "Role with this name already exists");
  }

  const role = await Role.create({ name });

  if (!role) {
    throw new ApiError(500, "Something went wrong while creating the role");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, role, "Role created successfully"));
});

const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, roles, "Roles fetched successfully"));
});

const getRoleById = asyncHandler(async (req, res) => {
  const { roleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new ApiError(400, "Invalid role ID");
  }

  const role = await Role.findById(roleId);

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role fetched successfully"));
});

const getRoleByName = asyncHandler(async (req, res) => {
  const { name } = req.params;

  if (!name) {
    throw new ApiError(400, "Role name is required");
  }

  const role = await Role.findOne({ name: name.toUpperCase() });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role fetched successfully"));
});

const updateRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new ApiError(400, "Invalid role ID");
  }

  if (!name) {
    throw new ApiError(400, "Role name is required");
  }

  if (!Object.values(Roles).includes(name)) {
    throw new ApiError(400, "Invalid role name. Must be one of: " + Object.values(Roles).join(", "));
  }

  // Check if another role with the same name exists
  const existingRole = await Role.findOne({ 
    name, 
    _id: { $ne: roleId } 
  });

  if (existingRole) {
    throw new ApiError(409, "Role with this name already exists");
  }

  const role = await Role.findByIdAndUpdate(
    roleId,
    { $set: { name } },
    { new: true, runValidators: true }
  );

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role updated successfully"));
});

const deleteRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new ApiError(400, "Invalid role ID");
  }

  const role = await Role.findByIdAndDelete(roleId);

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Role deleted successfully"));
});

const initializeRoles = asyncHandler(async (req, res) => {
  const rolesToCreate = Object.values(Roles);
  const createdRoles = [];

  for (const roleName of rolesToCreate) {
    const existingRole = await Role.findOne({ name: roleName });
    
    if (!existingRole) {
      const role = await Role.create({ name: roleName });
      createdRoles.push(role);
    }
  }

  if (createdRoles.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "All roles already exist"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdRoles, `${createdRoles.length} roles initialized successfully`));
});

const getRoleStats = asyncHandler(async (req, res) => {
  const totalRoles = await Role.countDocuments();
  const availableRoles = Object.values(Roles);
  
  const roleStats = {
    totalRoles,
    availableRoleTypes: availableRoles,
    totalAvailableTypes: availableRoles.length,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, roleStats, "Role statistics fetched successfully"));
});

export {
  createRole,
  getAllRoles,
  getRoleById,
  getRoleByName,
  updateRole,
  deleteRole,
  initializeRoles,
  getRoleStats,
};
