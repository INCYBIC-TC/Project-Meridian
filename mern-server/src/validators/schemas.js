const Joi = require('joi');

exports.registerSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'name cannot be an empty string',
    'any.required': 'name is a required field'
  }),
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'email must be a valid email address',
    'string.empty': 'email cannot be an empty string',
    'any.required': 'email is a required field'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'password must be at least 6 characters long',
    'string.empty': 'password cannot be an empty string',
    'any.required': 'password is a required field'
  }),
  role: Joi.string().valid('admin', 'reviewer', 'user').default('user')
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'email must be a valid email address',
    'string.empty': 'email cannot be an empty string',
    'any.required': 'email is a required field'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'password cannot be an empty string',
    'any.required': 'password is a required field'
  })
});

exports.scanSchema = Joi.object({
  repoId: Joi.string().trim().min(1).required().messages({
    'string.empty': 'repoId cannot be an empty string',
    'any.required': 'repoId is a required field'
  }),
  files: Joi.array().items(
    Joi.alternatives().try(
      Joi.object({
        path: Joi.string().trim().min(1).required().messages({
          'string.empty': 'file path cannot be an empty string'
        }),
        content: Joi.string().required().messages({
          'any.required': 'file content is a required field'
        })
      }),
      Joi.string().trim().min(1).messages({
        'string.empty': 'file content cannot be an empty string'
      })
    )
  ).min(1).required().messages({
    'array.min': 'files array must contain at least 1 file',
    'any.required': 'files is a required field'
  }),
  triggeredBy: Joi.string().optional()
});
