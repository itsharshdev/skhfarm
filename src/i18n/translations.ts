export type Language = 'en' | 'hi' | 'mr';

export interface TranslationDictionary {
  appName: string;
  appTagline: string;
  superPsBadge: string;
  navTrace: string;
  navScan: string;
  navBatches: string;
  navStakeholders: string;
  navLogin: string;
  navLogout: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroScanBtn: string;
  heroManualBtn: string;
  heroStakeholderBtn: string;
  traceScoreLabel: string;
  traceScoreSub: string;
  safeNowTitle: string;
  safeNowSub: string;
  whereBeenTitle: string;
  whereBeenSub: string;
  storageUnitLabel: string;
  tempLabel: string;
  humidityLabel: string;
  powerStatusLabel: string;
  solarStatusLabel: string;
  safeRangeLabel: string;
  tabTimeline: string;
  tabLineage: string;
  tabMap: string;
  tabScore: string;
  tabCertificates: string;
  tabFeedback: string;
  tabAIInsights: string;
  tabRiskCenter: string;
  originLabel: string;
  currentOwnerLabel: string;
  currentLocationLabel: string;
  harvestDateLabel: string;
  expiryDateLabel: string;
  verifiedHandoffs: string;
  traceCompleteness: string;
  searchPlaceholder: string;
  demoBadge: string;
  protoScoreNotice: string;
  coldChainNotice: string;
  quickSampleBatches: string;
  viewDetails: string;
  feedbackCTA: string;
  offlineBanner: string;
  roleFarmer: string;
  roleMandi: string;
  roleTransporter: string;
  roleWarehouse: string;
  roleProcessor: string;
  roleRetailer: string;
  roleAuthority: string;
  roleAdmin: string;
  roleCustom: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'FARM TRACER',
    appTagline: 'End-to-End Cold-Chain & Food Traceability Platform',
    superPsBadge: 'SKH029 · SKH030 · SKH031 Integrated Platform',
    navTrace: 'Trace Product',
    navScan: 'Scan QR',
    navBatches: 'Demo Batches',
    navStakeholders: 'Stakeholder Portal',
    navLogin: 'Demo Login',
    navLogout: 'Sign Out',
    heroHeadline: 'Scan any food product and see its journey — from origin to your hands.',
    heroSubheadline: 'Verify live solar cold-storage conditions, full ingredient transformation lineage, and verified handoffs with transparent 100-point scoring.',
    heroScanBtn: 'Scan Product QR',
    heroManualBtn: 'Enter Batch Code',
    heroStakeholderBtn: 'Stakeholder Demo Portal',
    traceScoreLabel: 'Trace & Quality Score',
    traceScoreSub: '100-Point Weighted Integrity Model',
    safeNowTitle: 'Is it safe right now?',
    safeNowSub: 'Active storage unit conditions & solar power status',
    whereBeenTitle: 'Where has this batch been?',
    whereBeenSub: 'Complete timeline, transformation lineage & route geography',
    storageUnitLabel: 'Storage Unit',
    tempLabel: 'Core Temperature',
    humidityLabel: 'Relative Humidity',
    powerStatusLabel: 'Power Source',
    solarStatusLabel: 'Solar Generation',
    safeRangeLabel: 'Safe Condition Bounds',
    tabTimeline: 'Timeline',
    tabLineage: 'Lineage DAG',
    tabMap: 'Route Map',
    tabScore: '100-Pt Breakdown',
    tabCertificates: 'Certificates',
    tabFeedback: 'Feedback',
    tabAIInsights: 'AI Insights & Anomaly Guard',
    tabRiskCenter: 'Safety Risk Center',
    originLabel: 'Origin Farm / FPO',
    currentOwnerLabel: 'Current Custodian',
    currentLocationLabel: 'Current Location',
    harvestDateLabel: 'Harvest / Produced',
    expiryDateLabel: 'Best Before / Expiry',
    verifiedHandoffs: 'Verified Handoffs',
    traceCompleteness: 'Trace Completeness',
    searchPlaceholder: 'Enter Batch ID (e.g. BIS-2026-092, WHT-MH-2026-001)...',
    demoBadge: 'Frontend Prototype · Real Backend & IoT Integration Pending',
    protoScoreNotice: 'Score is calculated using prototype weights (0–100 scale). No 5-star approximations.',
    coldChainNotice: 'Storage telemetry is simulated for demonstration. Does not claim real-time IoT hardware connection.',
    quickSampleBatches: 'Or inspect a featured demo batch:',
    viewDetails: 'Inspect Detailed Lineage',
    feedbackCTA: 'Leave Consumer Feedback',
    offlineBanner: 'Operating in Offline/Cached Mode. Actions saved to local queue.',
    roleFarmer: 'Farmer / FPO Origin',
    roleMandi: 'Mandi / Collection Hub',
    roleTransporter: 'Logistics / Transporter',
    roleWarehouse: 'Warehouse / Cold Storage',
    roleProcessor: 'Processor / Factory',
    roleRetailer: 'Retailer / Store',
    roleAuthority: 'Food Safety Regulator',
    roleAdmin: 'System Administrator',
    roleCustom: 'Custom Supply Chain',
  },
  hi: {
    appName: 'फार्म ट्रेसर (FARM TRACER)',
    appTagline: 'एंड-टू-एंड कोल्ड-चेन एवं खाद्य ट्रेसेबिलिटी प्लेटफॉर्म',
    superPsBadge: 'SKH029 · SKH030 · SKH031 एकीकृत समाधान',
    navTrace: 'उत्पाद ट्रैक करें',
    navScan: 'क्यूआर स्कैन',
    navBatches: 'डेमो बैच',
    navStakeholders: 'हितधारक पोर्टल',
    navLogin: 'डेमो लॉगिन',
    navLogout: 'लॉगआउट',
    heroHeadline: 'किसी भी खाद्य उत्पाद को स्कैन करें और खेत से उपभोक्ता तक उसकी पूरी यात्रा देखें।',
    heroSubheadline: 'सौर कोल्ड-स्टोरेज तापमान, सामग्री परिवर्तन वंशावली और पारदर्शी 100-अंक स्कोरिंग के साथ प्रामाणिकता जांचें।',
    heroScanBtn: 'उत्पाद क्यूआर स्कैन करें',
    heroManualBtn: 'बैच कोड दर्ज करें',
    heroStakeholderBtn: 'हितधारक पोर्टल',
    traceScoreLabel: 'ट्रेस एवं गुणवत्ता स्कोर',
    traceScoreSub: '100-अंक भारित अखंडता मॉडल',
    safeNowTitle: 'क्या यह उत्पाद वर्तमान में सुरक्षित परिस्थितियों में है?',
    safeNowSub: 'सक्रिय भंडारण इकाई तापमान एवं सौर ऊर्जा स्थिति',
    whereBeenTitle: 'यह बैच कहाँ-कहाँ से गुज़रा है?',
    whereBeenSub: 'समयरेखा, सामग्री परिवर्तन वंशक्रम एवं मार्ग मानचित्र',
    storageUnitLabel: 'भंडारण इकाई',
    tempLabel: 'वर्तमान तापमान',
    humidityLabel: 'सापेक्ष आर्द्रता',
    powerStatusLabel: 'ऊर्जा स्रोत',
    solarStatusLabel: 'सौर उत्पादन स्थिति',
    safeRangeLabel: 'सुरक्षित सीमा सीमाएं',
    tabTimeline: 'समयरेखा (Timeline)',
    tabLineage: 'वंशक्रम (DAG Lineage)',
    tabMap: 'मार्ग मानचित्र',
    tabScore: '100-अंक विवरण',
    tabCertificates: 'प्रमाणपत्र',
    tabFeedback: 'प्रतिक्रिया',
    tabAIInsights: 'एआई अंतर्दृष्टि (AI Guard)',
    tabRiskCenter: 'सुरक्षा जोखिम केंद्र',
    originLabel: 'मूल खेत / एफपीओ',
    currentOwnerLabel: 'वर्तमान संरक्षक',
    currentLocationLabel: 'वर्तमान स्थान',
    harvestDateLabel: 'कटाई / उत्पादन तिथि',
    expiryDateLabel: 'उपयोग की अंतिम तिथि',
    verifiedHandoffs: 'सत्यापित हस्तांतरण',
    traceCompleteness: 'ट्रेस पूर्णता',
    searchPlaceholder: 'बैच आईडी दर्ज करें (उदा. BIS-2026-092)...',
    demoBadge: 'प्रोटोटाइप संस्करण · बैकएंड एवं आईओटी इंटीग्रेशन प्रतीक्षारत',
    protoScoreNotice: 'स्कोर प्रोटोटाइप गणना (0-100 स्केल) पर आधारित है।',
    coldChainNotice: 'भंडारण टेलीमेट्री डेमो उद्देश्य के लिए अनुकरणीय है।',
    quickSampleBatches: 'या कोई डेमो बैच चुनें:',
    viewDetails: 'विस्तृत वंशक्रम देखें',
    feedbackCTA: 'उपभोक्ता प्रतिक्रिया दें',
    offlineBanner: 'ऑफ़लाइन मोड में कार्य कर रहा है। डेटा स्थानीय रूप से सुरक्षित है।',
    roleFarmer: 'किसान / एफपीओ',
    roleMandi: 'मंडी / संग्रह केंद्र',
    roleTransporter: 'परिवहन / लॉजिस्टिक्स',
    roleWarehouse: 'कोल्ड स्टोरेज / गोदाम',
    roleProcessor: 'प्रसंस्करण / मिल फैक्ट्री',
    roleRetailer: 'खुदरा विक्रेता / स्टोर',
    roleAuthority: 'खाद्य निरीक्षक / नियामक',
    roleAdmin: 'सिस्टम व्यवस्थापक',
    roleCustom: 'कस्टम सप्लाई चेन',
  },
  mr: {
    appName: 'फार्म ट्रेसर (FARM TRACER)',
    appTagline: 'अखंड कोल्ड-चेन आणि अन्न माग काढणी प्लॅटफॉर्म',
    superPsBadge: 'SKH029 · SKH030 · SKH031 एकात्मिक प्लॅटफॉर्म',
    navTrace: 'उत्पादन शोधा',
    navScan: 'क्यूआर स्कॅन',
    navBatches: 'डेमो बॅचेस',
    navStakeholders: 'स्टेकहोल्डर पोर्टल',
    navLogin: 'डेमो लॉगिन',
    navLogout: 'बाहेर पडा',
    heroHeadline: 'कोणतेही अन्न उत्पादन स्कॅन करा आणि शेतापासून ताटापर्यंतचा प्रवास पहा.',
    heroSubheadline: 'सौर कोल्ड-स्टोरेज तापमान, घटकांचे रूपांतरण आणि पारदर्शक १००-गुण रेटिंग तपासा.',
    heroScanBtn: 'उत्पादन क्यूआर स्कॅन करा',
    heroManualBtn: 'बॅच कोड टाका',
    heroStakeholderBtn: 'स्टेकहोल्डर डेमो पोर्टल',
    traceScoreLabel: 'ट्रेस आणि गुणवत्ता गुण',
    traceScoreSub: '१००-गुण पद्धतशीर मॉडेल',
    safeNowTitle: 'हे उत्पादन सध्या सुरक्षित स्थितीत साठवले आहे का?',
    safeNowSub: 'सक्रिय साठवणूक तापमान आणि सौर ऊर्जा स्थिती',
    whereBeenTitle: 'ही बॅच कोठून प्रवास करून आली?',
    whereBeenSub: 'पूर्ण कालक्रम, घटक रूपांतरण आणि नकाशा',
    storageUnitLabel: 'साठवणूक युनिट',
    tempLabel: 'सध्याचे तापमान',
    humidityLabel: 'आर्द्रता',
    powerStatusLabel: 'ऊर्जा स्त्रोत',
    solarStatusLabel: 'सौर ऊर्जा निर्मिती',
    safeRangeLabel: 'सुरक्षित तापमान मर्यादा',
    tabTimeline: 'टाइमलाइन',
    tabLineage: 'वंशवेल (DAG Lineage)',
    tabMap: 'मार्ग नकाशा',
    tabScore: '१००-गुण विश्लेषण',
    tabCertificates: 'प्रमाणपत्रे',
    tabFeedback: 'अभिप्राय',
    tabAIInsights: 'एआय सुरक्षा गार्ड (AI Guard)',
    tabRiskCenter: 'सुरक्षा धोका नियंत्रण केंद्र',
    originLabel: 'मूळ शेत / एफपीओ',
    currentOwnerLabel: 'सध्याचे ताबेदार',
    currentLocationLabel: 'सध्याचे ठिकाण',
    harvestDateLabel: 'कापणी / उत्पादन तारीख',
    expiryDateLabel: 'वापरण्याची अंतिम मुदत',
    verifiedHandoffs: 'सत्यापित हस्तांतरण',
    traceCompleteness: 'ट्रेस पूर्णता',
    searchPlaceholder: 'बॅच आयडी प्रविष्ट करा (उदा. BIS-2026-092)...',
    demoBadge: 'प्रोटोटाइप आवृत्ती · खरा बॅकएंड आणि आयओटी जोडणी प्रलंबित',
    protoScoreNotice: 'गुण प्रोटोटाइप नियमांनुसार (०-१०० प्रमाण) मोजले आहेत.',
    coldChainNotice: 'साठवण माहिती डेमोसाठी दाखवली आहे.',
    quickSampleBatches: 'किंवा चाचणी बॅच निवडा:',
    viewDetails: 'तपशीलवार वंशवेल तपासा',
    feedbackCTA: 'ग्राहक अभिप्राय नोंदवा',
    offlineBanner: 'ऑफलाइन मोडमध्ये चालू आहे. नोंदी स्थानिक मेमरीमध्ये सेव्ह केल्या आहेत.',
    roleFarmer: 'शेतकरी / एफपीओ',
    roleMandi: 'कृषी उत्पन्न बाजार समिती / मंडी',
    roleTransporter: 'वाहतूक / लॉजिस्टिक्स',
    roleWarehouse: 'गोदाम / कोल्ड स्टोरेज',
    roleProcessor: 'प्रक्रिया उद्योग / फॅक्टरी',
    roleRetailer: 'किरकोळ विक्रेता / दुकान',
    roleAuthority: 'अन्न सुरक्षा निरीक्षक / नियामक',
    roleAdmin: 'सिस्टम ॲडमिन',
    roleCustom: 'कस्टम पुरवठा साखळी',
  },
};
