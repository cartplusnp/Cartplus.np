export interface ProvinceData {
  id: string;
  name: string;
  districts: string[];
}

export const NEPAL_PROVINCES: ProvinceData[] = [
  {
    id: 'p3',
    name: 'Bagmati Province',
    districts: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Kavrepalanchok', 'Makwanpur', 'Dhading', 'Nuwakot', 'Sindhupalchok']
  },
  {
    id: 'p4',
    name: 'Gandaki Province',
    districts: ['Kaski (Pokhara)', 'Tanahun', 'Syangja', 'Gorkha', 'Nawalpur', 'Lamjung', 'Parbat', 'Baglung']
  },
  {
    id: 'p1',
    name: 'Koshi Province',
    districts: ['Morang (Biratnagar)', 'Sunsari (Dharan/Itahari)', 'Jhapa', 'Ilam', 'Udayapur', 'Dhankuta']
  },
  {
    id: 'p2',
    name: 'Madhesh Province',
    districts: ['Parsa (Birgunj)', 'Dhanusha (Janakpur)', 'Bara', 'Siraha', 'Saptari', 'Sarlahi', 'Mahottari', 'Rautahat']
  },
  {
    id: 'p5',
    name: 'Lumbini Province',
    districts: ['Rupandehi (Butwal/Bhairahawa)', 'Banke (Nepalgunj)', 'Dang', 'Kapilvastu', 'Palpa', 'Bardiya', 'Nawalparasi West']
  },
  {
    id: 'p6',
    name: 'Karnali Province',
    districts: ['Surkhet (Birendranagar)', 'Dailekh', 'Jumla', 'Salyan', 'Rukum West']
  },
  {
    id: 'p7',
    name: 'Sudurpashchim Province',
    districts: ['Kailali (Dhangadhi)', 'Kanchanpur (Mahendranagar)', 'Dadeldhura', 'Doti', 'Achham']
  }
];

export function validateNepalPhone(phone: string): { isValid: boolean; error?: string } {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  // Supports formats: 98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX, or +97798XXXXXXXX
  const regex = /^(?:(?:\+?977)?)?(9[678]\d{8})$/;
  const match = cleaned.match(regex);
  if (!match) {
    return {
      isValid: false,
      error: 'Enter a valid 10-digit Nepal mobile number starting with 98, 97, or 96 (e.g. 9841234567).'
    };
  }
  return { isValid: true };
}

export const POPULAR_NEPAL_BANKS: string[] = [
  'NIC Asia Bank',
  'Nabil Bank',
  'Global IME Bank',
  'Himalayan Bank',
  'Everest Bank',
  'Nepal Investment Mega Bank',
  'Sanima Bank',
  'Prabhu Bank',
  'Siddhartha Bank',
  'Kumari Bank',
  'Prime Commercial Bank',
  'Rastriya Banijya Bank',
  'Standard Chartered Bank Nepal',
  'NMB Bank',
  'Machhapuchhre Bank',
  'Citizens Bank International',
  'Laxmi Sunrise Bank',
  'Agriculture Development Bank',
];

