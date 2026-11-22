import { ApiError } from '../utils/ApiError.js';
export const validate = (schema, target = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[target]);
  if (!result.success) return next(new ApiError(400, 'Please check the submitted details', result.error.flatten()));
  req[target] = result.data; next();
};
