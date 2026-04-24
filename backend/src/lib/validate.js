/**
 * Small, dependency-free request validator.
 *
 * Usage in a controller:
 *
 *   const { validate, v } = require('../lib/validate');
 *   const { ok, fail } = require('../lib/response');
 *
 *   const { errors, data } = validate(req.body, {
 *     name:    v.string({ required: true, max: 200 }),
 *     email:   v.email({ required: true }),
 *     message: v.string({ required: true, max: 5000 }),
 *   });
 *   if (errors) return fail(res, 400, errors);
 *   // data.name, data.email, data.message are trimmed + clean
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function string({ required = false, min = 0, max = 500, trim = true } = {}) {
  return (val) => {
    if (val === undefined || val === null || val === '') {
      return required ? 'wajib diisi' : null;
    }
    if (typeof val !== 'string') return 'harus berupa teks';
    const clean = trim ? val.trim() : val;
    if (clean.length < min) return `minimal ${min} karakter`;
    if (clean.length > max) return `maksimal ${max} karakter`;
    return { value: clean };
  };
}

function email({ required = false, max = 200 } = {}) {
  return (val) => {
    if (val === undefined || val === null || val === '') {
      return required ? 'wajib diisi' : null;
    }
    if (typeof val !== 'string') return 'harus berupa teks';
    const clean = val.trim().toLowerCase();
    if (clean.length > max) return `maksimal ${max} karakter`;
    if (!EMAIL_RE.test(clean)) return 'format email tidak valid';
    return { value: clean };
  };
}

function oneOf(options, { required = false } = {}) {
  return (val) => {
    if (val === undefined || val === null || val === '') {
      return required ? 'wajib diisi' : null;
    }
    if (!options.includes(val)) return `harus salah satu dari: ${options.join(', ')}`;
    return { value: val };
  };
}

function boolean({ required = false } = {}) {
  return (val) => {
    if (val === undefined || val === null) {
      return required ? 'wajib diisi' : null;
    }
    if (typeof val === 'boolean') return { value: val };
    if (val === 'true'  || val === 1 || val === '1') return { value: true };
    if (val === 'false' || val === 0 || val === '0') return { value: false };
    return 'harus true atau false';
  };
}

function validate(input, schema) {
  const data = {};
  const errors = {};
  const src = input && typeof input === 'object' ? input : {};

  for (const [field, rule] of Object.entries(schema)) {
    const result = rule(src[field]);
    if (result && typeof result === 'object' && 'value' in result) {
      data[field] = result.value;
    } else if (typeof result === 'string') {
      errors[field] = result;
    }
  }

  if (Object.keys(errors).length > 0) {
    const summary = Object.entries(errors)
      .map(([f, m]) => `${f}: ${m}`)
      .join('; ');
    return { errors: summary, fieldErrors: errors, data: null };
  }
  return { errors: null, fieldErrors: {}, data };
}

module.exports = {
  validate,
  v: { string, email, oneOf, boolean },
};
