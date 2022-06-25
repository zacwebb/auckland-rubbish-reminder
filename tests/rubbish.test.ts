import axios, { AxiosResponse } from 'axios';
import { fetchData } from '../src/rubbish';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
    jest.clearAllMocks();
});

describe('fetching data', () => {
    test('expected return values', async () => {
        const expectedResponse = {
            status: 'success',
            data: {
                date: '25/06/2022',
                rubbish: true,
                recycling: false,
                address: '192 Parnell Road, Parnell',
                id: '12342561754',
            },
        };

        const mockedAddressResponse: AxiosResponse = {
            data: [
                {
                    ACRateAccountKey: '12342561754',
                    Address: '192 Parnell Road, Parnell',
                    Suggestion: '192 Parnell Road, Parnell',
                },
            ],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
        };

        const mockedScrapeResponse: AxiosResponse = {
            data: '<html><h4 class="h6 m-t-1" style="margin-left: 10px;"><strong>Your next collection dates:</strong></h4><div class="links"><span class="m-r-1">Saturday 25 June</span><span class="icon-rubbish"><span class="sr-only">Rubbish</span></span></div><div class="links"><span class="m-r-1">Friday 1 July</span><span class="icon-rubbish"><span class="sr-only">Rubbish</span></span> <span class="icon-recycle"><span class="sr-only">Recycle</span></span></div></html>',
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
        };

        mockedAxios.post.mockResolvedValueOnce(mockedAddressResponse);
        mockedAxios.get.mockResolvedValueOnce(mockedScrapeResponse);
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.get).not.toHaveBeenCalled();

        const response = await fetchData('192 Parnell Road, Parnell');

        expect(axios.post).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalled();
        expect(response).toMatchObject(expectedResponse);
    });

    test('invalid query address', async () => {
        const expectedResponse = {
            status: 'fail',
            data: {
                address: 'Invalid address search. Try adjusting your query.',
            },
        };

        const mockedAddressResponse: AxiosResponse = {
            data: [],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
        };

        mockedAxios.post.mockResolvedValueOnce(mockedAddressResponse);
        expect(axios.post).not.toHaveBeenCalled();

        const response = await fetchData('t');

        expect(axios.post).toHaveBeenCalled();
        expect(response).toMatchObject(expectedResponse);
    });
});
