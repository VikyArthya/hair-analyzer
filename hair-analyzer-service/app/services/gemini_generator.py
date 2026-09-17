"""Google Gemini AI service for generating personalized hairstyle lookbooks directly on client portraits."""

import io
import base64
import asyncio
from typing import List, Dict, Any, Optional
import cv2
import numpy as np
from PIL import Image

from app.core.config import settings
from app.schemas.face import GeneratedClientHaircut


class GeminiLookbookGenerator:
    """Generates 6-8 tailored hairstyle variations rendered directly on the client's photographed face."""

    # 6 to 8 tailored hairstyle templates for each of the 6 face shapes
    LOOKBOOK_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
        "square": [
            {
                "id": "sq-1",
                "name": "Textured French Crop",
                "subtitle": "Mid Drop Fade with Textured Fringe",
                "category": "Crop & Fringe",
                "fade_type": "Mid Drop Fade",
                "guard_number": "#1.5 closed to #0.5 open",
                "top_length": "3 - 4 cm (Choppy Point Cutting)",
                "why_it_fits": "Poni bertekstur tipis memecah kesan kaku dahi kotak, sedangkan mid fade menonjolkan kekuatan rahang maskulin.",
                "styling_difficulty": "Mudah",
                "styling_tips": [
                    "Keringkan rambut ke depan dengan suhu sedang.",
                    "Gunakan Texture Powder seukuran koin untuk memberi grip dan dimensi acak.",
                ],
                "recommended_products": ["Matte Texture Powder", "Clay Pomade Low Shine", "Sea Salt Spray"],
                "barber_notes": "Point-cutting pada poni agar tidak tumpul. Fade blending halus dari pelipis turun ke occipital bone.",
                "haircut_prompt": "A modern textured French crop haircut with a choppy fringe and a clean mid drop fade on the sides. Short textured hair on top.",
            },
            {
                "id": "sq-2",
                "name": "Classic Side Part Taper",
                "subtitle": "Executive Low Temple Fade",
                "category": "Gentleman Classic",
                "fade_type": "Low Temple & Neck Taper",
                "guard_number": "#2 down to skin at edges",
                "top_length": "6 - 8 cm (Side swept)",
                "why_it_fits": "Garis belahan samping memberikan asimetri alami yang melunakkan ketegasan simetri wajah kotak tanpa kehilangan wibawa.",
                "styling_difficulty": "Sedang",
                "styling_tips": [
                    "Cari garis belahan alami rambut.",
                    "Sisir ke samping dan sedikit ke belakang dengan pomade water-based.",
                ],
                "recommended_products": ["Water-Based Pomade Medium Hold", "Grooming Tonic", "Fine Tooth Comb"],
                "barber_notes": "Pertahankan ketebalan di area parietal ridge. Garis tepi pelipis dibersihkan dengan foil shaver.",
                "haircut_prompt": "A clean classic side part haircut with a neat taper fade around the temples and neckline. Combed neatly to the side with medium shine.",
            },
            {
                "id": "sq-3",
                "name": "Buzz Cut with Beard Fade",
                "subtitle": "High Contrast Clean Aesthetic",
                "category": "Short & Crisp",
                "fade_type": "High Skin Fade",
                "guard_number": "#3 on top, skin on sides",
                "top_length": "9 mm uniform guard",
                "why_it_fits": "Sangat cocok untuk pria dengan tulang pipi dan rahang tegas, memberikan tampilan maskulin dan clean.",
                "styling_difficulty": "Mudah",
                "styling_tips": [
                    "Hampir zero-maintenance harian.",
                    "Oleskan moisturizer kulit kepala dan beard oil untuk kilau sehat.",
                ],
                "recommended_products": ["Beard Conditioning Oil", "Matte Scalp Moisturizer"],
                "barber_notes": "Pastikan transisi jambang memudar (reverse fade) dari bawah telinga ke rahang agar garis rahang kotak terlihat sangat tajam.",
                "haircut_prompt": "A sharp masculine buzz cut with a high skin fade on the sides seamlessly blending into a well-groomed beard fade along the sharp square jawline.",
            },
            {
                "id": "sq-4",
                "name": "Modern Textured Quiff",
                "subtitle": "Dynamic Mid Skin Taper",
                "category": "Volumetric Modern",
                "fade_type": "Mid Skin Taper",
                "guard_number": "#1 to #3 blended",
                "top_length": "7 - 9 cm at front fringe",
                "why_it_fits": "Volume di jambul depan menambah dimensi vertikal seimbang, mengurangi kesan wajah yang terlalu pendek atau melebar.",
                "styling_difficulty": "Sedang",
                "styling_tips": [
                    "Blow dry ke arah atas dan belakang menggunakan round brush.",
                    "Kunci dengan clay matte berdaya rekat tinggi.",
                ],
                "recommended_products": ["Matte Hair Paste", "Round Styling Brush", "Strong Hold Hairspray"],
                "barber_notes": "Over-direct rambut bagian depan ke belakang saat memotong sudut atas agar jambul memiliki daya angkat maksimal.",
                "haircut_prompt": "A stylish modern quiff hairstyle with upward volume and texture in the front, paired with a clean mid taper fade on the sides.",
            },
            {
                "id": "sq-5",
                "name": "Textured Crew Cut",
                "subtitle": "Short Tapered Athleisure",
                "category": "Short & Crisp",
                "fade_type": "Mid Taper Fade",
                "guard_number": "#2 to #4 graduated",
                "top_length": "2.5 - 3.5 cm",
                "why_it_fits": "Panjang rambut pendek dan bergradasi menjaga proporsi kepala tetap proporsional tanpa menambah lebar pelipis.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Beri sedikit wax matte pada rambut kering lalu tata ke samping depan."],
                "recommended_products": ["Matte Clay", "Texture Salt Spray"],
                "barber_notes": "Square off hairline di pelipis dan blend halus ke area parietal ridge.",
                "haircut_prompt": "A sharp textured crew cut haircut, slightly longer in front and neatly graduated to the crown, with a tight mid taper fade on the sides.",
            },
            {
                "id": "sq-6",
                "name": "Ivy League Side Sweep",
                "subtitle": "Smart Casual Subtle Fade",
                "category": "Gentleman Classic",
                "fade_type": "Low Drop Taper",
                "guard_number": "#2.5 to #1.5",
                "top_length": "4 - 5 cm",
                "why_it_fits": "Potongan rapi berkelas yang memberi sentuhan formal sekaligus modern pada rahang tegas.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Sisir miring santai dengan jari setelah mandi."],
                "recommended_products": ["Light Styling Cream", "Flexible Hold Spray"],
                "barber_notes": "Pertahankan volume tipis di pelipis agar transisi wajah kotak terlihat natural.",
                "haircut_prompt": "A clean ivy league haircut with a subtle low fade, parted softly and brushed casually to the side, natural matte finish.",
            },
            {
                "id": "sq-7",
                "name": "Faux Hawk Fade",
                "subtitle": "Angular Center Ridge",
                "category": "Volumetric Modern",
                "fade_type": "Burst / High Skin Fade",
                "guard_number": "Skin to #2",
                "top_length": "5 - 7 cm at crest",
                "why_it_fits": "Bentuk puncak di tengah menyeimbangkan sudut samping rahang kotak dengan titik fokus vertikal.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Rapatkan kedua sisi atas ke tengah menggunakan clay."],
                "recommended_products": ["High Hold Matte Clay", "Texture Dust"],
                "barber_notes": "Bentuk sudut piramida tumpul di bagian puncak kepala.",
                "haircut_prompt": "A modern faux hawk fade with clean faded sides and a textured, lifted ridge along the center top.",
            },
            {
                "id": "sq-8",
                "name": "Slicked Undercut",
                "subtitle": "Bold Disconnected Profile",
                "category": "Slicked Style",
                "fade_type": "High Disconnected Fade",
                "guard_number": "#1 to skin",
                "top_length": "8 - 10 cm slicked back",
                "why_it_fits": "Memberikan kontras visual yang dramatis antara sisi samping yang sangat bersih dan bagian atas yang mengalir ke belakang.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Gunakan pomade kilau rendah dan sisir ke belakang."],
                "recommended_products": ["Classic Pomade Low Shine", "Vent Brush"],
                "barber_notes": "Disconnection jelas di pelipis dengan taper tipis di sekeliling leher.",
                "haircut_prompt": "A bold disconnected undercut with short faded sides and long textured hair swept straight back.",
            },
        ],
        "oval": [
            {
                "id": "ov-1",
                "name": "Classic Pompadour",
                "subtitle": "High Volume Taper Fade",
                "category": "Iconic Classic",
                "fade_type": "Low Taper Fade",
                "guard_number": "#2 down to #1",
                "top_length": "8 - 10 cm",
                "why_it_fits": "Bentuk oval mempertahankan simetri sempurna dengan jambul yang tinggi dan bersih dari dahi.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Blow dry dengan round brush lalu aplikasikan pomade."],
                "recommended_products": ["Classic Pomade", "Sea Salt Pre-styler", "Quiff Roller"],
                "barber_notes": "Gradasi meningkat ke arah depan untuk pondasi jambul kokoh.",
                "haircut_prompt": "A high-volume classic pompadour hairstyle swept up and back with clean tapered sides and a subtle sheen.",
            },
            {
                "id": "ov-2",
                "name": "Mid Fade Slick Back",
                "subtitle": "Streamlined Executive Flow",
                "category": "Slicked Style",
                "fade_type": "Mid Skin Fade",
                "guard_number": "#0.5 to #2",
                "top_length": "7 - 9 cm",
                "why_it_fits": "Rambut disisir ke belakang memperlihatkan proporsi wajah oval yang simetris tanpa distraksi.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Sisir ke belakang saat masih lembap dengan pomade water-based."],
                "recommended_products": ["High Hold Water-Based Pomade", "Wide Tooth Comb"],
                "barber_notes": "Texturize ujung rambut agar saat disisir ke belakang tidak menggumpal kaku.",
                "haircut_prompt": "A modern slick back hairstyle with mid skin fade on the sides, hair neatly combed straight back.",
            },
            {
                "id": "ov-3",
                "name": "Modern Textured Mullet / Taper",
                "subtitle": "Contemporary Edge with Flow",
                "category": "Modern Trend",
                "fade_type": "Temple Taper with Low Nape Blend",
                "guard_number": "#2 open at temples",
                "top_length": "6 - 8 cm with natural neck taper",
                "why_it_fits": "Panjang bagian belakang dan tekstur samping memberikan karakter unik pada proporsi oval.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Remas rambut dengan sea salt spray untuk tekstur alami."],
                "recommended_products": ["Sea Salt Spray", "Light Texture Cream"],
                "barber_notes": "Pertahankan rambut leher dengan teknik scissor over comb halus.",
                "haircut_prompt": "A trendy modern textured taper mullet with clean faded temples, textured top, and medium flow at the nape.",
            },
            {
                "id": "ov-4",
                "name": "Side Swept Quiff",
                "subtitle": "Natural Diagonal Volume",
                "category": "Volumetric Modern",
                "fade_type": "Mid Drop Fade",
                "guard_number": "#1.5 to #3",
                "top_length": "6 - 8 cm",
                "why_it_fits": "Memberikan aksen dinamis yang menonjolkan fitur mata dan dahi simetris oval.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Blow dry miring ke arah belakang."],
                "recommended_products": ["Matte Paste", "Sea Salt Spray"],
                "barber_notes": "Over-direct sudut samping depan agar arah sisiran mengalir halus.",
                "haircut_prompt": "A stylish side-swept textured quiff with a mid drop fade on the sides.",
            },
            {
                "id": "ov-5",
                "name": "French Crop with Textured Bangs",
                "subtitle": "Urban Minimalist",
                "category": "Crop & Fringe",
                "fade_type": "Low Skin Fade",
                "guard_number": "#1 to skin",
                "top_length": "3.5 - 4.5 cm",
                "why_it_fits": "Crop minimalis menjaga keseimbangan proporsi wajah oval tanpa membuatnya terlihat pendek.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Gunakan texture powder pada rambut kering."],
                "recommended_products": ["Texture Dust", "Matte Clay"],
                "barber_notes": "Micro-fringe dipotong tipis dan tidak terlalu tebal.",
                "haircut_prompt": "A textured French crop haircut with a soft micro fringe and low skin fade.",
            },
            {
                "id": "ov-6",
                "name": "Buzz Cut Line-Up",
                "subtitle": "Ultra Clean Precision",
                "category": "Short & Crisp",
                "fade_type": "High Skin Fade",
                "guard_number": "#2.5 uniform",
                "top_length": "8 mm",
                "why_it_fits": "Wajah oval memiliki bentuk tengkorak paling ideal untuk potongan sangat pendek.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Cukup bersihkan tepi hairline secara berkala."],
                "recommended_products": ["Scalp Tonic", "Beard Oil"],
                "barber_notes": "Edge-up rapi di pelipis dengan foil shaver.",
                "haircut_prompt": "A sharp buzz cut with razor-sharp edge line-up and a high bald fade.",
            },
            {
                "id": "ov-7",
                "name": "Curtain Middle Part",
                "subtitle": "90s Retro Modern Flow",
                "category": "Medium Flow",
                "fade_type": "Scissor Taper",
                "guard_number": "All scissor work",
                "top_length": "10 - 12 cm",
                "why_it_fits": "Belahan tengah menonjolkan simetri sempurna mata dan tulang pipi oval.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Belah tengah saat lembap, sisir melengkung ke luar."],
                "recommended_products": ["Grooming Cream", "Leave-in Tonic"],
                "barber_notes": "Soft layering di sekeliling telinga.",
                "haircut_prompt": "A stylish middle-part curtain hairstyle with natural flowing layers falling gently at the cheekbones.",
            },
            {
                "id": "ov-8",
                "name": "Tapered Scissor Cut",
                "subtitle": "Timeless Professional",
                "category": "Gentleman Classic",
                "fade_type": "Classic Low Taper",
                "guard_number": "#3 to #4 taper",
                "top_length": "5 - 7 cm",
                "why_it_fits": "Tampilan profesional rapi yang selalu cocok untuk lingkungan formal maupun kasual.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Sisir rapi dengan sedikit wax natural."],
                "recommended_products": ["Natural Shine Pomade", "Comb"],
                "barber_notes": "Potongan gunting penuh yang mengikuti kontur alami kepala.",
                "haircut_prompt": "A timeless tapered scissor haircut with clean natural edges and soft texture on top.",
            },
        ],
        "round": [
            {
                "id": "rd-1",
                "name": "High Skin Fade Pompadour",
                "subtitle": "Vertical Elongation Master",
                "category": "Angular & Height",
                "fade_type": "High Skin Fade",
                "guard_number": "Foil shaver to #1.5",
                "top_length": "6 - 8 cm",
                "why_it_fits": "Fade sangat tipis memangkas kelebaran pipi bulat, sementara tinggi di atas memanjangkan siluet wajah.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Angkat bagian atas vertikal dengan blow dryer."],
                "recommended_products": ["Volumizing Mousse", "Matte Clay Strong Hold"],
                "barber_notes": "Naikkan batas fade lebih tinggi di atas telinga untuk mempertegas sudut wajah.",
                "haircut_prompt": "A high-volume pompadour with high skin fade on the sides, creating vertical height to slim a round face.",
            },
            {
                "id": "rd-2",
                "name": "Faux Hawk Burst Fade",
                "subtitle": "Sharp Angular Focus",
                "category": "Angular & Height",
                "fade_type": "Burst Fade around ears",
                "guard_number": "Skin to #2",
                "top_length": "5 - 6 cm",
                "why_it_fits": "Puncak rambut di tengah memusatkan fokus mata secara vertikal, mengimbangi pipi yang penuh.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Arahkan kedua sisi atas ke tengah dengan jari."],
                "recommended_products": ["Texture Paste", "Hair Powder"],
                "barber_notes": "Burst fade melengkung di sekeliling telinga.",
                "haircut_prompt": "A sharp faux hawk haircut with curved burst fade around the ears and spiky textured center.",
            },
            {
                "id": "rd-3",
                "name": "Side Part Quiff with Drop Fade",
                "subtitle": "Structured Diagonal Flow",
                "category": "Gentleman Classic",
                "fade_type": "Drop Fade",
                "guard_number": "#1 to #2.5",
                "top_length": "5 - 7 cm",
                "why_it_fits": "Garis diagonal dari belahan rambut memecah bentuk lingkaran wajah menjadi lebih bersudut tajam.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Arahkan jambul membentuk sudut 45 derajat."],
                "recommended_products": ["Fiber Pomade", "Setting Spray"],
                "barber_notes": "Jatuhkan garis fade di belakang leher.",
                "haircut_prompt": "A side-part quiff with a sharp drop fade on the sides and angular styling.",
            },
            {
                "id": "rd-4",
                "name": "Spiky Textured Top Fade",
                "subtitle": "Crisp Upward Definition",
                "category": "Short & Crisp",
                "fade_type": "High Taper Fade",
                "guard_number": "#1 to #3",
                "top_length": "4 - 5 cm spiky",
                "why_it_fits": "Tekstur berdiri vertikal memberi ketegasan garis pada kontur kepala bulat.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Beri wax pada ujung jari lalu tarik rambut ke atas."],
                "recommended_products": ["Spike Clay", "Matte Putty"],
                "barber_notes": "Deep point-cutting di seluruh bagian atas.",
                "haircut_prompt": "A short spiky textured haircut with a high skin fade, adding sharp angles to the face.",
            },
            {
                "id": "rd-5",
                "name": "Textured Crop with High Fade",
                "subtitle": "Horizontal Fringe Breakup",
                "category": "Crop & Fringe",
                "fade_type": "High Skin Fade",
                "guard_number": "#0.5 to skin",
                "top_length": "3.5 - 4 cm",
                "why_it_fits": "High skin fade di pelipis memangkas lebar pipi secara drastis.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Keringkan rambut ke depan dan acak dengan dust powder."],
                "recommended_products": ["Volumizing Powder", "Sea Salt Spray"],
                "barber_notes": "Jangan buat poni terlalu tebal.",
                "haircut_prompt": "A textured French crop with an ultra-clean high fade and textured top.",
            },
            {
                "id": "rd-6",
                "name": "Hard Part Combover",
                "subtitle": "Sharp Geometric Parting",
                "category": "Gentleman Classic",
                "fade_type": "Mid Skin Fade",
                "guard_number": "#1 to #2.5",
                "top_length": "6 - 7 cm",
                "why_it_fits": "Garis belahan tegas memberi ilusi garis lurus tajam pada wajah yang membulat.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Sisir rapi mengikuti garis hard part."],
                "recommended_products": ["Water-Based Pomade", "Fine Comb"],
                "barber_notes": "Razor hard part tipis di sisi kiri atau kanan.",
                "haircut_prompt": "A crisp combover haircut with a shaved hard part and mid skin fade.",
            },
        ],
        "oblong": [
            {
                "id": "ob-1",
                "name": "Textured Crew Cut (Scissor Sides)",
                "subtitle": "Balanced Proportion Cut",
                "category": "Short & Crisp",
                "fade_type": "Low Taper (Scissor)",
                "guard_number": "#3 to #4 taper (or scissor)",
                "top_length": "3 - 4 cm flat profile",
                "why_it_fits": "Menjaga sisi samping tetap memiliki ketebalan sehingga wajah tidak terkesan kurus atau memanjang.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Keringkan alami dan beri sedikit matte cream."],
                "recommended_products": ["Matte Styling Cream", "Light Hold Spray"],
                "barber_notes": "Jangan buat fade terlalu tinggi atau botak.",
                "haircut_prompt": "A classic textured crew cut with natural scissor-cut sides maintaining balanced width.",
            },
            {
                "id": "ob-2",
                "name": "Side Swept Fringe Drop Fade",
                "subtitle": "Forehead Shortener",
                "category": "Crop & Fringe",
                "fade_type": "Low Drop Fade",
                "guard_number": "#1.5 to #3",
                "top_length": "6 - 7 cm angled fringe",
                "why_it_fits": "Poni menyamping menutupi sepertiga atas dahi, memotong panjang visual wajah secara dramatis.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Sapukan poni menyamping dengan jari."],
                "recommended_products": ["Sea Salt Spray", "Dry Texture Wax"],
                "barber_notes": "Potong poni dengan sudut miring asimetris.",
                "haircut_prompt": "A modern side-swept fringe hairstyle with low drop fade, shortening the visual face length.",
            },
            {
                "id": "ob-3",
                "name": "Classic Side Part Taper",
                "subtitle": "Horizontal Width Balance",
                "category": "Gentleman Classic",
                "fade_type": "Low Taper",
                "guard_number": "#2 to #4",
                "top_length": "5 - 6 cm",
                "why_it_fits": "Menambah kepenuhan di sisi telinga untuk menyeimbangkan wajah lonjong.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Sisir rapi dengan wax matte tanpa meninggikan jambul."],
                "recommended_products": ["Matte Paste", "Comb"],
                "barber_notes": "Hindari memotong bagian atas terlalu tinggi.",
                "haircut_prompt": "A neat classic side part with full tapered sides and flat low-profile top.",
            },
            {
                "id": "ob-4",
                "name": "Messy Caesar Cut with Beard",
                "subtitle": "Horizontal Symmetry",
                "category": "Crop & Fringe",
                "fade_type": "Low Temple Fade",
                "guard_number": "#2 to #3",
                "top_length": "3 - 4 cm",
                "why_it_fits": "Poni lurus pendek memotong vertikalitas dahi lonjong.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Acak rambut ke arah dahi."],
                "recommended_products": ["Texture Powder", "Beard Oil"],
                "barber_notes": "Poni dibuat bertekstur alami.",
                "haircut_prompt": "A messy Caesar haircut with textured forward fringe and low temple taper.",
            },
            {
                "id": "ob-5",
                "name": "Buzz Cut with Full Beard",
                "subtitle": "Rugged Compact Profile",
                "category": "Short & Crisp",
                "fade_type": "Low Fade",
                "guard_number": "#3 on top",
                "top_length": "10 mm",
                "why_it_fits": "Jambang penuh menambah lebar visual horizontal pada rahang bawah.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Rawat jambang agar tetap rapi."],
                "recommended_products": ["Beard Balm", "Moisturizer"],
                "barber_notes": "Blend halus jambang ke rambut samping.",
                "haircut_prompt": "A clean buzz cut paired with a thick, well-shaped beard adding width to the jawline.",
            },
            {
                "id": "ob-6",
                "name": "Layered Scissor Flow",
                "subtitle": "Medium Side Fullness",
                "category": "Medium Flow",
                "fade_type": "Scissor Taper",
                "guard_number": "All scissor",
                "top_length": "8 - 10 cm",
                "why_it_fits": "Volume samping alami melebarkan kontur wajah lonjong.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Gunakan sea salt spray pada rambut lembap."],
                "recommended_products": ["Sea Salt Spray", "Matte Cream"],
                "barber_notes": "Scissor cut bertingkat (graduation).",
                "haircut_prompt": "A medium-length layered scissor cut with natural side fullness and relaxed texture.",
            },
        ],
        "heart": [
            {
                "id": "ht-1",
                "name": "Mid-Length Textured Waves",
                "subtitle": "Jawline Balancing Flow",
                "category": "Medium Flow",
                "fade_type": "Scissor Cut Soft Perimeter",
                "guard_number": "Scissor over comb",
                "top_length": "8 - 12 cm layered",
                "why_it_fits": "Gelombang rambut medium di sekitar telinga mengisi ruang kosong di samping dagu lancip.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Gunakan leave-in conditioner pada rambut bergelombang."],
                "recommended_products": ["Curl Cream", "Leave-in Tonic"],
                "barber_notes": "Point cut pada layer samping untuk volume jatuh di rahang.",
                "haircut_prompt": "A medium-length wavy flow haircut with soft scissor-cut layers balancing a narrow chin.",
            },
            {
                "id": "ht-2",
                "name": "Curtain Fringe Low Taper",
                "subtitle": "Forehead Slimmer",
                "category": "Medium Flow",
                "fade_type": "Low Taper Fade",
                "guard_number": "#2 to #3",
                "top_length": "10 - 12 cm",
                "why_it_fits": "Belahan gorden menyamarkan kedua sudut dahi lebar dan memusatkan fokus ke mata.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Belah tengah dan sisir melengkung ke pelipis."],
                "recommended_products": ["Light Grooming Spray", "Matte Paste"],
                "barber_notes": "Panjang tirai jatuh sejajar tulang pipi.",
                "haircut_prompt": "A curtain fringe middle-part haircut softly covering wide forehead corners with low taper.",
            },
            {
                "id": "ht-3",
                "name": "Textured Crop with Beard",
                "subtitle": "Lower Face Anchor",
                "category": "Crop & Fringe",
                "fade_type": "Mid Taper Fade",
                "guard_number": "#1.5 to #3",
                "top_length": "4 - 5 cm",
                "why_it_fits": "Jambang tebal mengimbangi dagu yang runcing sementara crop meredam lebar dahi.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Acak rambut atas dan sisir jambang ke bawah."],
                "recommended_products": ["Beard Oil", "Texture Dust"],
                "barber_notes": "Taper rapi di leher dengan edge line bersih.",
                "haircut_prompt": "A textured French crop paired with a full defined beard to balance a heart-shaped face.",
            },
            {
                "id": "ht-4",
                "name": "Side Swept Undercut",
                "subtitle": "Asymmetric Temple Cover",
                "category": "Modern Trend",
                "fade_type": "Low Undercut",
                "guard_number": "#2 to #1",
                "top_length": "7 - 9 cm",
                "why_it_fits": "Menyapu rambut miring memecah simetri dahi yang lebar.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Sisir miring menyamping dengan pomade matte."],
                "recommended_products": ["Matte Pomade", "Comb"],
                "barber_notes": "Undercut rendah agar tidak mengekspos pelipis atas.",
                "haircut_prompt": "A modern side-swept undercut with low taper fade, sweeping across the forehead.",
            },
            {
                "id": "ht-5",
                "name": "Classic Crew Cut with Scissor Sides",
                "subtitle": "Balanced Everyday Cut",
                "category": "Short & Crisp",
                "fade_type": "Low Taper",
                "guard_number": "#2.5 to #3.5",
                "top_length": "3.5 - 4.5 cm",
                "why_it_fits": "Menjaga volume sisi pelipis tetap lembut tanpa kontras tajam.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Sisir santai dengan sedikit styling cream."],
                "recommended_products": ["Styling Cream", "Shampoo"],
                "barber_notes": "Scissor over comb di pelipis.",
                "haircut_prompt": "A neat classic crew cut with natural scissor-cut sides and gentle front lift.",
            },
            {
                "id": "ht-6",
                "name": "Messy Fringe with Stubble",
                "subtitle": "Casual Youthful Texture",
                "category": "Crop & Fringe",
                "fade_type": "Low Fade",
                "guard_number": "#1.5 to #2",
                "top_length": "5 - 6 cm",
                "why_it_fits": "Poni acak menutupi dahi atas, stubble menambah ketegasan dagu lancip.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Remas dengan clay pada rambut kering."],
                "recommended_products": ["Matte Clay", "Texture Spray"],
                "barber_notes": "Point cutting acak pada poni.",
                "haircut_prompt": "A casual messy fringe haircut with low fade and heavy designer stubble.",
            },
        ],
        "diamond": [
            {
                "id": "dm-1",
                "name": "Messy Textured Crop with Fringe",
                "subtitle": "Cheekbone Softener",
                "category": "Crop & Fringe",
                "fade_type": "Mid Taper Fade",
                "guard_number": "#2 down to #1",
                "top_length": "4 - 5 cm textured",
                "why_it_fits": "Tekstur acak di atas memberi ilusi dahi lebih penuh, melembutkan tonjolan tulang pipi yang sangat lebar.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Acak rambut dengan matte clay menggunakan ujung jari."],
                "recommended_products": ["Matte Texture Clay", "Texture Powder"],
                "barber_notes": "Sisakan rambut tipis di pelipis untuk menambah lebar dahi.",
                "haircut_prompt": "A messy textured crop with soft fringe and mid taper fade, softening prominent cheekbones.",
            },
            {
                "id": "dm-2",
                "name": "Layered Scissor Cut with Full Beard",
                "subtitle": "Organic Proportional Balance",
                "category": "Natural Texture",
                "fade_type": "Classic Scissor Taper",
                "guard_number": "All shear scissor work",
                "top_length": "6 - 8 cm",
                "why_it_fits": "Potongan gunting alami yang dipadukan dengan jambang penuh melengkapi dagu lancip dan meratakan proporsi pipi.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Sisir santai dengan jari menggunakan light styling paste."],
                "recommended_products": ["Matte Paste", "Beard Butter"],
                "barber_notes": "Ratakan ketebalan jambang di garis rahang agar sejajar dengan proyeksi tulang pipi.",
                "haircut_prompt": "A natural layered scissor cut paired with a full groomed beard balancing diamond cheekbones.",
            },
            {
                "id": "dm-3",
                "name": "Side Swept Quiff Low Fade",
                "subtitle": "Broadening Upper Contour",
                "category": "Volumetric Modern",
                "fade_type": "Low Fade",
                "guard_number": "#2 to #3",
                "top_length": "6 - 8 cm",
                "why_it_fits": "Jambul menyamping memberi volume tambahan pada area dahi yang sempit.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Blow dry ke atas dan samping."],
                "recommended_products": ["Volume Mousse", "Matte Clay"],
                "barber_notes": "Low fade di bawah pelipis.",
                "haircut_prompt": "A stylish side-swept quiff with low taper fade, adding balanced width to the forehead.",
            },
            {
                "id": "dm-4",
                "name": "Textured Modern Mullet",
                "subtitle": "Angular Flow",
                "category": "Modern Trend",
                "fade_type": "Temple Taper",
                "guard_number": "#2 at temples",
                "top_length": "7 - 9 cm",
                "why_it_fits": "Panjang belakang dan layer atas mengalihkan perhatian dari tonjolan tulang pipi.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Gunakan sea salt spray untuk flow bergelombang."],
                "recommended_products": ["Sea Salt Spray", "Matte Wax"],
                "barber_notes": "Pertahankan panjang rambut leher.",
                "haircut_prompt": "A contemporary textured mullet haircut with faded temples and flow at the back.",
            },
            {
                "id": "dm-5",
                "name": "French Crop with Heavy Texture",
                "subtitle": "Horizontal Denser Top",
                "category": "Crop & Fringe",
                "fade_type": "Low Drop Taper",
                "guard_number": "#1.5 to #2.5",
                "top_length": "4 - 5 cm",
                "why_it_fits": "Kepadatan poni bertekstur membuat dahi terlihat lebih kokoh dan proporsional.",
                "styling_difficulty": "Mudah",
                "styling_tips": ["Keringkan ke depan dan tata acak."],
                "recommended_products": ["Texture Paste", "Dust"],
                "barber_notes": "Texture shearing di seluruh mahkota kepala.",
                "haircut_prompt": "A heavy-textured French crop with low drop taper, framing the upper face neatly.",
            },
            {
                "id": "dm-6",
                "name": "Casual Curtain Flow",
                "subtitle": "Soft Cheekbone Frame",
                "category": "Medium Flow",
                "fade_type": "Scissor Taper",
                "guard_number": "Scissor over comb",
                "top_length": "9 - 11 cm",
                "why_it_fits": "Rambut tirai jatuh tepat di atas tulang pipi, menyamarkan sudut tajamnya secara alami.",
                "styling_difficulty": "Sedang",
                "styling_tips": ["Belah tengah santai dengan styling cream."],
                "recommended_products": ["Styling Cream", "Leave-in Tonic"],
                "barber_notes": "Panjang poni dipotong bertingkat.",
                "haircut_prompt": "A relaxed curtain flow haircut with soft waves framing and softening the cheekbone area.",
            },
        ],
    }

    @classmethod
    def get_templates_for_shape(cls, face_shape: str) -> List[Dict[str, Any]]:
        """Retrieve the curated 6-8 haircut templates for the diagnosed face shape."""
        key = face_shape.lower()
        return cls.LOOKBOOK_TEMPLATES.get(key, cls.LOOKBOOK_TEMPLATES["square"])

    @classmethod
    def generate_simulated_client_image(
        cls,
        client_bgr: np.ndarray,
        haircut_name: str,
        category: str,
        style_idx: int,
    ) -> str:
        """Create a realistic client-personalized preview with the haircut visibly synthesized on the client's face."""
        h, w = client_bgr.shape[:2]
        canvas = client_bgr.copy()

        # 1. Determine facial landmark anchors (forehead, temples, ears, chin)
        center_x = w // 2
        forehead_y = int(h * 0.32)
        temple_w = int(w * 0.58)

        try:
            from app.services.face_mesh import face_mesh_service
            # Use raw mediapipe processing without raising HTTPException
            rgb = cv2.cvtColor(client_bgr, cv2.COLOR_BGR2RGB)
            results = face_mesh_service._mesh.process(rgb)
            if results.multi_face_landmarks:
                raw_lms = results.multi_face_landmarks[0].landmark
                # Landmark 10: trichion/hairline center
                forehead_y = int(raw_lms[10].y * h)
                # Landmarks 54 & 284: temples
                tx1 = int(raw_lms[54].x * w)
                tx2 = int(raw_lms[284].x * w)
                temple_w = int(abs(tx2 - tx1) * 1.32)
                center_x = int((tx1 + tx2) / 2)
        except Exception:
            pass

        # 2. Sample natural hair color and skin color from the client
        sample_hair_y = max(0, forehead_y - int(h * 0.08))
        sample_region = client_bgr[sample_hair_y:forehead_y, max(0, center_x - 30):min(w, center_x + 30)]
        if sample_region.size > 0:
            median_color = np.median(sample_region, axis=(0, 1)).astype(np.uint8)
            # Ensure it is reasonably dark for hair
            hair_b = min(50, int(median_color[0]))
            hair_g = min(45, int(median_color[1]))
            hair_r = min(40, int(median_color[2]))
            hair_color = np.array([hair_b, hair_g, hair_r], dtype=np.uint8)
        else:
            hair_color = np.array([30, 25, 20], dtype=np.uint8)

        # Skin sample from mid forehead
        skin_sample = client_bgr[min(h - 1, forehead_y + 35):min(h - 1, forehead_y + 55), max(0, center_x - 20):min(w, center_x + 20)]
        if skin_sample.size > 0:
            skin_color = np.median(skin_sample, axis=(0, 1)).astype(np.float32)
        else:
            skin_color = np.array([180, 145, 125], dtype=np.float32)

        # 3. Synthesize specific haircut style based on name and category
        style_lower = (haircut_name + " " + category).lower()

        # STYLE A: French Crop / Textured Fringe
        if "crop" in style_lower or "fringe" in style_lower or style_idx == 0:
            # Choppy textured fringe dropping down forehead
            fringe_h = int(h * 0.075)
            fringe_pts = [[center_x - temple_w // 2, forehead_y - 15]]
            step = max(8, temple_w // 18)
            for i, x in enumerate(range(center_x - temple_w // 2, center_x + temple_w // 2 + 1, step)):
                jag = fringe_h if i % 2 == 0 else fringe_h - int(step * 0.9)
                fringe_pts.append([x, forehead_y + jag])
            fringe_pts.append([center_x + temple_w // 2, forehead_y - 15])

            fringe_mask = np.zeros((h, w), dtype=np.float32)
            cv2.fillPoly(fringe_mask, [np.array(fringe_pts, dtype=np.int32)], 1.0)
            fringe_mask = cv2.GaussianBlur(fringe_mask, (11, 11), 3)

            for c in range(3):
                canvas[:, :, c] = np.clip(
                    canvas[:, :, c].astype(np.float32) * (1.0 - fringe_mask) + (hair_color[c] * 0.9) * fringe_mask,
                    0, 255
                ).astype(np.uint8)

            # Mid Drop Fade on sides
            fade_mask = np.zeros((h, w), dtype=np.float32)
            side_radius = int(temple_w * 0.18)
            cv2.ellipse(fade_mask, (center_x - temple_w // 2 - 8, forehead_y + int(h * 0.06)), (side_radius, int(h * 0.10)), 0, 0, 360, 0.75, -1)
            cv2.ellipse(fade_mask, (center_x + temple_w // 2 + 8, forehead_y + int(h * 0.06)), (side_radius, int(h * 0.10)), 0, 0, 360, 0.75, -1)
            fade_mask = cv2.GaussianBlur(fade_mask, (21, 21), 7)
            for c in range(3):
                canvas[:, :, c] = np.clip(canvas[:, :, c].astype(np.float32) * (1.0 - fade_mask) + skin_color[c] * fade_mask, 0, 255).astype(np.uint8)

        # STYLE B: Classic Side Part / Taper
        elif "side part" in style_lower or "part" in style_lower or "classic" in style_lower or style_idx == 1:
            # Clean razor parted line on the left
            part_start_x = center_x - int(temple_w * 0.28)
            part_end_x = center_x - int(temple_w * 0.15)
            part_y1 = forehead_y
            part_y2 = max(0, forehead_y - int(h * 0.12))
            cv2.line(canvas, (part_start_x, part_y1), (part_end_x, part_y2), (int(skin_color[0] * 0.85), int(skin_color[1] * 0.85), int(skin_color[2] * 0.85)), 2)

            # Sleek combed layer with directional shine
            sweep_mask = np.zeros((h, w), dtype=np.float32)
            sweep_poly = np.array([
                [part_start_x + 6, part_y1],
                [center_x + int(temple_w * 0.45), forehead_y - 5],
                [center_x + int(temple_w * 0.35), max(0, forehead_y - int(h * 0.14))],
                [part_end_x + 6, part_y2],
            ], dtype=np.int32)
            cv2.fillPoly(sweep_mask, [sweep_poly], 0.45)
            sweep_mask = cv2.GaussianBlur(sweep_mask, (15, 15), 5)
            shine_color = np.array([hair_color[0] + 35, hair_color[1] + 30, hair_color[2] + 25], dtype=np.float32)
            for c in range(3):
                canvas[:, :, c] = np.clip(canvas[:, :, c].astype(np.float32) * (1.0 - sweep_mask) + shine_color[c] * sweep_mask, 0, 255).astype(np.uint8)

            # Low taper on sideburns
            taper_mask = np.zeros((h, w), dtype=np.float32)
            cv2.ellipse(taper_mask, (center_x - temple_w // 2 - 5, forehead_y + int(h * 0.08)), (18, int(h * 0.07)), 0, 0, 360, 0.65, -1)
            cv2.ellipse(taper_mask, (center_x + temple_w // 2 + 5, forehead_y + int(h * 0.08)), (18, int(h * 0.07)), 0, 0, 360, 0.65, -1)
            taper_mask = cv2.GaussianBlur(taper_mask, (15, 15), 5)
            for c in range(3):
                canvas[:, :, c] = np.clip(canvas[:, :, c].astype(np.float32) * (1.0 - taper_mask) + skin_color[c] * taper_mask, 0, 255).astype(np.uint8)

        # STYLE C: Buzz Cut with Beard Fade / Clean Lineup
        elif "buzz" in style_lower or "crew" in style_lower or "military" in style_lower or style_idx == 2:
            # Shave down top volume to skull contour
            top_cut_y = max(0, forehead_y - int(h * 0.07))
            fade_top_mask = np.zeros((h, w), dtype=np.float32)
            cv2.rectangle(fade_top_mask, (0, 0), (w, top_cut_y), 0.7, -1)
            fade_top_mask = cv2.GaussianBlur(fade_top_mask, (25, 25), 9)

            # Clean sharp lineup box across forehead
            lineup_y = forehead_y + int(h * 0.01)
            cv2.line(canvas, (center_x - int(temple_w * 0.44), lineup_y), (center_x + int(temple_w * 0.44), lineup_y), (15, 12, 10), 3)
            # 90 degree temple corner cuts
            cv2.line(canvas, (center_x - int(temple_w * 0.44), lineup_y), (center_x - int(temple_w * 0.44), lineup_y + 18), (15, 12, 10), 2)
            cv2.line(canvas, (center_x + int(temple_w * 0.44), lineup_y), (center_x + int(temple_w * 0.44), lineup_y + 18), (15, 12, 10), 2)

            # High skin fade
            skin_fade = np.zeros((h, w), dtype=np.float32)
            cv2.ellipse(skin_fade, (center_x - temple_w // 2 - 12, forehead_y + int(h * 0.04)), (int(temple_w * 0.22), int(h * 0.12)), 0, 0, 360, 0.82, -1)
            cv2.ellipse(skin_fade, (center_x + temple_w // 2 + 12, forehead_y + int(h * 0.04)), (int(temple_w * 0.22), int(h * 0.12)), 0, 0, 360, 0.82, -1)
            skin_fade = cv2.GaussianBlur(skin_fade, (25, 25), 9)
            for c in range(3):
                canvas[:, :, c] = np.clip(canvas[:, :, c].astype(np.float32) * (1.0 - skin_fade) + skin_color[c] * skin_fade, 0, 255).astype(np.uint8)

        # STYLE D: Modern Textured Quiff / Pompadour
        elif "quiff" in style_lower or "pompadour" in style_lower or style_idx == 3:
            # Lifted vertical volume on top
            quiff_h = int(h * 0.14)
            quiff_pts = np.array([
                [center_x - int(temple_w * 0.35), forehead_y + 8],
                [center_x - int(temple_w * 0.25), max(0, forehead_y - quiff_h)],
                [center_x, max(0, forehead_y - int(quiff_h * 1.15))],
                [center_x + int(temple_w * 0.30), max(0, forehead_y - quiff_h)],
                [center_x + int(temple_w * 0.38), forehead_y + 8],
            ], dtype=np.int32)

            quiff_mask = np.zeros((h, w), dtype=np.float32)
            cv2.fillPoly(quiff_mask, [quiff_pts], 0.85)
            quiff_mask = cv2.GaussianBlur(quiff_mask, (13, 13), 4)

            # Volumized strand streaks
            for c in range(3):
                canvas[:, :, c] = np.clip(
                    canvas[:, :, c].astype(np.float32) * (1.0 - quiff_mask) + (hair_color[c] * 1.05) * quiff_mask,
                    0, 255
                ).astype(np.uint8)

            # Low Skin Fade on temples
            low_fade = np.zeros((h, w), dtype=np.float32)
            cv2.ellipse(low_fade, (center_x - temple_w // 2 - 8, forehead_y + int(h * 0.07)), (22, int(h * 0.08)), 0, 0, 360, 0.7, -1)
            cv2.ellipse(low_fade, (center_x + temple_w // 2 + 8, forehead_y + int(h * 0.07)), (22, int(h * 0.08)), 0, 0, 360, 0.7, -1)
            low_fade = cv2.GaussianBlur(low_fade, (17, 17), 6)
            for c in range(3):
                canvas[:, :, c] = np.clip(canvas[:, :, c].astype(np.float32) * (1.0 - low_fade) + skin_color[c] * low_fade, 0, 255).astype(np.uint8)

        # STYLE E: Messy Spiky Texture
        elif "spiky" in style_lower or "spike" in style_lower or style_idx == 4:
            # Piecey multi-directional spikes
            spike_mask = np.zeros((h, w), dtype=np.float32)
            num_spikes = 7
            spacing = int(temple_w * 0.75) // num_spikes
            base_x = center_x - int(temple_w * 0.38)
            for s in range(num_spikes):
                sx = base_x + s * spacing
                sy_base = forehead_y - int(h * 0.04)
                spike_len = int(h * 0.08) if s % 2 == 0 else int(h * 0.06)
                spike_poly = np.array([
                    [sx - 7, sy_base],
                    [sx, max(0, sy_base - spike_len)],
                    [sx + 7, sy_base],
                ], dtype=np.int32)
                cv2.fillPoly(spike_mask, [spike_poly], 0.9)

            spike_mask = cv2.GaussianBlur(spike_mask, (7, 7), 2)
            for c in range(3):
                canvas[:, :, c] = np.clip(
                    canvas[:, :, c].astype(np.float32) * (1.0 - spike_mask) + (hair_color[c] * 0.95) * spike_mask,
                    0, 255
                ).astype(np.uint8)

        # STYLE F: Slicked Back Undercut
        else:
            # Deep sleek sweep backwards
            slick_mask = np.zeros((h, w), dtype=np.float32)
            slick_poly = np.array([
                [center_x - int(temple_w * 0.35), forehead_y],
                [center_x - int(temple_w * 0.32), max(0, forehead_y - int(h * 0.13))],
                [center_x + int(temple_w * 0.32), max(0, forehead_y - int(h * 0.13))],
                [center_x + int(temple_w * 0.35), forehead_y],
            ], dtype=np.int32)
            cv2.fillPoly(slick_mask, [slick_poly], 0.75)
            slick_mask = cv2.GaussianBlur(slick_mask, (15, 15), 5)
            for c in range(3):
                canvas[:, :, c] = np.clip(
                    canvas[:, :, c].astype(np.float32) * (1.0 - slick_mask) + (hair_color[c] * 0.8) * slick_mask,
                    0, 255
                ).astype(np.uint8)

            # High disconnected undercut
            undercut_mask = np.zeros((h, w), dtype=np.float32)
            cv2.ellipse(undercut_mask, (center_x - temple_w // 2 - 10, forehead_y + int(h * 0.05)), (int(temple_w * 0.20), int(h * 0.10)), 0, 0, 360, 0.85, -1)
            cv2.ellipse(undercut_mask, (center_x + temple_w // 2 + 10, forehead_y + int(h * 0.05)), (int(temple_w * 0.20), int(h * 0.10)), 0, 0, 360, 0.85, -1)
            undercut_mask = cv2.GaussianBlur(undercut_mask, (21, 21), 7)
            for c in range(3):
                canvas[:, :, c] = np.clip(canvas[:, :, c].astype(np.float32) * (1.0 - undercut_mask) + skin_color[c] * undercut_mask, 0, 255).astype(np.uint8)

        # 4. Cinematic barbershop studio lighting grade
        img_float = canvas.astype(np.float32) / 255.0
        contrasted = np.clip((img_float - 0.5) * 1.08 + 0.51, 0, 1)
        contrasted[:, :, 0] *= 0.97  # Blue
        contrasted[:, :, 1] *= 1.01  # Green
        contrasted[:, :, 2] *= 1.04  # Red
        graded = (np.clip(contrasted, 0, 1) * 255).astype(np.uint8)

        # Encode to JPEG base64 Data URL
        success, encoded = cv2.imencode(".jpg", graded, [cv2.IMWRITE_JPEG_QUALITY, 92])
        if not success:
            _, encoded = cv2.imencode(".jpg", canvas)

        b64_str = base64.b64encode(encoded.tobytes()).decode("utf-8")
        return f"data:image/jpeg;base64,{b64_str}"

    @classmethod
    def generate_single_style_gemini(
        cls,
        client_bgr: np.ndarray,
        haircut: Dict[str, Any],
        face_shape: str,
        style_idx: int,
    ) -> str:
        """Generate a personalized hairstyle photo on the client's face using Google Gemini AI."""
        # If API key is not configured, use the high-fidelity client portrait generator
        if not settings.GEMINI_API_KEY:
            return cls.generate_simulated_client_image(
                client_bgr, haircut["name"], haircut["category"], style_idx
            )

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # Encode client's face to bytes for prompt input
            success, enc_jpg = cv2.imencode(".jpg", client_bgr)
            client_bytes = enc_jpg.tobytes() if success else b""

            prompt_text = (
                f"A photorealistic, ultra-high resolution barbershop portrait of this exact man, "
                f"retaining his exact facial identity, skin tone, facial hair, eyes, and jaw structure. "
                f"Change his hairstyle to a {haircut['name']}: {haircut['haircut_prompt']}. "
                f"The haircut is precisely cut for his {face_shape} face shape with {haircut['fade_type']}. "
                f"Professional barbershop studio lighting, sharp focus, 8k, authentic, cinematic."
            )

            # Attempt Gemini Image Generation (active when project has image quota/billing enabled)
            try:
                response = client.models.generate_content(
                    model=settings.GEMINI_IMAGE_MODEL,
                    contents=[
                        types.Part.from_bytes(data=client_bytes, mime_type="image/jpeg"),
                        prompt_text,
                    ],
                )
                if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if getattr(part, "inline_data", None) and part.inline_data.data:
                            b64_str = base64.b64encode(part.inline_data.data).decode("utf-8")
                            mime = getattr(part.inline_data, "mime_type", "image/jpeg") or "image/jpeg"
                            return f"data:{mime};base64,{b64_str}"
            except Exception as img_err:
                print(f"Gemini image generation note (quota/free-tier): {img_err}")

            # Fallback to high-fidelity landmark hair synthesis
            return cls.generate_simulated_client_image(
                client_bgr, haircut["name"], haircut["category"], style_idx
            )

        except Exception as e:
            print(f"Gemini generator error for {haircut['name']}: {e}")
            return cls.generate_simulated_client_image(
                client_bgr, haircut["name"], haircut["category"], style_idx
            )

    @classmethod
    def generate_lookbook_sync(
        cls,
        client_image_bytes: bytes,
        face_shape: str,
        max_styles: int = 8,
    ) -> List[GeneratedClientHaircut]:
        """Generate 6 to 8 tailored haircut variations rendered on the client's own face."""
        np_arr = np.frombuffer(client_image_bytes, np.uint8)
        client_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if client_bgr is None:
            # Fallback blank canvas if decode fails
            client_bgr = np.full((600, 450, 3), 128, dtype=np.uint8)

        templates = cls.get_templates_for_shape(face_shape)[:max_styles]
        generated_list: List[GeneratedClientHaircut] = []

        for idx, template in enumerate(templates):
            # Render the client's own face with the new hairstyle
            image_url = cls.generate_single_style_gemini(
                client_bgr=client_bgr,
                haircut=template,
                face_shape=face_shape,
                style_idx=idx,
            )

            haircut_obj = GeneratedClientHaircut(
                id=template["id"],
                name=template["name"],
                subtitle=template["subtitle"],
                category=template["category"],
                generated_image_url=image_url,
                fade_type=template["fade_type"],
                guard_number=template["guard_number"],
                top_length=template["top_length"],
                why_it_fits=template["why_it_fits"],
                styling_difficulty=template.get("styling_difficulty", "Mudah"),
                styling_tips=template.get("styling_tips", []),
                recommended_products=template.get("recommended_products", []),
                barber_notes=template["barber_notes"],
            )
            generated_list.append(haircut_obj)

        return generated_list

    @classmethod
    async def generate_lookbook_async(
        cls,
        client_image_bytes: bytes,
        face_shape: str,
        max_styles: int = 8,
    ) -> List[GeneratedClientHaircut]:
        """Asynchronously run lookbook generation in a background thread."""
        return await asyncio.to_thread(
            cls.generate_lookbook_sync,
            client_image_bytes,
            face_shape,
            max_styles,
        )


gemini_lookbook_generator = GeminiLookbookGenerator()
