const validators = require("./validators.js");

const validateUUID = (param = "id") => {
  return (req, res, next) => {
    validators.validateUUID(req.params[param]);
    next();
  };
};

const runFields = [
  {
    key: "startTime",
    input: startTime,
    validate: (input) => {
      validators.assertString(input, "startTime");
      const trimmed = input.trim();
      validators.validateISO(trimmed, "startTime", "datetime");
      return trimmed;
    },
  },
  {
    key: "durationSec",
    input: durationSec,
    validate: (input) => {
      const normalized = Number(String(input).trim());
      validators.validatePositiveNumber(normalized, "durationSec");
      return normalized;
    },
  },
  {
    key: "distanceMeters",
    input: distanceMeters,
    validate: (input) => {
      const normalized = Number(String(input).trim());
      validators.validatePositiveNumber(normalized, "distanceMeters");
      return normalized;
    },
  },
];

const validateRun = ({ mode = "require_all" }) => {
  return (req, res, next) => {
    validators.validateJsonContentType(req);

    validators.assertRequestFields({
      object: req.body,
      objectName: "Run data",
      requiredFields: runFields.map((field) => field.key),
      mode: mode,
    });

    const boundRunFields = runFields.map((field) => ({
      ...field,
      input: req.body[field.key],
    }));

    const runData = Object.fromEntries(
      boundRunFields
        .filter((field) => field.input != null)
        .map((field) => [field.key, field.validate(field.input)]),
    );

    req.runData = runData;
    next();
  };
};

module.exports = { validateUUID, validateRun };
