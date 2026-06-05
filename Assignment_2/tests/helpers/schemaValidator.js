// tests/helpers/schemaValidator.js
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function validateSchema(schema, data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    return { valid: false, errors: ajv.errorsText(validate.errors) };
  }
  return { valid: true, errors: null };
}

module.exports = { validateSchema };
