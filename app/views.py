from flask import Blueprint, request, render_template
from .ocr import OCR_CNH

main = Blueprint('main', __name__)

@main.route('/')
def main_index():
    return render_template('index.html')

@main.route('/api/ocr_cnh')
def api_ocr():
    img_path = request.args.get('url')
    scanner = OCR_CNH()
    res = scanner.recognize(img_path)
    return res

@main.route('/ocr_cnh')
def ocr_log():
    img_path = request.args.get('url')
    scanner = OCR_CNH()
    res = scanner.recognize(img_path, log=True)
    return res