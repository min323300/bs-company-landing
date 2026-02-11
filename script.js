// Google Apps Script Web App URL (여기에 실제 배포 URL을 입력하세요)
const API_URL = 'https://script.google.com/macros/s/AKfycby79oWGN25DG1__nH-j-4QCBbahKId03lsJv5qZ1p6nAEd9clHGAtdJ4eD5tQmB6j9-/exec';

// 페이지 로드 시 데이터 가져오기
document.addEventListener('DOMContentLoaded', function() {
    loadCompanyInfo();
    loadProducts();
    loadFAQ();
    initContactForm();
});

// 회사 정보 로드
async function loadCompanyInfo() {
    try {
        const response = await fetch(`${API_URL}?action=getCompanyInfo`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const company = data.data[0];
            
            // 회사 로고
            if (company.companyName) {
                document.getElementById('companyLogo').textContent = company.companyName;
            }
            
            // 인트로 섹션
            const introContent = document.getElementById('introContent');
            let introHTML = `<h1>${company.introTitle || '환영합니다'}</h1>`;
            introHTML += `<p>${company.introContent || ''}</p>`;
            
            if (company.introImage) {
                introHTML += `<img src="${company.introImage}" alt="회사 소개">`;
            }
            
            introContent.innerHTML = introHTML;
            
            // 지도 섹션
            const mapContent = document.getElementById('mapContent');
            let mapHTML = '';
            
            if (company.mapEmbed) {
                mapHTML += company.mapEmbed;
            }
            
            if (company.companyAddress) {
                mapHTML += `<p><strong>주소:</strong> ${company.companyAddress}</p>`;
            }
            
            if (company.companyPhone) {
                mapHTML += `<p><strong>전화:</strong> ${company.companyPhone}</p>`;
            }
            
            if (company.companyEmail) {
                mapHTML += `<p><strong>이메일:</strong> ${company.companyEmail}</p>`;
            }
            
            mapContent.innerHTML = mapHTML;
            
            // 푸터
            if (company.companyName) {
                document.getElementById('footerText').textContent = 
                    `© 2024 ${company.companyName}. All rights reserved.`;
            }
        }
    } catch (error) {
        console.error('회사 정보 로드 실패:', error);
        document.getElementById('introContent').innerHTML = 
            '<h1>정보를 불러오는 중 오류가 발생했습니다</h1>';
    }
}

// 제품 정보 로드
async function loadProducts() {
    try {
        // 카테고리 가져오기
        const categoriesResponse = await fetch(`${API_URL}?action=getCategories`);
        const categoriesData = await categoriesResponse.json();
        
        // 제품 가져오기
        const productsResponse = await fetch(`${API_URL}?action=getProducts`);
        const productsData = await productsResponse.json();
        
        if (categoriesData.success && productsData.success) {
            const categories = categoriesData.data;
            const products = productsData.data;
            
            const productCategories = document.getElementById('productCategories');
            let html = '';
            
            // 카테고리별로 제품 그룹화
            categories.forEach(category => {
                const categoryProducts = products.filter(p => p.category === category.name);
                
                if (categoryProducts.length > 0) {
                    html += `
                        <div class="category-block">
                            <h3>${category.name}</h3>
                            <div class="products-grid">
                    `;
                    
                    categoryProducts.forEach(product => {
                        html += `
                            <div class="product-card">
                                <img src="${product.image}" alt="${product.name}">
                                <div class="product-info">
                                    <h4>${product.name}</h4>
                                    ${product.price ? `<div class="price">${product.price}</div>` : ''}
                                    <p>${product.description}</p>
                                    <a href="${product.link}" target="_blank" class="smartstore-btn">
                                        스마트스토어에서 구매하기
                                    </a>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                }
            });
            
            productCategories.innerHTML = html || '<p style="text-align: center;">등록된 제품이 없습니다.</p>';
        }
    } catch (error) {
        console.error('제품 정보 로드 실패:', error);
        document.getElementById('productCategories').innerHTML = 
            '<p style="text-align: center;">제품 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// FAQ 로드
async function loadFAQ() {
    try {
        const response = await fetch(`${API_URL}?action=getFAQ`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const faqList = document.getElementById('faqList');
            let html = '';
            
            data.data.forEach(faq => {
                html += `
                    <div class="faq-item">
                        <div class="faq-question">
                            ${faq.question}
                        </div>
                        <div class="faq-answer">
                            ${faq.answer}
                        </div>
                    </div>
                `;
            });
            
            faqList.innerHTML = html;
            
            // FAQ 아코디언 기능
            document.querySelectorAll('.faq-question').forEach(question => {
                question.addEventListener('click', function() {
                    const answer = this.nextElementSibling;
                    const wasActive = this.classList.contains('active');
                    
                    // 모든 FAQ 닫기
                    document.querySelectorAll('.faq-question').forEach(q => {
                        q.classList.remove('active');
                        q.nextElementSibling.classList.remove('active');
                    });
                    
                    // 클릭한 항목이 닫혀있었다면 열기
                    if (!wasActive) {
                        this.classList.add('active');
                        answer.classList.add('active');
                    }
                });
            });
        } else {
            document.getElementById('faqList').innerHTML = 
                '<p style="text-align: center;">등록된 FAQ가 없습니다.</p>';
        }
    } catch (error) {
        console.error('FAQ 로드 실패:', error);
        document.getElementById('faqList').innerHTML = 
            '<p style="text-align: center;">FAQ를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 문의 폼 초기화
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
            date: new Date().toISOString()
        };
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addInquiry',
                    data: formData
                })
            });
            
            // no-cors 모드에서는 응답을 확인할 수 없으므로 성공으로 간주
            formMessage.className = 'success';
            formMessage.textContent = '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.';
            form.reset();
            
            // 3초 후 메시지 제거
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = '';
            }, 3000);
            
        } catch (error) {
            console.error('문의 전송 실패:', error);
            formMessage.className = 'error';
            formMessage.textContent = '문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.';
            
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = '';
            }, 3000);
        }
    });
}

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
