import React, { useState } from 'react'
import useContact from "./hooks/useContact";
import './Contact.css'

const Contact = () => {
  const { sendScoutMessage } = useContact();
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailUsername, setEmailUsername] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [message, setMessage] = useState('');

  const submit = async () => {
    // 빈값 체크
    if (!company) {
      alert("회사명을 입력해 주세요.");
      return;
    }
    if (!name) {
      alert("성함을 입력해 주세요.");
      return;
    }
    if (!phone) {
      alert("연락처를 입력해 주세요.");
      return;
    }
    if (!emailUsername) {
      alert("이메일을 입력해 주세요.");
      return;
    }
    
    const fullEmail = `${emailUsername}@${emailDomain}`;
    const res = await sendScoutMessage({
      company,
      name,
      phone,
      email: fullEmail,
      message
    });

    if (res.data.msg) {
      alert('스카웃 제의에 성공했습니다. 빠른시일 내에 답변 드리겠습니다.');
      setCompany('');
      setName('');
      setPhone('');
      setEmailUsername('');
      setEmailDomain('naver.com');
      setMessage('');
    } 
  }

  return (
    <main className="page-container">
      <section className="section contact-section">
        <div className="container">
          <h2 className="section-title">How to contact?</h2>
          <div className="contact-content">
            <div className="contact-info">
              <p>[채용 문의]</p>
              <p><strong>Email:</strong> dch0202@naver.com</p>
              <p><strong>Phone:</strong> 010-2213-5825</p>
              <p>Form을 통해 입력된 내용은 n8n 워크플로우로 텔레그램을 통해 전달됩니다.</p>
            </div>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="company">회사명</label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  placeholder="회사명 입력"
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">성함</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  placeholder="성함 입력"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">연락처</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  placeholder="연락처 입력"
                  onChange={(e) => {
                    let inputTel = e.target.value;

                    // 백스페이스 처리: 기존 값보다 짧으면 그대로 반영
                    if (inputTel.length < phone.length) {
                      setPhone(inputTel);
                      return;
                    }

                    // 숫자만 추출해서 최대 11자리까지만 허용
                    inputTel = inputTel.replace(/[^0-9]/g, '').slice(0, 11);

                    // 형식: 010-1234-5678
                    if (inputTel.length >= 3) {
                      inputTel = `${inputTel.slice(0, 3)}-${inputTel.slice(3)}`;
                    }
                    if (inputTel.length >= 8) {
                      inputTel = `${inputTel.slice(0, 8)}-${inputTel.slice(8)}`;
                    }

                    setPhone(inputTel);
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">이메일</label>
                <div className="email-input-container">
                  <input
                    type="text"
                    id="emailUsername"
                    value={emailUsername}
                    placeholder="이메일 입력"
                    onChange={(e) => setEmailUsername(e.target.value)}
                    style={{ width: '50%' }}
                  />
                  <span className="email-at">@</span>
                  <select
                    id="emailDomain"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    style={{ width: '45%' }}
                  >
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="hanmail.net">hanmail.net</option>
                    <option value="nate.com">nate.com</option>
                    <option value="kakao.com">kakao.com</option>
                    <option value="hotmail.com">hotmail.com</option>
                    <option value="outlook.com">outlook.com</option>
                    <option value="icloud.com">icloud.com</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">메시지</label>
                <textarea
                  id="message"
                  rows="5"
                  value={message}
                  placeholder="하고 싶은 말씀이 있으시다면 1000자 내로 편하게 적어주세요."
                  maxLength={1000}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="submit-btn" onClick={submit}>전송</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Contact
