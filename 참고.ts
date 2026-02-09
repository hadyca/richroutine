// export const loader = async () => {
// // 1. 현재 토큰이 있고 유효기간이 남았다면 재사용 (선택사항)
// if (cachedToken && tokenExpiredAt && new Date() < tokenExpiredAt) {
//   return cachedToken;
// }
// // 2. 새 토큰 발급 요청
// const response = await axios.post(
//   "https://openapi.koreainvestment.com:9443/oauth2/tokenP",
//   {
//     grant_type: "client_credentials",
//     appkey: process.env.KIS_APP_KEY,
//     appsecret: process.env.KIS_APP_SECRET,
//   },
// );
// console.log("response", response);
// // 3. 응답에서 토큰과 만료시간 저장
// cachedToken = response.data.access_token;
// // 만료 시간(access_token_token_expired)은 문자열로 오므로 Date 객체로 변환 관리
// tokenExpiredAt = new Date(response.data.access_token_token_expired);
// return cachedToken;
// };
// const URL_BASE = "https://openapi.koreainvestment.com:9443";
// const PATH = "/uapi/overseas-price/v1/quotations/price-detail";

// const URL_BASE = "https://openapi.koreainvestment.com:9443";
// const PATH = "/uapi/overseas-stock/v1/quotations/inquire-index-price";

// let cachedToken: string | null = null;
// let tokenExpiredAt: Date | null = null;
// export const loader = async () => {
//   // 1. 현재 토큰이 있고 유효기간이 남았다면 재사용 (선택사항)
//   if (cachedToken && tokenExpiredAt && new Date() < tokenExpiredAt) {
//     return cachedToken;
//   }
//   // 2. 새 토큰 발급 요청
//   const response = await axios.post(
//     "https://openapi.koreainvestment.com:9443/oauth2/tokenP",
//     {
//       grant_type: "client_credentials",
//       appkey: process.env.KIS_APP_KEY,
//       appsecret: process.env.KIS_APP_SECRET,
//     },
//   );
//   // 3. 응답에서 토큰과 만료시간 저장
//   cachedToken = response.data.access_token;
//   // 만료 시간(access_token_token_expired)은 문자열로 오므로 Date 객체로 변환 관리
//   tokenExpiredAt = new Date(response.data.access_token_token_expired);

//   try {
//     const response = await axios.get(`${URL_BASE}${PATH}`, {
//       headers: {
//         "content-type": "application/json",
//         authorization: `Bearer ${cachedToken}`,
//         appkey: process.env.KIS_APP_KEY,
//         appsecret: process.env.KIS_APP_SECRET,
//         tr_id: "HHDFS76410000", // 해외주식 현재가 상세 TR ID
//       },
//       params: {
//         AUTH: "", // 공란 유지
//         EXCD: "NYS", // 거래소 코드 (VIX는 보통 NYS)
//         SYMB: "VIX", // 종목 심볼
//       },
//     });

//     const data = response.data;
//     console.log(data);
//     if (data.rt_cd === "0") {
//       const output = data.output;
//       console.log("--- VIX 지수 현재가 정보 ---");
//       console.log(`지수명: ${output.fill_name}`);
//       console.log(`현재가: ${output.last}`);
//       console.log(`대비: ${output.diff}`);
//       console.log(`등락률: ${output.rate}%`);
//     } else {
//       console.error(`API 에러: ${data.msg1}`);
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (error.response) {
//         console.error(
//           `HTTP 에러: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
//         );
//       } else {
//         console.error(`요청 에러: ${error.message}`);
//       }
//     } else {
//       console.error(`알 수 없는 에러: ${error}`);
//     }
//   }
// };
