import * as Joi from 'joi';
import { Response, Request, NextFunction } from 'express';
import { UNPROCESSABLE_ENTITY } from 'http-status';

import { base64decode } from '../helpers/helpers';
import { responseErrorWithObject } from '../helpers/responses';

const options = {
  allowUnknown: true,
  language: {}
};

export const ethereumAddressValidator = Joi.string().regex(/^0x[\da-fA-F]{40,40}$/);

/**
 * Common template method for joi middleware
 *
 * @param scheme
 * @param data
 * @param res
 * @param next
 */
/* istanbul ignore next */
export function commonFlowRequestMiddleware(scheme: Joi.Schema, req: Request, res: Response, next: NextFunction) {
  const lang = req.acceptsLanguages() ? req.acceptsLanguages() : 'ru';
  let data: any = {};

  if (lang != 'en') {
    options.language = require('../resources/locales/' + lang + '/validation.json');
  }

  if (req.method.toLocaleLowerCase() === 'get') {
    data = req.query;
  } else {
    data = req.body;
  }

  const result = Joi.validate(data || {}, scheme, options);

  if (result.error) {
    return responseErrorWithObject(res, {
      'error': result.error,
      'message': result.value,
    }, UNPROCESSABLE_ENTITY);
  } else {
    return next();
  }
}

/**
 * Joi schema for verification validation.
 */
/* istanbul ignore next */
export const verificationValidateSchema = Joi.object().keys({
  verificationId: Joi.string().required(),
  code: Joi.string().required()
}).required();

/**
 * Default verification validator middleware.
 *
 * @param req
 * @param res
 * @param next
 */
/* istanbul ignore next */
export function verificationRequired(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object().keys({
    verification: verificationValidateSchema
  });

  commonFlowRequestMiddleware(schema, req, res, next);
}
