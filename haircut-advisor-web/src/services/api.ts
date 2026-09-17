import { ClientImages, FaceAnalysisResponse, FaceAnalysisData, TryOnResult } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


/**
 * Converts a Base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Sends captured client images (front, optional side, optional back) to the FastAPI service.
 */
export async function analyzeFace(images: ClientImages): Promise<FaceAnalysisData> {
  if (!images.front) {
    throw new Error('Foto tampak depan wajib diunggah.');
  }

  const formData = new FormData();
  const frontBlob = dataUrlToBlob(images.front);
  formData.append('front_image', frontBlob, 'front.jpg');

  if (images.side) {
    const sideBlob = dataUrlToBlob(images.side);
    formData.append('side_image', sideBlob, 'side.jpg');
  }

  if (images.back) {
    const backBlob = dataUrlToBlob(images.back);
    formData.append('back_image', backBlob, 'back.jpg');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analyze-face`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result?.detail || 'Gagal memproses analisis wajah.';
      throw new Error(errorMsg);
    }

    if (result.status === 'success' && result.data) {
      return result.data as FaceAnalysisData;
    }

    throw new Error(result.detail || 'Format respons tidak sesuai.');
  } catch (err: any) {
    // If server is not reachable (connection refused), provide fallback simulation
    if (
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Load failed')
    ) {
      console.warn('Backend service offline or unreachable, generating fallback simulated consultation...');
      return getSimulatedAnalysis();
    }
    throw err;
  }
}

/**
 * Fallback simulation for testing UI when backend service is paused or unconfigured
 */
export function getSimulatedAnalysis(): FaceAnalysisData {
  return {
    face_shape: 'square',
    confidence_score: 0.91,
    metrics: {
      face_length_to_width_ratio: 1.14,
      forehead_width_px: 318.4,
      cheekbone_width_px: 315.0,
      jaw_width_px: 309.6,
      jaw_angle_degrees: 88.2,
    },
    features_detected: {
      jaw_type: 'sharp_angular',
      forehead_type: 'broad',
      chin_type: 'square',
    },
    haircut_guidance: {
      goal: 'Melembutkan sudut rahang yang kaku atau mempertegas maskulinitas dengan textured top dan taper fade bersih di samping.',
      best_categories: ['Textured Crop', 'Side Part Taper Fade', 'Buzz Cut with Beard Fade', 'Modern Textured Quiff'],
      to_avoid: ['Boxy cuts dengan poni tumpul lurus', 'Heavy blunt bangs', 'Flat top tanpa tekstur'],
    },
    profile_analysis: {
      profile_type: 'straight_balanced',
      mandibular_angle_degrees: 122.0,
      jawline_definition: 'well_defined',
      notes: 'Garis rahang terlihat kokoh dan tajam dari samping. Sangat cocok dengan mid drop fade.',
    },
    back_analysis: {
      crown_texture: 'dense_textured',
      nape_type: 'ideal_for_taper',
      notes: 'Kepadatan rambut tengkuk bagus. Ideal untuk taper leher bersih.',
    },
    client_lookbook: [
      {
        id: 'sq-1',
        name: 'Textured French Crop',
        subtitle: 'Mid Drop Fade with Textured Fringe',
        category: 'Crop & Fringe',
        generated_image_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="100%" height="100%" fill="%23131722"/><circle cx="300" cy="380" r="180" fill="%23c49a6c" opacity="0.3"/><path d="M180,240 Q300,180 420,240 Q380,290 300,280 Q220,290 180,240 Z" fill="%23222831"/><text x="300" y="700" font-family="sans-serif" font-size="24" fill="%23e5b869" font-weight="bold" text-anchor="middle">Textured French Crop</text></svg>',
        fade_type: 'Mid Drop Fade',
        guard_number: '#1.5 closed to #0.5 open',
        top_length: '3 - 4 cm (Choppy Point Cutting)',
        why_it_fits: 'Poni bertekstur tipis memecah kesan kaku dahi kotak, sedangkan mid fade menonjolkan kekuatan rahang maskulin.',
        styling_difficulty: 'Mudah',
        styling_tips: [
          'Keringkan rambut ke depan dengan suhu sedang.',
          'Gunakan Texture Powder seukuran koin untuk memberi grip dan dimensi acak.',
        ],
        recommended_products: ['Matte Texture Powder', 'Clay Pomade Low Shine', 'Sea Salt Spray'],
        barber_notes: 'Point-cutting pada poni agar tidak tumpul. Fade blending halus dari pelipis turun ke occipital bone.',
        match_percentage: 96,
      },
      {
        id: 'sq-2',
        name: 'Classic Side Part Taper',
        subtitle: 'Executive Low Temple Fade',
        category: 'Klasik',
        generated_image_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="100%" height="100%" fill="%23131722"/><circle cx="300" cy="380" r="180" fill="%23c49a6c" opacity="0.3"/><path d="M190,260 Q280,200 420,220 Q400,280 300,270 Q200,280 190,260 Z" fill="%231e232a"/><text x="300" y="700" font-family="sans-serif" font-size="24" fill="%23e5b869" font-weight="bold" text-anchor="middle">Classic Side Part Taper</text></svg>',
        fade_type: 'Low Temple & Neck Taper',
        guard_number: '#2 down to skin at edges',
        top_length: '6 - 8 cm (Side swept)',
        why_it_fits: 'Garis belahan samping memberikan asimetri alami yang melunakkan ketegasan simetri wajah kotak tanpa kehilangan wibawa.',
        styling_difficulty: 'Sedang',
        styling_tips: [
          'Cari garis belahan alami rambut.',
          'Sisir ke samping dan sedikit ke belakang dengan pomade water-based.',
        ],
        recommended_products: ['Water-Based Pomade Medium Hold', 'Grooming Tonic', 'Fine Tooth Comb'],
        barber_notes: 'Pertahankan ketebalan di area parietal ridge. Garis tepi pelipis dibersihkan dengan foil shaver.',
        match_percentage: 92,
      },
      {
        id: 'sq-3',
        name: 'Buzz Cut with Beard Fade',
        subtitle: 'High Contrast Clean Aesthetic',
        category: 'Fade & Taper',
        generated_image_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="100%" height="100%" fill="%23131722"/><circle cx="300" cy="380" r="180" fill="%23c49a6c" opacity="0.3"/><path d="M190,270 Q300,220 410,270 Q380,290 300,285 Q220,290 190,270 Z" fill="%23181c24"/><text x="300" y="700" font-family="sans-serif" font-size="24" fill="%23e5b869" font-weight="bold" text-anchor="middle">Buzz Cut with Beard Fade</text></svg>',
        fade_type: 'High Skin Fade',
        guard_number: '#3 on top, #0 on sides',
        top_length: '9 mm - 12 mm uniform',
        why_it_fits: 'Mengekspos proporsi simetris sempurna dan garis rahang tegas pria berwajah kotak secara maksimal.',
        styling_difficulty: 'Mudah',
        styling_tips: [
          'Cukup keramas dan gunakan scalp oil atau moisturizer kulit kepala setiap hari.',
        ],
        recommended_products: ['Scalp Moisturizer', 'Matte Finish Sunscreen SPF 30'],
        barber_notes: 'Pastikan hair line depan dicukur tajam (sharp shape-up). Fade jenggot menyambung mulus dari sideburn.',
        match_percentage: 94,
      },
      {
        id: 'sq-4',
        name: 'Modern Textured Quiff',
        subtitle: 'Low Skin Fade with Textured Height',
        category: 'Modern & Quiff',
        generated_image_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="100%" height="100%" fill="%23131722"/><circle cx="300" cy="380" r="180" fill="%23c49a6c" opacity="0.3"/><path d="M200,250 Q300,160 400,240 Q360,280 300,265 Q240,280 200,250 Z" fill="%23252c38"/><text x="300" y="700" font-family="sans-serif" font-size="24" fill="%23e5b869" font-weight="bold" text-anchor="middle">Modern Textured Quiff</text></svg>',
        fade_type: 'Low Skin Fade',
        guard_number: '#1 to #3 blended',
        top_length: '7 - 9 cm at front quiff',
        why_it_fits: 'Volume vertikal di bagian jambul mengangkat proporsi vertikal wajah sehingga tidak tampak terlalu lebar atau melebar ke samping.',
        styling_difficulty: 'Sedang',
        styling_tips: [
          'Gunakan hair dryer dan sisir bulat untuk mengangkat pangkal rambut depan.',
          'Kunci dengan clay matte seukuran ujung jari.',
        ],
        recommended_products: ['Volumizing Clay', 'Heat Protection Spray', 'Round Vent Brush'],
        barber_notes: 'Gradasi scissor over comb di area crown agar transisi quiff ke belakang tetap rapat.',
        match_percentage: 95,
      },
      {
        id: 'sq-5',
        name: 'Messy Spiky Texture',
        subtitle: 'Mid Taper Fade with Piecey Texture',
        category: 'Crop & Fringe',
        generated_image_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="100%" height="100%" fill="%23131722"/><circle cx="300" cy="380" r="180" fill="%23c49a6c" opacity="0.3"/><path d="M190,240 Q300,170 410,235 Q370,285 300,270 Q230,285 190,240 Z" fill="%232a313d"/><text x="300" y="700" font-family="sans-serif" font-size="24" fill="%23e5b869" font-weight="bold" text-anchor="middle">Messy Spiky Texture</text></svg>',
        fade_type: 'Mid Taper Fade',
        guard_number: '#1.5 to #3',
        top_length: '4 - 5 cm textured',
        why_it_fits: 'Tekstur acak spiky memecah garis horizontal rahang dan dahi, memberi kesan kasual yang awet muda.',
        styling_difficulty: 'Mudah',
        styling_tips: [
          'Ratakan pomade pasta di telapak tangan lalu acak rambut dari akar ke ujung.',
        ],
        recommended_products: ['Styling Paste Matte', 'Sea Salt Spray'],
        barber_notes: 'Gunakan thinning shears atau razor texturizing pada 1/3 ujung rambut bagian atas.',
        match_percentage: 90,
      },
      {
        id: 'sq-6',
        name: 'Slicked Back Undercut',
        subtitle: 'Disconnected High Fade',
        category: 'Klasik',
        generated_image_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="100%" height="100%" fill="%23131722"/><circle cx="300" cy="380" r="180" fill="%23c49a6c" opacity="0.3"/><path d="M210,240 Q300,190 390,240 Q360,275 300,270 Q240,275 210,240 Z" fill="%231b1f28"/><text x="300" y="700" font-family="sans-serif" font-size="24" fill="%23e5b869" font-weight="bold" text-anchor="middle">Slicked Back Undercut</text></svg>',
        fade_type: 'High Drop Undercut',
        guard_number: '#1 closed all around',
        top_length: '8 - 10 cm slicked straight back',
        why_it_fits: 'Mempertegas struktur tulang wajah kotak yang kuat, memberikan tampilan tegas dan berwibawa.',
        styling_difficulty: 'Sedang',
        styling_tips: [
          'Sisir rambut ke belakang saat setengah basah lalu aplikasikan pomade high hold.',
        ],
        recommended_products: ['High Hold Water-Based Pomade', 'Wide Tooth Comb'],
        barber_notes: 'Buat disconnection bersih di garis pelipis ke belakang occipital bone.',
        match_percentage: 91,
      },
    ],
  };
}

/**
 * Request virtual haircut try-on from FastAPI backend
 */
export async function requestVirtualTryOn(
  customerImageDataUrl: string,
  haircutId?: string,
  haircutName?: string,
  haircutImageUrl?: string,
  barberNotes?: string
): Promise<TryOnResult> {
  const formData = new FormData();
  const customerBlob = dataUrlToBlob(customerImageDataUrl);
  formData.append('customer_image', customerBlob, 'customer.jpg');

  if (haircutId) formData.append('haircut_id', haircutId);
  if (haircutName) formData.append('haircut_name', haircutName);
  if (haircutImageUrl) formData.append('haircut_image_url', haircutImageUrl);
  if (barberNotes) formData.append('barber_notes', barberNotes);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/try-on`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.detail || 'Gagal memproses virtual try-on.');
    }

    if (result.status === 'success' && result.data) {
      return result.data as TryOnResult;
    }
    throw new Error(result.detail || 'Format respons try-on tidak sesuai.');
  } catch (err: any) {
    if (
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Load failed')
    ) {
      console.warn('Backend service offline, returning customer photo try-on fallback...');
      return {
        haircut_id: haircutId,
        haircut_name: haircutName,
        after_image_base64: customerImageDataUrl,
        barber_notes: barberNotes,
        is_simulation: true,
      };
    }
    throw err;
  }
}

/**
 * Convenience wrapper for virtual try-on with object arguments
 */
export async function executeVirtualTryOn(params: {
  customerImageDataUrl: string;
  haircutId?: string;
  haircutName?: string;
  haircutImageUrl?: string;
  barberNotes?: string;
}): Promise<TryOnResult> {
  return requestVirtualTryOn(
    params.customerImageDataUrl,
    params.haircutId,
    params.haircutName,
    params.haircutImageUrl,
    params.barberNotes
  );
}


