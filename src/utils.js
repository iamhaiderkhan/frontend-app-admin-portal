import moment from 'moment';
import qs from 'query-string';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import isNumeric from 'validator/lib/isNumeric';

import history from './data/history';

const formatTimestamp = ({ timestamp, format = 'MMMM D, YYYY' }) => {
  if (timestamp) {
    return moment(timestamp).format(format);
  }
  return null;
};

const formatPassedTimestamp = (timestamp) => {
  if (timestamp) {
    return formatTimestamp({ timestamp });
  }
  return 'Has not passed';
};

const formatPercentage = ({ decimal, numDecimals = 1 }) => (
  decimal ? `${parseFloat((decimal * 100).toFixed(numDecimals))}%` : '0%'
);

const updateUrl = (queryOptions) => {
  if (!queryOptions) {
    return;
  }
  const currentQuery = qs.parse(window.location.search);

  // Apply any updates passed in over the current query. This requires consumers to explicitly
  // pass in parameters they want to remove, such as resetting the page when sorting, but ensures
  // that we bring forward all other params such as feature flags
  const newQuery = {
    ...currentQuery,
    ...queryOptions,
  };

  // Because we show page 1 by default, theres no reason to set the url to page=1
  if (newQuery.page === 1) {
    newQuery.page = undefined;
  }

  const newQueryString = `?${qs.stringify(newQuery)}`;
  if (newQueryString !== window.location.search) {
    history.push(newQueryString);
  }
};

// Returns an object containing pagination options (page_size, page, ordering) based on the current
// window location's query string, or, if not set in the window location uses defaults values.
const getPageOptionsFromUrl = () => {
  // TODO: this will not support multiple tables paging on a single page. Will need to prefix url
  // params with table id (or some other mechanism) if this becomes a feature requirement
  const defaults = {
    pageSize: 50,
    page: 1,
    ordering: undefined,
    search: undefined
  };
  const query = qs.parse(window.location.search);
  return {
    page_size: parseInt(query.page_size, 10) || defaults.pageSize,
    page: parseInt(query.page, 10) || defaults.page,
    ordering: query.ordering || defaults.ordering,
    search: query.search  || defaults.search
  };
};

const removeTrailingSlash = path => path.replace(/\/$/, '');

const isTriggerKey = ({ triggerKeys, action, key }) => (
  triggerKeys[action].indexOf(key) > -1
);

// Validation functions
const isRequired = (value = '') => (isEmpty(value) ? 'This field is required.' : undefined);
const isValidEmail = (value = '') => (!isEmail(value) ? 'Must be a valid email address.' : undefined);
const isValidNumber = (value = '') => (!isEmpty(value) && !isNumeric(value, { no_symbols: true }) ? 'Must be a valid number.' : undefined);
const maxLength = max => value => (value && value.length > max ? 'Must be 512 characters or less' : undefined);
const maxLength512 = maxLength(512);


/** camelCase <--> snake_case functions
 * Because responses from django come as snake_cased JSON, its best
 * to transform them into camelCase for use within components. Try
 * to avoid passing snake_cased objects or arrays as props, and transform
 * them ahead of time.
 */
const modifyObjectKeys = (object, modify) => {
  // If the passed in object is not an object, return it.
  if (
    object === undefined ||
    object === null ||
    (typeof object !== 'object' && !Array.isArray(object))
  ) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(value => modifyObjectKeys(value, modify));
  }

  // Otherwise, process all its keys.
  const result = {};
  Object.entries(object).forEach(([key, value]) => {
    result[modify(key)] = modifyObjectKeys(value, modify);
  });
  return result;
};

const camelCaseObject = object => (
  modifyObjectKeys(object, camelCase)
);

const snakeCaseObject = object => (
  modifyObjectKeys(object, snakeCase)
);

const snakeCaseFormData = (formData) => {
  const transformedData = new FormData();
  [...formData.entries()]
    .forEach(entry => (
      transformedData.append(snakeCase(entry[0]), entry[1])
    ));
  return transformedData;
};

export {
  formatPercentage,
  formatPassedTimestamp,
  formatTimestamp,
  removeTrailingSlash,
  updateUrl,
  getPageOptionsFromUrl,
  isTriggerKey,
  isRequired,
  isValidEmail,
  isValidNumber,
  modifyObjectKeys,
  camelCaseObject,
  snakeCaseObject,
  snakeCaseFormData,
  maxLength512,
};
