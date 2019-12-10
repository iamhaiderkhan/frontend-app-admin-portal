import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import qs from 'query-string';

import apiClient from '../apiClient';
import searchEnrollmentsList from './enrollmentsList';
import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
} from '../../data/constants/table';


const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(apiClient);
apiClient.isAccessTokenExpired = jest.fn();
apiClient.isAccessTokenExpired.mockReturnValue(false);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('searchEnrollmentsList', () => {
    const enterpriseId ='37fe6e61-414d-46e6-a383-bb7e70c76c0a'
    it('dispatches success action after searching enrollments', () => {
      
      const responseData = {
        count: 1,
        num_pages: 1,
        current_page: 1,
        next: null,
        num_pages: 1,
        results: [
          {
            enterprise_id: "37fe6e61-414d-46e6-a383-bb7e70c76c0a",
            user_email: "test3@edx.org",
            progress_status: "In Progress" 
          }
        ],
        start:0
      };
      const expectedActions = [
        {
          type: PAGINATION_REQUEST,
          payload: {
            tableId: 'enrollments',
            options: expect.objectContaining({ search: 'test3@edx.org' }),
          },
        },
        {
          type: PAGINATION_SUCCESS,
          payload: {
            tableId: 'enrollments',
            data: responseData,
          },
        },
      ];
      const store = mockStore();
      const defaultOptions = {
        page: 1,
        page_size: 50,
        search: 'test3@edx.org',
      };
     
      axiosMock.onGet(`http://localhost:8000/enterprise/api/v0/enterprise/${enterpriseId}/enrollments/?${qs.stringify(defaultOptions)}`)
        .replyOnce(200, JSON.stringify(responseData));

      return store.dispatch(searchEnrollmentsList({ search: 'test3@edx.org' })).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches failure action after fetching enrollments', () => {
      const store = mockStore();
      const options = {
        page: 2,
        page_size: 10,
        search: 'text3edx.org',
      };
      const expectedActions = [
        {
          type: PAGINATION_REQUEST,
          payload: {
            tableId: 'enrollments',
            options,
          },
        },
        {
          type: PAGINATION_FAILURE,
          payload: {
            tableId: 'enrollments',
            error: Error('Network Error'),
          },
        },
      ];

      axiosMock.onGet(`http://localhost:8000/enterprise/api/v0/enterprise/${enterpriseId}/enrollments/?${qs.stringify(options)}`)
        .networkError();

      return store.dispatch(searchEnrollmentsList(options)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});

