// Google Apps Script Web App URL (script.js와 동일한 URL)
const API_URL = 'https://script.google.com/macros/s/AKfycby79oWGN25DG1__nH-j-4QCBbahKId03lsJv5qZ1p6nAEd9clHGAtdJ4eD5tQmB6j9-/exec';

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadCompanyData();
    loadCategories();
    loadProducts();
    loadFAQs();
    loadInquiries();
    initForms();
});

// 탭 전환
function showTab(tabName) {
    // 모든 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ========== 회사 정보 관리 ==========
async function loadCompanyData() {
    try {
        const response = await fetch(`${API_URL}?action=getCompanyInfo`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const company = data.data[0];
            document.getElementById('companyName').value = company.companyName || '';
            document.getElementById('introTitle').value = company.introTitle || '';
            document.getElementById('introContent').value = company.introContent || '';
            document.getElementById('introImage').value = company.introImage || '';
            document.getElementById('companyAddress').value = company.companyAddress || '';
            document.getElementById('mapEmbed').value = company.mapEmbed || '';
            document.getElementById('companyPhone').value = company.companyPhone || '';
            document.getElementById('companyEmail').value = company.companyEmail || '';
        }
    } catch (error) {
        console.error('회사 정보 로드 실패:', error);
    }
}

// ========== 카테고리 관리 ==========
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}?action=getCategories`);
        const data = await response.json();
        
        if (data.success) {
            // 카테고리 목록 표시
            displayCategoriesList(data.data);
            
            // 제품 폼의 카테고리 선택 업데이트
            updateCategorySelect(data.data);
        }
    } catch (error) {
        console.error('카테고리 로드 실패:', error);
    }
}

function displayCategoriesList(categories) {
    const list = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        list.innerHTML = '<p>등록된 카테고리가 없습니다.</p>';
        return;
    }
    
    let html = '';
    categories.forEach(category => {
        html += `
            <div class="list-item">
                <div class="list-item-content">
                    <h4>${category.name}</h4>
                    <p>순서: ${category.order}</p>
                </div>
                <div class="list-item-actions">
                    <button class="delete-btn" onclick="deleteCategory('${category.name}')">삭제</button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function updateCategorySelect(categories) {
    const select = document.getElementById('productCategory');
    select.innerHTML = '<option value="">카테고리 선택</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

async function deleteCategory(name) {
    if (!confirm(`'${name}' 카테고리를 삭제하시겠습니까?`)) return;
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'deleteCategory',
                name: name
            })
        });
        
        showMessage('카테고리가 삭제되었습니다.', 'success');
        loadCategories();
    } catch (error) {
        console.error('카테고리 삭제 실패:', error);
        showMessage('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// ========== 제품 관리 ==========
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}?action=getProducts`);
        const data = await response.json();
        
        if (data.success) {
            displayProductsList(data.data);
        }
    } catch (error) {
        console.error('제품 로드 실패:', error);
    }
}

function displayProductsList(products) {
    const list = document.getElementById('productsList');
    
    if (products.length === 0) {
        list.innerHTML = '<p>등록된 제품이 없습니다.</p>';
        return;
    }
    
    let html = '';
    products.forEach((product, index) => {
        html += `
            <div class="product-admin-card">
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p><strong>카테고리:</strong> ${product.category}</p>
                <p>${product.description}</p>
                <p class="price">${product.price || '가격 미정'}</p>
                <p><strong>링크:</strong> <a href="${product.link}" target="_blank">스마트스토어</a></p>
                <div class="list-item-actions">
                    <button class="delete-btn" onclick="deleteProduct(${index})">삭제</button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

async function deleteProduct(index) {
    if (!confirm('이 제품을 삭제하시겠습니까?')) return;
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'deleteProduct',
                index: index
            })
        });
        
        showMessage('제품이 삭제되었습니다.', 'success');
        loadProducts();
    } catch (error) {
        console.error('제품 삭제 실패:', error);
        showMessage('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// ========== FAQ 관리 ==========
async function loadFAQs() {
    try {
        const response = await fetch(`${API_URL}?action=getFAQ`);
        const data = await response.json();
        
        if (data.success) {
            displayFAQList(data.data);
        }
    } catch (error) {
        console.error('FAQ 로드 실패:', error);
    }
}

function displayFAQList(faqs) {
    const list = document.getElementById('faqList');
    
    if (faqs.length === 0) {
        list.innerHTML = '<p>등록된 FAQ가 없습니다.</p>';
        return;
    }
    
    let html = '';
    faqs.forEach((faq, index) => {
        html += `
            <div class="list-item">
                <div class="list-item-content">
                    <h4>${faq.question}</h4>
                    <p>${faq.answer}</p>
                    <p style="font-size: 0.8rem; color: #888;">순서: ${faq.order}</p>
                </div>
                <div class="list-item-actions">
                    <button class="delete-btn" onclick="deleteFAQ(${index})">삭제</button>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

async function deleteFAQ(index) {
    if (!confirm('이 FAQ를 삭제하시겠습니까?')) return;
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'deleteFAQ',
                index: index
            })
        });
        
        showMessage('FAQ가 삭제되었습니다.', 'success');
        loadFAQs();
    } catch (error) {
        console.error('FAQ 삭제 실패:', error);
        showMessage('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// ========== 문의 내역 ==========
async function loadInquiries() {
    try {
        const response = await fetch(`${API_URL}?action=getInquiries`);
        const data = await response.json();
        
        if (data.success) {
            displayInquiriesList(data.data);
        }
    } catch (error) {
        console.error('문의 내역 로드 실패:', error);
    }
}

function displayInquiriesList(inquiries) {
    const list = document.getElementById('inquiriesList');
    
    if (inquiries.length === 0) {
        list.innerHTML = '<p>문의 내역이 없습니다.</p>';
        return;
    }
    
    let html = '';
    inquiries.forEach(inquiry => {
        html += `
            <div class="inquiry-card">
                <div class="inquiry-header">
                    <div class="inquiry-info">
                        <h4>${inquiry.name}</h4>
                        <p>이메일: ${inquiry.email} | 전화: ${inquiry.phone}</p>
                    </div>
                    <div class="inquiry-date">${new Date(inquiry.date).toLocaleString('ko-KR')}</div>
                </div>
                <div class="inquiry-message">${inquiry.message}</div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

// ========== 폼 초기화 ==========
function initForms() {
    // 회사 정보 폼
    document.getElementById('companyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const data = {
            companyName: document.getElementById('companyName').value,
            introTitle: document.getElementById('introTitle').value,
            introContent: document.getElementById('introContent').value,
            introImage: document.getElementById('introImage').value,
            companyAddress: document.getElementById('companyAddress').value,
            mapEmbed: document.getElementById('mapEmbed').value,
            companyPhone: document.getElementById('companyPhone').value,
            companyEmail: document.getElementById('companyEmail').value
        };
        
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    action: 'updateCompanyInfo',
                    data: data
                })
            });
            
            showMessage('회사 정보가 저장되었습니다.', 'success');
        } catch (error) {
            console.error('저장 실패:', error);
            showMessage('저장 중 오류가 발생했습니다.', 'error');
        }
    });
    
    // 카테고리 폼
    document.getElementById('categoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('categoryName').value,
            order: parseInt(document.getElementById('categoryOrder').value)
        };
        
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    action: 'addCategory',
                    data: data
                })
            });
            
            showMessage('카테고리가 추가되었습니다.', 'success');
            this.reset();
            loadCategories();
        } catch (error) {
            console.error('추가 실패:', error);
            showMessage('추가 중 오류가 발생했습니다.', 'error');
        }
    });
    
    // 제품 폼
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const data = {
            category: document.getElementById('productCategory').value,
            name: document.getElementById('productName').value,
            description: document.getElementById('productDesc').value,
            image: document.getElementById('productImage').value,
            link: document.getElementById('productLink').value,
            price: document.getElementById('productPrice').value
        };
        
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    action: 'addProduct',
                    data: data
                })
            });
            
            showMessage('제품이 추가되었습니다.', 'success');
            this.reset();
            loadProducts();
        } catch (error) {
            console.error('추가 실패:', error);
            showMessage('추가 중 오류가 발생했습니다.', 'error');
        }
    });
    
    // FAQ 폼
    document.getElementById('faqForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const data = {
            question: document.getElementById('faqQuestion').value,
            answer: document.getElementById('faqAnswer').value,
            order: parseInt(document.getElementById('faqOrder').value)
        };
        
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    action: 'addFAQ',
                    data: data
                })
            });
            
            showMessage('FAQ가 추가되었습니다.', 'success');
            this.reset();
            loadFAQs();
        } catch (error) {
            console.error('추가 실패:', error);
            showMessage('추가 중 오류가 발생했습니다.', 'error');
        }
    });
}

// 메시지 표시 함수
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.querySelector('.admin-content').insertBefore(
        message, 
        document.querySelector('.tab-menu')
    );
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}
