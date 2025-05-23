import axios from "axios";

const useContact = () => {
  // 스키웃 텔레그램 메시지 전송
  const sendScoutMessage = async (payload) => {
    try {
        const res = await axios({
          url: `https://www.linkly.kr/n8n/webhook/Scout`,
          method: 'POST',
          data: payload
        });
  
        return res;
      } catch (error) {
        console.log('error', error?.message);
        alert('스카웃 제의에 실패했습니다. 연락처로 직접 연락주세요.');
        return false;
      }
  };
  
  return {
    sendScoutMessage,
  };
};

export default useContact;
