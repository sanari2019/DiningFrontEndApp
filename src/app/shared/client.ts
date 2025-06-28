import axios, { AxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    body?: any;
}

export default async function client(endpoint: string, { body, ...customConfig }: CustomAxiosRequestConfig = {}) {
    const apiKey = "pk_10018e38023e48ac3b29bb286263e659fa8318f2"; // Assuming apiKey is a global variable
    const apiEnvironment = window // Assuming apiEnvironment is a global variable
    const secretKey = 'sk_10018e38023e48ac395dbb49786bf22f8c9969f1';

    //   const {
    //     REACT_APP_TEST_BASE_URL,
    //     REACT_APP_QA_BASE_URL,
    //     REACT_APP_SANDBOX_BASE_URL,
    //     REACT_APP_BASE_URL
    //   } = process.env;

    const headers: Record<string, string> = {
        'Content-type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${secretKey}` || ''
    };

    const params: AxiosRequestConfig = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers
        }
    };

    //   switch (apiEnvironment) {
    //     case 'staging':
    //       params.baseURL = REACT_APP_TEST_BASE_URL;
    //       break;
    //     case 'qa':
    //       params.baseURL = REACT_APP_QA_BASE_URL;
    //       break;
    //     case 'sandbox':
    //       params.baseURL = REACT_APP_SANDBOX_BASE_URL;
    //       break;
    //     default:
    //       params.baseURL = REACT_APP_BASE_URL;
    //   }

    if (body) params.data = JSON.stringify(body);

    const { data } = await axios("/transaction/initiate", params);
    console.log(data);
    return data;
}
