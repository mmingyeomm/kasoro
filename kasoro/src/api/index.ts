// axios
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		// Accept: process.env.NEXT_PUBLIC_API_URL,
	},
	withCredentials: true,
});

// request 보내기전 작업
instance.interceptors.request.use(
	(request: InternalAxiosRequestConfig) => {
		return request;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);
// response 받은 후 작업
instance.interceptors.response.use(
	// 2xx 범위인 경우
	async (response: AxiosResponse) => {
		const { config, data } = response;

		console.log(`${config.url} \n`, data); // 데이터 콘솔로 찍기
		// const error = response?.data?.error;

		return response;
	},

	// 2xx 범위 외의 상태코드
	async (error: AxiosError) => {
		const config = error.config as InternalAxiosRequestConfig;
		const response = error.response as AxiosResponse;

		// console.error(`${config.url} \n`, error); // 에러 콘솔로 찍기

		if (error.code === 'ERR_NETWORK') {
			alert('네트워크 에러. 잠시 후 시도해주세요');
		} else if (error.code === 'ERR_BAD_RESPONSE') {
			alert('서버가 응답하지 않습니다. 서비스 관리자에게 문의해주세요');
		} else if (error.code === 'ECONNABORTED') {
			alert('요청시간을 초과했습니다. 잠시 후 시도해주세요');
		} else if (error.code === 'ERR_BAD_REQUEST') {
			alert('올바르지 않은 요청입니다. 서비스 관리자에게 문의해주세요');
		} else {
			alert(error.code ?? '알 수 없는 에러가 발생했습니다. 서비스 관리자에게 문의해주세요');
		}

		return Promise.reject(error);
	}
);

export const api = {
	get: <T>(url: string, params?: any, config?: any) => instance.get<T>(url, { params, ...config }),
	post: <T>(url: string, data?: any, config?: any) => instance.post<T>(url, data, config),
	put: <T>(url: string, data?: any, config?: any) => instance.put<T>(url, data, config),
	patch: <T>(url: string, data?: any, config?: any) => instance.patch<T>(url, data, config),
	delete: <T>(url: string, params?: any, config?: any) => instance.delete<T>(url, { params, ...config }),
};
