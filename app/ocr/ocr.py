import pytesseract
from collections import namedtuple
from app.ocr.preprocessing import *
from app.ocr.posprocessing import posprocess, empty_json, make_borders

class OCR_CNH:
    def __init__(self):
        self.__create_locations()
        
    def __create_locations(self):
        OCR_location = namedtuple(
            'location', ['key', 'bbox', 'segmentation_mode', 'data_type'])
        self.locations = [
            OCR_location('Nome', (154, 185, 854, 42), '7', 'name'),
            OCR_location('Data de Nascimento', (797, 325, 210, 45), '7','date'),
            OCR_location('CPF', (510, 329, 290, 45), '7', 'cpf'),
            OCR_location('Nome do pai', (510, 407, 460, 78), '6', 'name'),
            OCR_location('Nome da mae', (520, 485, 460, 80), '6', 'name'),
            OCR_location('Registro', (160, 675, 340, 35), '7', 'number'),
            OCR_location('Data de Validade', (510, 672, 221, 40), '7', 'date'),
            OCR_location('Primeira hab.', (750, 672, 245, 40), '7', 'date'),
            OCR_location('Categoria', (883, 600, 110, 36), '7', 'category'),
            OCR_location('Data de Emissao', (767, 1182, 230, 48), '7', 'date'),
            OCR_location('Local', (170, 1175, 580, 49), '7', 'address'),
        ]
    
    def recognize(self, img_path, log=False):
        try:
            img_target = load_image(img_path)
            img_preprocessed = preprocess(img_target)
            ocr_result_arr = self.__ocr(img_preprocessed)
            parsed_ocr_result = posprocess(ocr_result_arr, log=log)
            return parsed_ocr_result
        except:
            return empty_json()

    def __ocr(self, img):
        result = []
        for loc in self.locations:
            (x, y, w, h) = loc.bbox
            roi = img[y:y + h, x:x + w]
            ang, roi_corrected = correct_skew(roi)
            tesseract_conf = '--psm {} --oem 3'.format(loc.segmentation_mode)
            text = pytesseract.image_to_string(roi_corrected, 
                config=tesseract_conf)
            result.append((loc, text))

            #log
            roi_bordered = make_borders(roi)
            roi_corrected_bordered = make_borders(roi_corrected)
            roi_concat = cv2.hconcat([roi_bordered, roi_corrected_bordered])
            write_image('app/static/images/log/' + loc.key + '.png', roi_concat)
            
        #log
        for loc in self.locations:
            (x, y, w, h) = loc.bbox
            cv2.rectangle(img, (x, y), (x + w, y + h), (255, 245, 50), 7)
        write_image('app/static/images/log/rois.png', img)

        return result