import EnterpriseDataApiService from '../services/EnterpriseDataApiService';
import { getPageOptionsFromUrl } from '../../utils';
import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
} from '../constants/table';
import NewRelicService from '../services/NewRelicService';

const tableId = 'enrollments';

const searchEnrollmentsListRequest = options => ({
  type: PAGINATION_REQUEST,
  payload: {
    tableId,
    options,
  },
});
const searchEnrollmentsListSuccess = data => ({
  type: PAGINATION_SUCCESS,
  payload: {
    tableId,
    data,
  },
});
const searchEnrollmentsListFailure = error => ({
  type: PAGINATION_FAILURE,
  payload: {
    tableId,
    error,
  },
});

// This is doing nearly the same thing the table actions do however this
// is necessary so we can pass in the `search` parameter. We leverage the same
// events as the table actions, so the same `table` reducers will be called.
const searchEnrollmentsList = searchOptions => (
  (dispatch) => {
    const options = {
      ...getPageOptionsFromUrl(),
      ...searchOptions,
    };
    dispatch(searchEnrollmentsListRequest(options));
    return EnterpriseDataApiService.fetchCourseEnrollments(options)
      .then((response) => {
        dispatch(searchEnrollmentsListSuccess(response.data));
      })
      .catch((error) => {
        NewRelicService.logAPIErrorResponse(error);
        dispatch(searchEnrollmentsListFailure(error));
      });
  }
);

export default searchEnrollmentsList;
