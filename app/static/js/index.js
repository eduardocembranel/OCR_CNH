function toggleButton(name) {
    var container = document.getElementById('container-' + name);
    var btn = document.getElementById('btn-' + name);
    var btnTxt = btn.innerHTML;
    if (btnTxt.includes('mostrar')) {
        container.style.display = "block";
        btnTxt = btnTxt.replace('mostrar', 'esconder');
    } else {
        container.style.display = "none";
        btnTxt = btnTxt.replace('esconder', 'mostrar');
    }
    btn.innerHTML = btnTxt;
}

function createLog() {
    const div = document.createElement('div');
    div.setAttribute('id', 'log');
    div.innerHTML = `
    <button onclick="toggleButton('pre')" class="button-toggle" id="btn-pre">Pré-processamento (mostrar)</button>
    <div id="container-pre" class="box">
        <div class="img-block">
            <h2>Imagem de entrada</h2>
            <img id="input-img" src="../static/images/log/input.png" alt="Imagem de entrada" width="700">
        </div>
        <div class="img-block">
            <h2>Casamento de pontos-chaves</h2>
            <img id="matches-img" src="../static/images/log/matches.png" alt="Matches" width="700">
        </div>
        <div class="img-block">
            <h2>Imagem de entrada alinhada com o template</h2>
            <img id="aligned-img" src="../static/images/log/aligned.png" alt="Imagem alinhada" width="700">
        </div>
        <div class="img-block">
            <h2>Escala de cinza + ajuste adaptativo de histograma (CLAHE)</h2>
            <img id="clahe-img" src="../static/images/log/clahe.png" alt="Imagem pos grayscale e clahe" width="400">
        </div>
        <div class="img-block">
            <h2>Passa alta + Remoção de ruídos</h2>
            <img id="sharpened-img" src="../static/images/log/sharpened.png" alt="Imagem pos passa alta e noise removal" width="400">
        </div>
        <div class="img-block">
            <h2>Imagem de saida do pre processamento (com regiões de interesse)</h2>
            <img id="rois-img" src="../static/images/log/rois.png" alt="Imagem com os rois" width="400">
        </div>
        <div class="img-block">
            <h2>ROI Nome (Skew correction)</h2>
            <img id="roi-nome" src="../static/images/log/Nome.png" alt="Imagem do nome" width="800">
        </div>
        <div class="img-block">
            <h2>ROI CPF (Skew correction)</h2>
            <img id="roi-cpf" src="../static/images/log/CPF.png" alt="Imagem do cpf" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Data de nascimento (Skew correction)</h2>
            <img id="roi-nascimento" src="../static/images/log/Data de Nascimento.png" alt="Imagem da data de nascimento" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Nome do pai (Skew correction)</h2>
            <img id="roi-pai" src="../static/images/log/Nome do pai.png" alt="Imagem do nome do pai" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Nome da mãe (Skew correction)</h2>
            <img id="roi-mae" src="../static/images/log/Nome da mae.png" alt="Imagem do nome da mae" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Categoria (Skew correction)</h2>
            <img id="roi-categoria" src="../static/images/log/Categoria.png" alt="Imagem do nome da mae" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Registro (Skew correction)</h2>
            <img id="roi-registro" src="../static/images/log/Registro.png" alt="Imagem do nome da mae" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Data de validade (Skew correction)</h2>
            <img id="roi-validade" src="../static/images/log/Data de Validade.png" alt="Imagem do nome da mae" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Primeira hab. (Skew correction)</h2>
            <img id="roi-primeira" src="../static/images/log/Primeira hab..png" alt="Imagem do nome da mae" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Local (Skew correction)</h2>
            <img id="roi-local" src="../static/images/log/Local.png" alt="Imagem do nome da mae" width="800">
        </div>
        <div class="img-block">
            <h2>ROI Data de Emissão (Skew correction)</h2>
            <img id="roi-emissao" src="../static/images/log/Data de Emissao.png" alt="Imagem do nome da mae" width="800">
        </div>
    </div>

    <br>

    <button onclick="toggleButton('pos')" class="button-toggle" id="btn-pos">OCR e Pós-processamento (mostrar)</button>
    <div id="container-pos" class="box">
        
    <table>
            <thead>
                <tr>
                    <th>Chave</th>
                    <th>Valor (OCR)</th>
                    <th>Valor (Pós OCR)</th>
                </tr>
            </thead>
            <tbody id="table-items">
            </tbody>
        </table>
    
    </div>
    `;

    document.getElementById('content').appendChild(div);
}

function removeElement(id) {
    var element = document.getElementById(id);
    if (element) {
        element.parentNode.removeChild(element);
    }
}

function addTableItem(key, value1, value2) {
    var tableBody = document.getElementById('table-items');
    var tr = document.createElement('tr');

    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');

    td1.appendChild(document.createTextNode(key));
    td2.appendChild(document.createTextNode(value1));
    td3.appendChild(document.createTextNode(value2));

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);

    tableBody.appendChild(tr);
}

var submit = document.getElementById('btn-submit');
submit.addEventListener('click', () => {
    showLoader(true);
    removeElement('log');
    var input = document.getElementById('input-file');
    var file = input.value.split("\\");
    var fileName = file[file.length-1];
    var url = 'examples/' + fileName;
    $.ajax({
        type : 'GET',
        url : '/ocr_cnh',
        contentType: 'application/json;charset=UTF-8',
        data : {'url': url},
        success: (res) => {
            showLoader(false);
            createLog();
            updateImages();
            for (key in res) {
                addTableItem(key, res[key][0], res[key][1]);
            }
        }
    });
});

function showLoader(activate) {
    var loader = document.getElementById('loader');
    if (activate) {
        loader.style.display = 'block';
    } else {
        loader.style.display = 'none';
    }
}

function updateImages() {
    document.getElementById('input-img').src = 
    "http://localhost:5000/static/images/log/input.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('matches-img').src = 
    "http://localhost:5000/static/images/log/matches.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('aligned-img').src = 
    "http://localhost:5000/static/images/log/aligned.png" 
    + '?timestamp=' + new Date().getTime();
    
    document.getElementById('clahe-img').src = 
    "http://localhost:5000/static/images/log/clahe.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('sharpened-img').src = 
    "http://localhost:5000/static/images/log/sharpened.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('rois-img').src = 
    "http://localhost:5000/static/images/log/rois.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-nome').src = 
    "http://localhost:5000/static/images/log/Nome.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-cpf').src = 
    "http://localhost:5000/static/images/log/CPF.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-nascimento').src = 
    "http://localhost:5000/static/images/log/Data de Nascimento.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-pai').src = 
    "http://localhost:5000/static/images/log/Nome do pai.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-mae').src = 
    "http://localhost:5000/static/images/log/Nome da mae.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-categoria').src = 
    "http://localhost:5000/static/images/log/Categoria.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-registro').src = 
    "http://localhost:5000/static/images/log/Registro.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-validade').src = 
    "http://localhost:5000/static/images/log/Data de Validade.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-primeira').src = 
    "http://localhost:5000/static/images/log/Primeira hab..png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-local').src = 
    "http://localhost:5000/static/images/log/Local.png" 
    + '?timestamp=' + new Date().getTime();

    document.getElementById('roi-emissao').src = 
    "http://localhost:5000/static/images/log/Data de Emissao.png" 
    + '?timestamp=' + new Date().getTime();
}