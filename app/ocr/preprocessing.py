import cv2
import numpy as np
from scipy.ndimage import interpolation as inter

def load_image(img_path):
    return cv2.imread(img_path, cv2.IMREAD_COLOR)

def write_image(img_path, img):
    cv2.imwrite(img_path, img)
    
def add_3_channels(img, one_channel_img):
    img2 = np.zeros_like(img)
    img2[:,:,0] = one_channel_img
    img2[:,:,1] = one_channel_img
    img2[:,:,2] = one_channel_img
    return img2

def gray_scale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def threshold_otsu(img, inv=False):
    thresh_bin = cv2.THRESH_BINARY if not inv else cv2.THRESH_BINARY_INV
    return cv2.threshold(img, 0, 255, thresh_bin + cv2.THRESH_OTSU)[1]

def clahe(img, clip=2.0, tile_grid=8):
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(tile_grid, tile_grid))
    return clahe.apply(img)

def sharpen(img):
    kernel = np.array([[-1 ,-1, -1], [-1, 9, -1], [-1, -1, -1]])
    return cv2.filter2D(img, -1, kernel)

def noise_removal(img, k=3):
    return cv2.medianBlur(img, k)

def correct_skew(img, delta=1, limit=5):
    def determine_score(arr, angle):
        data = inter.rotate(arr, angle, reshape=False, order=0)
        histogram = np.sum(data, axis=1)
        score = np.sum((histogram[1:] - histogram[:-1]) ** 2)
        return histogram, score

    gray = gray_scale(img)
    thresh = threshold_otsu(gray, inv=True)

    scores = []
    angles = np.arange(-limit, limit + delta, delta)
    for angle in angles:
        histogram, score = determine_score(thresh, angle)
        scores.append(score)

    best_angle = angles[scores.index(max(scores))]

    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, best_angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE)

    return best_angle, rotated

def align_images(img1, img2, max_features=20000, good_match_percent=0.01):
    img1_gray = gray_scale(img1)
    img2_gray = gray_scale(img2)

    orb = cv2.ORB_create(max_features)
    key_points1, descriptors1 = orb.detectAndCompute(img1_gray, None)
    key_points2, descriptors2 = orb.detectAndCompute(img2_gray, None)

    matcher = cv2.DescriptorMatcher_create(
        cv2.DESCRIPTOR_MATCHER_BRUTEFORCE_HAMMING)
    matches = matcher.match(descriptors1, descriptors2, None)
    
    matches.sort(key=lambda x: x.distance, reverse=False)

    num_good_matches = int(len(matches) * good_match_percent)
    matches = matches[:num_good_matches]

    img_matches = cv2.drawMatches(img1, 
        key_points1, img2, key_points2, matches, None)
    write_image('app/static/images/log/matches.png', img_matches)

    points1 = np.zeros((len(matches), 2), dtype=np.float32)
    points2 = np.zeros((len(matches), 2), dtype=np.float32)

    for i, match in enumerate(matches):
        points1[i, :] = key_points1[match.queryIdx].pt
        points2[i, :] = key_points2[match.trainIdx].pt

    h, mask = cv2.findHomography(points1, points2, cv2.RANSAC)

    height, width, channels = img2.shape
    img1Reg = cv2.warpPerspective(img1, h, (width, height))

    return img1Reg, h

def preprocess(img):
    img_template = load_image('app/static/images/template.jpg')
    
    aligned, h = align_images(img, img_template)
    #aligned = copy.deepcopy(aligned)

    img_gray = gray_scale(aligned)
    img_clahe = clahe(img_gray, 1.0, 7)
    img_clahe = add_3_channels(aligned, img_clahe)
    img_sharpened = sharpen(img_clahe)
    img_noise_removed = noise_removal(img_sharpened)

    #log
    aligned_template = cv2.hconcat([img_template, aligned])
    write_image('app/static/images/log/input.png', img)
    write_image('app/static/images/log/aligned.png', aligned_template)
    write_image('app/static/images/log/clahe.png', img_clahe)
    write_image('app/static/images/log/sharpened.png', img_noise_removed)

    return img_noise_removed