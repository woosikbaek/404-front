// utils/holidayApi.js
const SERVICE_KEY = import.meta.env.VITE_HOLIDAY_API_KEY; 

export const HOLIDAYS = async (year) => {
  try {
    // 공공데이터포털 API 주소 (JSON 형식 요청)
    const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?serviceKey=${SERVICE_KEY}&solYear=${year}&_type=json&numOfRows=100`;

    const response = await fetch(url);
    const data = await response.json();

    const items = data.response.body.items.item;
    
    // 데이터가 단건일 경우 객체로 오고, 다건일 경우 배열로 오기 때문에 처리 필요
    const holidayList = Array.isArray(items) ? items : items ? [items] : [];

    // 우리 프로젝트 형식에 맞게 변환 ({ date: '2026-01-01', label: '신정' })
    return holidayList.map(item => {
      const locdate = String(item.locdate); // 예: 20260101
      if (item.dateName === '1월1일') {
        item.dateName = '신정';
      }
      return {
        date: `${locdate.substring(0, 4)}-${locdate.substring(4, 6)}-${locdate.substring(6, 8)}`,
        label: item.dateName
      };
    });
  } catch (error) {
    console.error("공휴일 정보를 가져오는데 실패했습니다.", error);
    return [];
  }
};