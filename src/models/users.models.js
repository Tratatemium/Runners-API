const mongoose = require("mongoose");

/* ================================================================================================= */
/*  SUB-SCHEMAS                                                                                      */
/* ================================================================================================= */

const passwordMetadataSchema = new mongoose.Schema(
  {
    algorithm: {
      type: String,
      enum: ["bcrypt"],
      default: "bcrypt",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const CredentialsSchema = new mongoose.Schema(
  {
    passwordHash: {
      type: String,
      required: true,
    },
    passwordMetadata: {
      type: PasswordMetadataSchema,
      required: true,
    },
  },
  { _id: false },
);

const AccountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

/* ================================================================================================= */
/*  MAIN USER SCHEMA                                                                                 */
/* ================================================================================================= */

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    credentials: {
      type: CredentialsSchema,
      required: true,
    },

    account: {
      type: AccountSchema,
      required: true,
    },

    profile: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

/* ================================================================================================= */
/*  INDEXES                                                                                          */
/* ================================================================================================= */

UserSchema.index(
  { userId: 1 },
  { unique: true }
);

UserSchema.index(
  { "account.username": 1 },
  { unique: true }
);

UserSchema.index(
  { "account.email": 1 },
  { unique: true }
);

/* ================================================================================================= */
/*  IEXPORTS                                                                                         */
/* ================================================================================================= */

module.exports = mongoose.model("User", UserSchema);
