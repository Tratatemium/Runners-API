import { Request, Response, NextFunction } from "express";

/* ================================================================================================= */
/*  HELPER FUNCTIONS                                                                                 */
/* ================================================================================================= */

class ValidationError extends Error {
  field?: string;
  status: number;

  constructor(message: string, field?: string, status: number = 400) {
    super(message);
    this.name = "ValidationError";
    this.status = status;
    this.field = field;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

interface ThrowValidationErrorParams {
  message: string;
  field?: string;
  status?: number;
}

const throwValidationError = ({
  message,
  field = undefined,
  status = 400,
}: ThrowValidationErrorParams) => {
  throw new ValidationError(message, field, status);
};

/* ================================================================================================= */
/*  VALIDATE FUNCTIONS                                                                               */
/* ================================================================================================= */

const validateJsonContentType = (req: Request) => {
  if (!req.is("json")) {
    throwValidationError({
      message: "Content-Type must be json.",
      status: 415,
    });
  }
};

interface AssertRequestFieldsParams {
  object: any;
  objectName?: string;
  requiredFields: string[];
  allowedFields: string[];
  mode?: string;
}

const assertRequestFields = ({
  object,
  objectName = "Request body",
  requiredFields,
  allowedFields,
  mode = "require_all",
}: AssertRequestFieldsParams) => {
  if (!["require_all", "require_some"].includes(mode)) {
    throw new Error(`Invalid validation mode: ${mode}.`);
  }
  if (!Array.isArray(requiredFields) || requiredFields.length === 0) {
    throw new Error("requiredFields must be a non-empty array.");
  }
  if (
    allowedFields != null &&
    (!Array.isArray(allowedFields) || allowedFields.length === 0)
  ) {
    throw new Error("allowedFields must be a non-empty array.");
  }
  if (typeof object !== "object" || object == null || Array.isArray(object)) {
    throwValidationError({
      message: `${objectName} must be provided as an object.`,
    });
  }

  if (allowedFields != null) {
    for (const key of Object.keys(object)) {
      if (!allowedFields.includes(key)) {
        throwValidationError({ message: `Unknown field: ${key}` });
      }
    }
  }

  const hasValue = (field: string) => object[field] != null;

  if (mode === "require_all") {
    const missingFields = requiredFields.filter((field) => !hasValue(field));
    if (missingFields.length > 0) {
      throwValidationError({
        message: `${objectName} is missing required fields: ${missingFields.join(", ")}.`,
      });
    }
    return;
  }

  if (mode === "require_some") {
    const hasAtLeastOneField = requiredFields.some((field) => hasValue(field));
    if (!hasAtLeastOneField) {
      throwValidationError({
        message: `${objectName} must have one of the required fields: ${requiredFields.join(", ")}.`,
      });
    }
    return;
  }
};

const assertString = (str: string, strName: string) => {
  if (typeof str !== "string") {
    throwValidationError({
      message: `${strName} must be a string.`,
      field: strName,
    });
  }
};

const validateUUID = (ID: string, IDname = "ID") => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUUID = uuidRegex.test(ID);
  if (!isUUID) {
    throwValidationError({
      message: `${IDname} must be a valid UUID.`,
      field: IDname,
    });
  }
};

const validateISO = (
  value: string,
  name: string,
  mode: "date" | "datetime" = "datetime",
) => {
  if (typeof value !== "string") {
    throwValidationError({ message: `${name} must be a string.`, field: name });
  }

  // -------------------
  // DATE-ONLY MODE
  // -------------------
  if (mode === "date") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throwValidationError({
        message: `${name} must be a valid ISO 8601 date (YYYY-MM-DD).`,
        field: name,
      });
    }

    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime())) {
      throwValidationError({
        message: `${name} must be a valid calendar date.`,
        field: name,
      });
    }

    if (date.toISOString().slice(0, 10) !== value) {
      throwValidationError({
        message: `${name} must be a real calendar date.`,
        field: name,
      });
    }

    return;
  }

  // -------------------
  // DATETIME MODE
  // -------------------
  if (mode === "datetime") {
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
    if (!datetimeRegex.test(value)) {
      throwValidationError({
        message: `${name} must be a valid ISO 8601 timestamp with timezone (UTC).`,
        field: name,
      });
    }

    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      throwValidationError({
        message: `${name} must be a valid ISO 8601 timestamp.`,
        field: name,
      });
    }

    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart
      .replace("Z", "")
      .split(":")
      .map(Number);
    const secondWhole = Math.floor(second);

    const isValid =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day &&
      date.getUTCHours() === hour &&
      date.getUTCMinutes() === minute &&
      date.getUTCSeconds() === secondWhole;

    if (!isValid) {
      throwValidationError({
        message: `${name} must be a real calendar date and time.`,
        field: name,
      });
    }

    return;
  }

  // -------------------
  // INVALID MODE
  // -------------------
  throw new Error(
    `Invalid mode "${mode}" in validateISO. Must be "date" or "datetime".`,
  );
};

const validatePositiveNumber = (number: number, numberName: string) => {
  if (isNaN(number) || number <= 0 || typeof number !== "number") {
    throwValidationError({
      message: `${numberName} must be a positive number.`,
      field: numberName,
    });
  }
};

const validateUsername = (username: string) => {
  if (typeof username !== "string") {
    throwValidationError({
      message: "Username must be a string.",
      field: "username",
    });
  }
  if (username.length < 4 || username.length > 20) {
    throwValidationError({
      message: "Username must be between 4 and 20 characters long.",
      field: "username",
    });
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    throwValidationError({
      message: "Username may only contain letters, numbers, and underscores.",
      field: "username",
    });
  }
};

const validateEmail = (email: string) => {
  if (typeof email !== "string") {
    throwValidationError({
      message: "Email must be a string.",
      field: "email",
    });
  }
  if (email.length > 254) {
    throwValidationError({
      message: "Email must not be longer than 254 characters.",
      field: "email",
    });
  }
  if (/\s/.test(email)) {
    throwValidationError({
      message: "Email must not contain whitespace.",
      field: "email",
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throwValidationError({
      message: "Email must be a valid email address.",
      field: "email",
    });
  }
};

const validatePassword = (password: string) => {
  if (typeof password !== "string") {
    throwValidationError({
      message: "Password must be a string.",
      field: "password",
    });
  }
  const length = password.length;
  if (length < 8) {
    throwValidationError({
      message: "Password must be at least 8 characters long.",
      field: "password",
    });
  }
  if (length > 128) {
    throwValidationError({
      message: "Password must be at most 128 characters long.",
      field: "password",
    });
  }
};

const validateName = (name: string, fieldName: string) => {
  if (typeof name !== "string")
    throwValidationError({
      message: `${fieldName} must be a string.`,
      field: fieldName,
    });

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throwValidationError({
      message: `${fieldName} cannot be empty.`,
      field: fieldName,
    });
  }
  if (trimmed.length < 2 || trimmed.length > 50) {
    throwValidationError({
      message: `${fieldName} must contain between 2 and 50 characters.`,
      field: fieldName,
    });
  }

  const nameRegex = /^\p{L}+([ '-]\p{L}+)*$/u;
  if (!nameRegex.test(trimmed)) {
    throwValidationError({
      message: `${fieldName} contains forbidden characters.`,
      field: fieldName,
    });
  }
};

/* ================================================================================================= */
/*  EXPORTS                                                                                          */
/* ================================================================================================= */

module.exports = {
  throwValidationError,
  validateJsonContentType,
  assertRequestFields,
  assertString,
  validateUUID,
  validateISO,
  validatePositiveNumber,
  validateUsername,
  validateEmail,
  validatePassword,
  validateName,
};
