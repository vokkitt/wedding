
export const weddingData = {
  couple: {
    bride: 'Ái Duyên',
    groom: 'Thanh Nhân',
    shortNames: 'Ái Duyên  &  Thanh Nhân',
    monogram: 'D & N',
  },

  date: {
    iso: '2027-01-01T09:00:00+07:00',
    display: '01 . 01 . 2027',
    weekday: 'Thứ Sáu',
    lunar: 'Ngày 24 tháng 11 năm Bính Ngọ',
  },

  // Ảnh gốc trong public/images; ảnh gốc được giữ nguyên.
  heroImage: '/images/DAG01879.jpg',
  closingImage: '/images/DAG03158.jpg',

  // Sử dụng link bản đồ riêng cho từng địa điểm
  mapEmbedUrl: '',
  mapUrl: '',

  musicUrl: '/music/Lara_Del_Rey_-_Young_And_Beautiful_(mp3.pm).mp3',

  venues: [
    {
      label: 'LỄ VU QUY',
      title: 'Tư gia nhà gái',
      time: '09:00 · Thứ Năm, 31.12.2026',
      address: 'Ấp Chợ Bưng, Long Hưng, Đồng Tháp, Việt Nam',
      mapUrl: 'https://maps.app.goo.gl/RKpkpZU125NVmt4n7?g_st=ic',
    },
    {
      label: 'LỄ THÀNH HÔN',
      title: 'Tư gia nhà trai',
      time: '09:00 · Thứ Sáu, 01.01.2027',
      address: 'Ấp Long Thới, Châu Thành, Đồng Tháp, Việt Nam',
      mapUrl: 'https://maps.app.goo.gl/A7XrESN1y7JGLfNNA?g_st=ic',
    },
    {
      label: 'TIỆC CƯỚI',
      title: 'Tư gia nhà trai',
      time: '17:00 · Thứ Sáu, 01.01.2027',
      address: 'Ấp Long Thới, Châu Thành, Đồng Tháp, Việt Nam',
      mapUrl: 'https://maps.app.goo.gl/A7XrESN1y7JGLfNNA?g_st=ic',
    },
  ],

  familyAddresses: [
    {
      label: 'NHÀ GÁI',
      address: 'Ấp Chợ Bưng, Long Hưng, Đồng Tháp, Việt Nam',
      mapUrl: 'https://maps.app.goo.gl/RKpkpZU125NVmt4n7?g_st=ic',
    },
    {
      label: 'NHÀ TRAI',
      address: 'Ấp Long Thới, Châu Thành, Đồng Tháp, Việt Nam',
      mapUrl: 'https://maps.app.goo.gl/A7XrESN1y7JGLfNNA?g_st=ic',
    },
  ],

  // Chưa có mốc thời gian và nội dung chuyện tình chính thức
  story: [] as { title: string; date: string; image: string; alt: string; description: string }[],

  schedule: [
    {
      time: '09:00 · 31.12.2026',
      title: 'Lễ Vu Quy',
      detail: 'Nghi thức tại tư gia nhà gái',
    },
    {
      time: '09:00 · 01.01.2027',
      title: 'Lễ Thành Hôn',
      detail: 'Nghi thức tại tư gia nhà trai',
    },
    {
      time: '17:00 · 01.01.2027',
      title: 'Tiệc Cưới',
      detail: 'Tiệc mừng ngày vui tại tư gia nhà trai',
    },
  ],

  gifts: [
    {
      side: 'CÔ DÂU',
      name: 'NGUYEN NGOC AI DUYEN',
      bank: 'Vietcombank',
      account: '0441000781272',
      qr: '/qr/codau.png',
      qrFileName: 'codau.png',
    },
    {
      side: 'CHÚ RỂ',
      name: 'NGO THANH NHAN',
      bank: 'SHB',
      account: '0567094694',
      qr: '/qr/chure.png',
      qrFileName: 'chure.png',
    },
  ] as { side: string; name: string; bank: string; account: string; qr: string; qrFileName: string }[],

  // Chưa có lời chúc thật từ khách mời
  sampleWishes: [] as { name: string; message: string; date: string }[],
} as const;
