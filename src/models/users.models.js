const mongoose = require("mongoose");

/* ================================================================================================= */
/*  SUB-SCHEMAS                                                                                      */
/* ================================================================================================= */

const PasswordMetadataSchema = new mongoose.Schema(
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

const AuthSchema = new mongoose.Schema(
  {
    accessTokenVersion: {
      type: Number,
      required: true,
      default: 0,
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

const ProfileSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    heightCm: {
      type: Number,
      min: 0,
    },
    weightKg: {
      type: Number,
      min: 0,
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
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },

    credentials: {
      type: CredentialsSchema,
      required: true,
    },

    auth: {
      type: AuthSchema,
      required: true,
    },

    account: {
      type: AccountSchema,
      required: true,
    },

    profile: {
      type: ProfileSchema,
      default: {},
    },
  },
  { timestamps: true },
);

/* ================================================================================================= */
/*  Not leaking sensetive data to JSON                                                               */
/* ================================================================================================= */

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.credentials;
    delete ret.auth;
    delete ret.__v;

    return ret;
  }
});

/* ================================================================================================= */
/*  INDEXES                                                                                          */
/* ================================================================================================= */

UserSchema.index({ userId: 1 }, { unique: true });

UserSchema.index({ "account.username": 1 }, { unique: true });

UserSchema.index({ "account.email": 1 }, { unique: true });

/* ================================================================================================= */
/*  EXPORTS                                                                                         */
/* ================================================================================================= */

module.exports = mongoose.model("User", UserSchema);
