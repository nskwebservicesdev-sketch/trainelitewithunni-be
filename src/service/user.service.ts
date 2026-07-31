import { findUserByEmail, createUser, findUserById, User } from "../model/user.model";
import { hashPassword, comparePassword } from "../common/bcrypt";
import jwt from "jsonwebtoken";
import constants from "../common";

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

/**
 * Service to register a new user.
 * Performs checking of existing user, password hashing, and user insertion.
 */
export async function registerUser(payload: RegisterPayload) {
  if(!payload.password) {
    return {
      success: false,
      data: [],
      message: "Password is required",
    };
  }
  // Check if email already exists
  const existingUser = await findUserByEmail(payload.email);
  if (existingUser) {
    return {
      success: false,
      data: [],
      message: "Email is already registered",
    };
  }

  // Hash password asynchronously (Node.js best practice: prevents event loop blocking)
  const hashedPassword = await hashPassword(payload.password);

  // Insert user
  const userId = await createUser({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    role: payload.role || "user",
  });

  // Fetch the created user detail (excludes password for security)
  const user = await findUserById(userId);

  return {
    success: true,
    data: user,
    message: 'User registered successfully',
  };
}

/**
 * Service to login a user.
 * Performs lookup, password comparison, and JWT generation.
 */
export async function loginUser(payload: LoginPayload) {
  if (!payload.password) {
    return {
      success: false,
      data: [],
      message: "Password is required",
    };
  }

  // Find user by email
  const user = await findUserByEmail(payload.email);
  if (!user || !user.password) {
    return {
      success: false,
      data: [],
      message: "Invalid email or password",
    };
  }

  // Compare password asynchronously (Node.js best practice: prevents event loop blocking)
  const isMatch = await comparePassword(payload.password, user.password);
  if (!isMatch) {
    return {
      success: false,
      data: [],
      message: "Invalid email or password",
    };
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET || "trainelitewithunni_supersecret_key@2026";
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: "24h" }
  );

  // Exclude password from the returned user details
  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return {
    success: true,
    data: {
      user: userResponse,
      token,
    },
    message: "User logged in successfully",
  };
}
