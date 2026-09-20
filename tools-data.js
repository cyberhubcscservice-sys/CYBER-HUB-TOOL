/**
 * CYBER HUB - Centralized Tool Registry
 * Contains 50+ Cyber Cafe tools across PDF, Image, Text, Calculators, Documents, Internet, Business, and AI.
 */

window.TOOL_REGISTRY = [
  // Popular / High-frequency Tools
  {
    id: 'passport-photo',
    name: 'Passport Photo Maker',
    category: 'image',
    icon: 'fa-id-badge',
    badge: 'Popular',
    desc: 'Create standard 3.5×4.5cm or 2×2 inch photos tiled on 4×6 or A4 sheets with cutting borders.',
    tags: ['photo', 'passport', 'visa', 'a4', 'copies', 'sarkari'],
    keywords: ['passport photo', 'passport size photo', 'photo banana', '35x45', '2x2', 'photo sheet', 'chhota photo']
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    category: 'pdf',
    icon: 'fa-file-zipper',
    badge: 'Popular',
    desc: 'Reduce PDF file size quickly without losing text readability for online portal uploads.',
    tags: ['pdf', 'compress', 'reduce size', 'kb', 'mb'],
    keywords: ['pdf compress', 'pdf chhota', 'pdf size kam', 'compress pdf', 'reduce pdf', 'mb to kb']
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'internet',
    icon: 'fa-qrcode',
    badge: 'Popular',
    desc: 'Generate custom QR codes for UPI, WhatsApp, Wi-Fi, URLs, and phone calls with instant download.',
    tags: ['qr', 'code', 'barcode', 'upi', 'wifi', 'whatsapp'],
    keywords: ['qr code', 'qr banana', 'upi qr', 'wifi qr', 'whatsapp qr', 'qrcode generator']
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    category: 'calculator',
    icon: 'fa-cake-candles',
    badge: 'Popular',
    desc: 'Calculate exact age in Years, Months, and Days as on any cut-off date for Sarkari forms.',
    tags: ['age', 'dob', 'date of birth', 'sarkari form', 'years'],
    keywords: ['age calculator', 'umar', 'aayu', 'dob', 'kitne saal ka', 'date of birth']
  },
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    category: 'calculator',
    icon: 'fa-calculator',
    badge: 'Popular',
    desc: 'Calculate monthly loan EMI, total interest payable, and repayment schedule with visual chart.',
    tags: ['emi', 'loan', 'interest', 'monthly kist', 'bank'],
    keywords: ['emi calculator', 'loan', 'kist', 'byaj', 'home loan', 'bike loan', 'car loan']
  },
  {
    id: 'resume-maker',
    name: 'Resume Builder',
    category: 'documents',
    icon: 'fa-file-invoice',
    badge: 'Popular',
    desc: 'Create job-ready professional CVs with live preview, photo, education, and 1-click print.',
    tags: ['resume', 'cv', 'biodata', 'job', 'naukri'],
    keywords: ['resume maker', 'cv builder', 'biodata', 'naukri resume', 'job cv']
  },

  // PDF Tools (12+)
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    category: 'pdf',
    icon: 'fa-object-group',
    desc: 'Combine multiple PDF documents into a single organized file in your chosen order.',
    tags: ['pdf', 'merge', 'combine', 'join'],
    keywords: ['pdf merge', 'pdf jodna', 'combine pdf', 'join pdf']
  },
  {
    id: 'pdf-split',
    name: 'Split & Extract PDF',
    category: 'pdf',
    icon: 'fa-scissors',
    desc: 'Separate PDF pages or extract a specific range of pages into a new clean document.',
    tags: ['pdf', 'split', 'extract', 'pages'],
    keywords: ['pdf split', 'pdf alag karna', 'extract pages', 'split pdf']
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG / PNG',
    category: 'pdf',
    icon: 'fa-file-image',
    desc: 'Convert PDF pages into high-resolution JPG or PNG images directly in your browser.',
    tags: ['pdf', 'jpg', 'png', 'convert', 'image'],
    keywords: ['pdf to jpg', 'pdf to image', 'pdf photo', 'convert pdf to image']
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF Converter',
    category: 'pdf',
    icon: 'fa-images',
    desc: 'Convert single or multiple scanned images into a neat multi-page PDF document.',
    tags: ['jpg', 'png', 'pdf', 'converter', 'scan'],
    keywords: ['jpg to pdf', 'image to pdf', 'photo se pdf', 'picture to pdf']
  },
  {
    id: 'pdf-rotate',
    name: 'Rotate PDF Pages',
    category: 'pdf',
    icon: 'fa-rotate',
    desc: 'Fix upside-down or sideways scanned documents by rotating 90°, 180°, or 270°.',
    tags: ['pdf', 'rotate', 'orientation', 'scan'],
    keywords: ['rotate pdf', 'pdf ghumana', 'sidha karna', 'orientation']
  },
  {
    id: 'pdf-watermark',
    name: 'PDF Watermark',
    category: 'pdf',
    icon: 'fa-stamp',
    desc: 'Add custom security text watermarks (e.g. CYBER HUB, OFFICIAL, COPY) across all pages.',
    tags: ['pdf', 'watermark', 'stamp', 'security'],
    keywords: ['watermark', 'stamp', 'pdf watermark', 'mohar']
  },
  {
    id: 'pdf-password',
    name: 'PDF Security & Password',
    category: 'pdf',
    icon: 'fa-lock',
    desc: 'Add password protection or check permissions for sensitive customer certificates.',
    tags: ['pdf', 'password', 'protect', 'lock'],
    keywords: ['pdf password', 'lock pdf', 'protect pdf']
  },
  {
    id: 'pdf-unlock',
    name: 'PDF Unlock & Decrypt',
    category: 'pdf',
    icon: 'fa-unlock',
    desc: 'Remove owner passwords from known PDFs (e.g. Aadhaar, e-PAN, bank statements).',
    tags: ['pdf', 'unlock', 'decrypt', 'aadhaar', 'pan'],
    keywords: ['unlock pdf', 'aadhaar password hataye', 'remove password']
  },
  {
    id: 'pdf-page-number',
    name: 'Add Page Numbers',
    category: 'pdf',
    icon: 'fa-list-ol',
    desc: 'Insert custom page numbers (Bottom, Center, Header) into official multi-page reports.',
    tags: ['pdf', 'page numbers', 'header', 'footer'],
    keywords: ['page number', 'pdf number']
  },
  {
    id: 'pdf-metadata-cleaner',
    name: 'PDF Info & Metadata',
    category: 'pdf',
    icon: 'fa-circle-info',
    desc: 'View document page counts, creator, author, paper dimensions and properties.',
    tags: ['pdf', 'metadata', 'info', 'properties'],
    keywords: ['pdf info', 'metadata', 'details']
  },

  // Image Tools (12+)
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    category: 'image',
    icon: 'fa-compress',
    desc: 'Compress JPG, PNG, and WebP photos to exact target sizes (e.g., under 50KB or 20KB for portals).',
    tags: ['image', 'compress', 'kb', 'sarkari form', 'ssc'],
    keywords: ['image compress', 'photo chhota', 'kb kam karna', 'reduce image size', 'ssc photo']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    category: 'image',
    icon: 'fa-up-right-and-down-left-from-center',
    desc: 'Change image dimensions in Pixels, Centimeters, or Inches with 300 DPI support.',
    tags: ['image', 'resize', 'dimension', 'pixel', 'cm'],
    keywords: ['resize image', 'photo size badalna', 'dimensions', 'cm', 'pixels']
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    category: 'image',
    icon: 'fa-crop-simple',
    desc: 'Crop photos with popular aspect ratios (Square 1:1, 3:4 portrait, 16:9 banner).',
    tags: ['crop', 'cut', 'photo', 'ratio'],
    keywords: ['image cropper', 'photo katna', 'crop photo']
  },
  {
    id: 'signature-resizer',
    name: 'Signature Resizer (Govt Exams)',
    category: 'image',
    icon: 'fa-signature',
    badge: 'Cyber Special',
    desc: 'Resize signature scans to 140×60px, 10-20KB with contrast boost for SSC, BPSC & UPSC.',
    tags: ['signature', 'dastakhat', 'ssc', 'upsc', 'exam'],
    keywords: ['signature resize', 'dastakhat', 'hastakshar', 'signature 20kb', 'ssc signature']
  },
  {
    id: 'photo-signature-joiner',
    name: 'Photo + Signature Combiner',
    category: 'image',
    icon: 'fa-layer-group',
    desc: 'Combine candidate photograph with signature on bottom into a single uploadable file.',
    tags: ['photo', 'signature', 'combine', 'railway', 'bpsc'],
    keywords: ['photo signature join', 'photo dastakhat ek sath', 'combine photo and signature']
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    category: 'image',
    icon: 'fa-arrow-right-arrow-left',
    desc: 'Convert JPEG/JPG images to lossless PNG format with zero quality degradation.',
    tags: ['jpg', 'png', 'convert', 'format'],
    keywords: ['jpg to png', 'convert format']
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    category: 'image',
    icon: 'fa-right-left',
    desc: 'Convert transparent or heavy PNG files to lightweight standard JPG files.',
    tags: ['png', 'jpg', 'convert'],
    keywords: ['png to jpg', 'convert format']
  },
  {
    id: 'webp-converter',
    name: 'WebP Converter',
    category: 'image',
    icon: 'fa-file-export',
    desc: 'Convert modern WebP images from web downloads into universally accepted JPG or PNG.',
    tags: ['webp', 'convert', 'jpg', 'png'],
    keywords: ['webp to jpg', 'webp convert']
  },
  {
    id: 'photo-enhancer',
    name: 'Doc Contrast & Clean Up',
    category: 'image',
    icon: 'fa-wand-magic-sparkles',
    desc: 'Enhance blurry camera scans of ID cards, marksheets, and receipts for crisp printing.',
    tags: ['enhance', 'contrast', 'document', 'black white', 'scan'],
    keywords: ['clean scan', 'document clean', 'saaf print', 'enhance document']
  },

  // Calculators (10+)
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    category: 'calculator',
    icon: 'fa-percent',
    desc: 'Calculate GST amounts (3%, 5%, 12%, 18%, 28%) with Inclusive or Exclusive tax breakdown.',
    tags: ['gst', 'tax', 'inclusive', 'exclusive', 'cgst', 'sgst'],
    keywords: ['gst calculator', 'gst kitna', 'tax calculate', 'cgst sgst']
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    category: 'calculator',
    icon: 'fa-chart-pie',
    desc: 'Calculate percent of a number, percentage change, and marks percentage instantly.',
    tags: ['percent', 'math', 'marks', 'exam'],
    keywords: ['percentage calculator', 'pratishat', 'marks percentage']
  },
  {
    id: 'cgpa-calculator',
    name: 'CGPA to Percentage',
    category: 'calculator',
    icon: 'fa-graduation-cap',
    desc: 'Convert CBSE / University CGPA and GPA into accurate percentage for college admissions.',
    tags: ['cgpa', 'gpa', 'cbse', 'percentage', 'marksheet'],
    keywords: ['cgpa to percentage', 'gpa calculator', 'cbse cgpa', 'cgpa 9.5']
  },
  {
    id: 'bmi-calculator',
    name: 'BMI Health Calculator',
    category: 'calculator',
    icon: 'fa-heart-pulse',
    desc: 'Check Body Mass Index (BMI) and physical fitness eligibility for police and defense jobs.',
    tags: ['bmi', 'weight', 'height', 'police exam', 'fitness'],
    keywords: ['bmi calculator', 'body mass index', 'vajan', 'police physical']
  },
  {
    id: 'interest-calculator',
    name: 'Simple & Compound Interest',
    category: 'calculator',
    icon: 'fa-coins',
    desc: 'Compute simple interest, monthly compounding, and total payout for village & bank loans.',
    tags: ['interest', 'simple interest', 'compound interest', 'byaj', 'khata'],
    keywords: ['byaj calculator', 'interest calculator', 'chakravriddhi byaj']
  },
  {
    id: 'discount-calculator',
    name: 'Discount & Offer Calc',
    category: 'calculator',
    icon: 'fa-tags',
    desc: 'Find out final payable price after applying percentage discounts and cashback.',
    tags: ['discount', 'shopping', 'offer', 'chhoot'],
    keywords: ['discount calculator', 'chhoot', 'kitna bacha']
  },
  {
    id: 'bihar-land-converter',
    name: 'Bihar Land & Area Units',
    category: 'calculator',
    icon: 'fa-map-location-dot',
    badge: 'Bihar Special',
    desc: 'Convert Sq. Ft., Sq. Meter, Gaj, Decimal, Dhur, Katha, and Bigha for Sikti/Araria land records.',
    tags: ['land', 'bigha', 'katha', 'dhur', 'decimal', 'gaj', 'bihar'],
    keywords: ['bigha', 'katha', 'dhur', 'decimal to sq ft', 'zameen napna', 'land converter']
  },
  {
    id: 'date-difference',
    name: 'Date Difference Calculator',
    category: 'calculator',
    icon: 'fa-calendar-days',
    desc: 'Calculate exact number of days, weeks, and workdays between two arbitrary dates.',
    tags: ['date', 'days', 'calendar', 'duration'],
    keywords: ['date difference', 'din kitne hue', 'days between']
  },

  // Document Tools
  {
    id: 'application-maker',
    name: 'Sarkari Application Maker',
    category: 'documents',
    icon: 'fa-pen-to-square',
    badge: 'Popular',
    desc: 'Instant formatted Hindi/English applications for Banks (ATM, Mobile), Leave, TC, and Police.',
    tags: ['application', 'patra', 'bank', 'school', 'leave', 'hindi'],
    keywords: ['application maker', 'patra lekhan', 'chhutti ke liye', 'bank application', 'atm application']
  },
  {
    id: 'id-card-generator',
    name: 'Student / Employee ID Card',
    category: 'documents',
    icon: 'fa-address-card',
    desc: 'Quickly design and print laminated school student, staff, or coaching center ID badges.',
    tags: ['id card', 'student id', 'coaching', 'badge'],
    keywords: ['id card', 'student card', 'identity card']
  },
  {
    id: 'biodata-marriage',
    name: 'Marriage Biodata Formatter',
    category: 'documents',
    icon: 'fa-heart',
    desc: 'Clean traditional Hindu / Muslim marriage matrimonial biodata template ready to print.',
    tags: ['biodata', 'marriage', 'shaadi', 'rishta'],
    keywords: ['biodata marriage', 'shaadi biodata', 'rishta biodata']
  },

  // Text Tools
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    category: 'text',
    icon: 'fa-arrow-down-1-9',
    desc: 'Count words, characters, sentences, paragraphs, and reading time for application letters.',
    tags: ['word count', 'character count', 'length'],
    keywords: ['word counter', 'character count', 'kitne shabd']
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    category: 'text',
    icon: 'fa-font',
    desc: 'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, and Capitalize Each Word.',
    tags: ['case', 'uppercase', 'lowercase', 'title case', 'capital'],
    keywords: ['case converter', 'capital letter', 'small letter', 'title case']
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner & Deduplicator',
    category: 'text',
    icon: 'fa-broom',
    desc: 'Remove extra spaces, empty lines, duplicate rows, and sort names alphabetically (A-Z).',
    tags: ['clean', 'spaces', 'duplicates', 'sort'],
    keywords: ['text cleaner', 'remove spaces', 'duplicate remover']
  },
  {
    id: 'hindi-typing-helper',
    name: 'English to Hindi Transliteration',
    category: 'text',
    icon: 'fa-language',
    desc: 'Type easily in Roman English and get natural Hindi text (e.g. "mera naam" -> "मेरा नाम").',
    tags: ['hindi', 'typing', 'transliteration', 'unicode'],
    keywords: ['hindi typing', 'english to hindi', 'roman to devanagari']
  },

  // Business & Cyber Cafe OS
  {
    id: 'customer-registry',
    name: 'Customer Registry (Khata)',
    category: 'business',
    icon: 'fa-users',
    badge: 'Admin',
    desc: 'Track customer service orders, pending Aadhaar/PAN status, contact numbers, and payments.',
    tags: ['customer', 'khata', 'register', 'orders', 'pending'],
    keywords: ['customer khata', 'register', 'grahak khata', 'customer management']
  },
  {
    id: 'income-expense',
    name: 'Income & Expense Tracker',
    category: 'business',
    icon: 'fa-sack-dollar',
    badge: 'Admin',
    desc: 'Daily Cyber Cafe ledger: calculate today\'s income, paper/ink expenses, and net profit.',
    tags: ['income', 'expense', 'profit', 'hisab', 'ledger'],
    keywords: ['income expense', 'hisab kitab', 'daily profit', 'ledger']
  },
  {
    id: 'invoice-receipt',
    name: 'Cash Receipt / Invoice Maker',
    category: 'business',
    icon: 'fa-receipt',
    badge: 'Admin',
    desc: 'Generate branded, printable CYBER HUB billing receipts with custom services and QR payment.',
    tags: ['receipt', 'invoice', 'bill', 'rasid', 'billing'],
    keywords: ['receipt maker', 'invoice', 'bill banana', 'rasid']
  },
  {
    id: 'print-calculator',
    name: 'Cyber Print Rate Calculator',
    category: 'business',
    icon: 'fa-print',
    desc: 'Quick bill calculator for B&W, Color, Photo printing, Lamination, and Form filling.',
    tags: ['print', 'rate', 'xerox', 'lamination', 'cost'],
    keywords: ['print calculator', 'print cost', 'chhapne ka kharcha', 'rate list']
  }
];
