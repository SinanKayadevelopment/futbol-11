let currentTeam = null;
let currentFormation = null;
let selectedPosition = null;
let players = Array(11).fill(null);

// Takım bilgilerini kaydet
function submitTeam() {
    const teamName = document.getElementById('team-name').value;
    const teamLogo = document.getElementById('team-logo').files[0];

    if (!teamName || !teamLogo) {
        alert('Lütfen takım adı ve logo giriniz!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        currentTeam = {
            name: teamName,
            logo: e.target.result
        };

        // Takım bilgilerini hemen göster
        document.getElementById('display-team-logo').src = currentTeam.logo;
        document.getElementById('display-team-name').textContent = currentTeam.name;

        // Takım seçimini gizle, formasyon seçimini göster
        document.getElementById('team-section').classList.add('hidden');
        document.getElementById('formation-section').classList.remove('hidden');
    };
    reader.readAsDataURL(teamLogo);
}

// Formasyon seç ve saha görünümünü oluştur
function submitFormation() {
    currentFormation = document.getElementById('formation-select').value;
    
    // Formasyon seçimini gizle, sahayı göster
    document.getElementById('formation-section').classList.add('hidden');
    document.getElementById('field-section').classList.remove('hidden');
    
    // Formasyon bilgisini göster
    document.getElementById('display-formation').textContent = `Formasyon: ${currentFormation}`;
    
    createPositions();
}

// Saha üzerinde pozisyonları oluştur
function createPositions() {
    const field = document.getElementById('field');
    field.innerHTML = '';
    
    const positions = getFormationPositions(currentFormation);
    
    positions.forEach((pos, index) => {
        const position = document.createElement('div');
        position.className = 'player-position';
        position.style.left = pos.x + '%';
        position.style.top = pos.y + '%';
        position.onclick = () => openPlayerModal(index);
        
        if (players[index]) {
            position.innerHTML = `
                <img src="${players[index].photo}" 
                     alt="${players[index].name}"
                     crossorigin="anonymous"
                     style="width: 100%; height: 100%; object-fit: cover;">
                <span>${players[index].name}</span>
            `;
        } else {
            position.innerHTML = `<span>+</span>`;
        }
        
        field.appendChild(position);
    });
}

// Formasyon pozisyonlarını hesapla
function getFormationPositions(formation) {
    const positions = [];
    
    switch(formation) {
        case '442':
            // Kaleci
            positions.push({x: 50, y: 90});
            // Defans
            positions.push({x: 20, y: 70});
            positions.push({x: 40, y: 70});
            positions.push({x: 60, y: 70});
            positions.push({x: 80, y: 70});
            // Orta saha
            positions.push({x: 20, y: 40});
            positions.push({x: 40, y: 40});
            positions.push({x: 60, y: 40});
            positions.push({x: 80, y: 40});
            // Forvet
            positions.push({x: 35, y: 15});
            positions.push({x: 65, y: 15});
            break;

        case '433':
            // Kaleci
            positions.push({x: 50, y: 90});
            // Defans
            positions.push({x: 20, y: 70});
            positions.push({x: 40, y: 70});
            positions.push({x: 60, y: 70});
            positions.push({x: 80, y: 70});
            // Orta saha
            positions.push({x: 30, y: 40});
            positions.push({x: 50, y: 40});
            positions.push({x: 70, y: 40});
            // Forvet
            positions.push({x: 30, y: 15});
            positions.push({x: 50, y: 15});
            positions.push({x: 70, y: 15});
            break;

        case '352':
            // Kaleci
            positions.push({x: 50, y: 90});
            // Defans
            positions.push({x: 30, y: 70});
            positions.push({x: 50, y: 70});
            positions.push({x: 70, y: 70});
            // Orta saha
            positions.push({x: 20, y: 45});
            positions.push({x: 40, y: 45});
            positions.push({x: 50, y: 35});
            positions.push({x: 60, y: 45});
            positions.push({x: 80, y: 45});
            // Forvet
            positions.push({x: 35, y: 15});
            positions.push({x: 65, y: 15});
            break;
    }
    
    return positions;
}

// Oyuncu modalını aç
function openPlayerModal(index) {
    selectedPosition = index;
    const modal = document.getElementById('player-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.getElementById('player-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

// Modalı kapat
function closeModal() {
    const modal = document.getElementById('player-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Oyuncu arama
document.getElementById('player-search').addEventListener('input', 
    debounce(async (e) => {
        const searchTerm = e.target.value;
        if (searchTerm.length < 3) return;

        const results = await searchPlayers(searchTerm);
        displaySearchResults(results);
    }, 300)
);

// API'den oyuncu ara
async function searchPlayers(term) {
    try {
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${term}`);
        const data = await response.json();
        return data.player || [];
    } catch (error) {
        console.error('Arama hatası:', error);
        return [];
    }
}

// Arama sonuçlarını göster
function displaySearchResults(results) {
    const container = document.getElementById('search-results');
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="no-results">Oyuncu bulunamadı</div>';
        return;
    }

    const validPlayers = results.filter(player => 
        player.strPlayer && // ismi olan
        player.strThumb && // fotoğrafı olan
        player.strPlayer.trim() !== '+' && // + işareti olmayan
        player.strPlayer.trim() !== '' // boş olmayan
    );

    if (validPlayers.length === 0) {
        container.innerHTML = '<div class="no-results">Geçerli oyuncu bulunamadı</div>';
        return;
    }

    container.innerHTML = validPlayers.map(player => `
        <div class="player-result" onclick="selectPlayer({
            id: '${player.idPlayer}',
            name: '${player.strPlayer}',
            photo: '${player.strThumb || 'default-player.png'}'
        })">
            <img src="${player.strThumb || 'default-player.png'}" 
                 alt="${player.strPlayer}" 
                 onerror="this.src='default-player.png'">
            <div class="player-info">
                <span class="player-name">${player.strPlayer}</span>
                ${player.strTeam ? `<span class="player-team">${player.strTeam}</span>` : ''}
                ${player.strNationality ? `<span class="player-nationality">${player.strNationality}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Oyuncu seç
function selectPlayer(player) {
    players[selectedPosition] = player;
    createPositions();
    closeModal();
}

// Yardımcı fonksiyonlar
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ESC tuşu ile modalı kapatma
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Sayfa yüklendiğinde modalın gizli olduğundan emin ol
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('player-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
});

// Kadroyu tamamlama kontrolü
function completeTeam() {
    // Tüm pozisyonların dolu olup olmadığını kontrol et
    const isComplete = players.every(player => player !== null);
    
    if (!isComplete) {
        alert('Lütfen tüm pozisyonları doldurun!');
        return;
    }

    // Paylaşım butonlarını göster
    document.getElementById('share-buttons').classList.remove('hidden');
    document.getElementById('complete-team').disabled = true;
}

// Kadroyu görsel olarak indirme
async function downloadTeam() {
    try {
        await loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js');

        // Sadece saha kısmını seç
        const field = document.getElementById('field');
        
        // Geçici bir konteyner oluştur
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '800px';
        container.style.backgroundColor = 'white';
        container.style.padding = '20px';
        
        // Takım bilgilerini ekle
        const header = document.createElement('div');
        header.style.marginBottom = '20px';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.gap = '15px';
        
        const logo = document.createElement('img');
        logo.src = document.getElementById('display-team-logo').src;
        logo.style.width = '60px';
        logo.style.height = '60px';
        logo.style.objectFit = 'contain';
        
        const teamName = document.createElement('h3');
        teamName.textContent = document.getElementById('display-team-name').textContent;
        teamName.style.fontSize = '24px';
        teamName.style.color = '#2d3748';
        
        header.appendChild(logo);
        header.appendChild(teamName);
        container.appendChild(header);
        
        // Sahayı klonla ve ekle
        const clonedField = field.cloneNode(true);
        clonedField.style.height = '500px';
        container.appendChild(clonedField);
        
        // Formasyon bilgisini ekle
        const formation = document.createElement('div');
        formation.textContent = `Formasyon: ${currentFormation}`;
        formation.style.marginTop = '15px';
        formation.style.textAlign = 'center';
        formation.style.fontSize = '16px';
        formation.style.color = '#4a5568';
        container.appendChild(formation);
        
        // Geçici olarak DOM'a ekle
        document.body.appendChild(container);
        
        // Görüntüyü oluştur
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 800,
            height: 650,
            onclone: (clonedDoc) => {
                const images = clonedDoc.getElementsByTagName('img');
                Array.from(images).forEach(img => {
                    img.crossOrigin = 'anonymous';
                });
            }
        });
        
        // Geçici konteyneri kaldır
        document.body.removeChild(container);
        
        // PNG olarak indir
        const link = document.createElement('a');
        link.download = `${currentTeam.name}-kadro.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

    } catch (error) {
        console.error('Görsel oluşturma hatası:', error);
        alert('Görsel oluşturulurken bir hata oluştu! Lütfen tekrar deneyin.');
    }
}

// X'te paylaş
function shareTwitter() {
    const text = `${currentTeam.name} - ${currentFormation} formasyonu ile kurduğum kadro!`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, 
                '_blank');
}

// Instagram'da paylaş (Stories üzerinden)
async function shareInstagram() {
    try {
        await downloadTeam(); // Önce görseli indir
        alert('Görsel indirildi! Instagram Stories üzerinden paylaşabilirsiniz.');
    } catch (error) {
        alert('Paylaşım sırasında bir hata oluştu!');
    }
}

// html2canvas kütüphanesini yükleme yardımcı fonksiyonu
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Stil güncellemeleri için CSS ekle
const style = document.createElement('style');
style.textContent = `
    #field {
        background-size: 100% 100% !important;
    }
    .player-position img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
    }
`;
document.head.appendChild(style); 