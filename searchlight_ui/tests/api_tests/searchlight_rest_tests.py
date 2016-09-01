# Copyright 2015, Hewlett-Packard Development Company, L.P.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import mock
from openstack_dashboard.test import helpers as test

from searchlight_ui.api.rest import searchlight


# A fake requests response from searchlight's search api
mock_response = {'total': 0, 'hits': {'hits': []}}
mock_es_search = mock.Mock()
mock_es_search.json.return_value = mock_response


class SearchlightRestTestCase(test.TestCase):
    @mock.patch.object(searchlight, 'searchlight_post')
    def test_run_default_search(self, sl_post):
        sl_post.return_value = mock_es_search
        request = self.mock_rest_request()

        response = searchlight.Search().post(request)
        self.assertStatusCode(response, 200)
        self.assertEqual(mock_response, response.json)

        expected_search = {
            'limit': 20,
            'query': {'match_all': {}}
        }
        sl_post.assert_called_with('/search', request, expected_search)

    @mock.patch.object(searchlight, 'searchlight_post')
    def test_run_search(self, sl_post):
        sl_post.return_value = mock_es_search
        request = self.mock_rest_request(body='''{"limit": 100,
            "query": {"term": {"name": "foo"}}, "offset": 10,
            "limit": 20, "sort": {"name": "desc"}}''')

        response = searchlight.Search().post(request)
        self.assertStatusCode(response, 200)
        self.assertEqual(mock_response, response.json)

        expected_search = {
            'limit': 100,
            'offset': 10,
            'limit': 20,
            'query': {'term': {'name': 'foo'}},
            'sort': {'name': 'desc'}
        }
        sl_post.assert_called_with('/search', request, expected_search)

    @mock.patch.object(searchlight, 'searchlight_get')
    def test_enabled(self, sl_get):
        mock_get_resp = mock.Mock()
        mock_get_resp.json.return_value = {
            "plugins": [
                {"name": "OS::Glance::Image",
                 "index": "glance",
                 "type": "OS::Glance::Image"}
            ]
        }
        sl_get.return_value = mock_get_resp
        request = self.mock_rest_request()

        response = searchlight.Plugins().get(request)
        self.assertStatusCode(response, 200)

        expected = {"plugins": [{"name": "OS::Glance::Image",
                                 "index": "glance",
                                 "type": "OS::Glance::Image"}]}
        self.assertEqual(expected, response.json)
