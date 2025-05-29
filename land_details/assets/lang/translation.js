// the default locale
// you can for example take it from the URL.
console.log(window.localStorage.getItem('language'));
let locale = 'en';
if(window.localStorage.getItem('language') != null){
	locale = window.localStorage.getItem('language');
}
// the translation data
// you can load/fetch these from files or keep them hardcoded.
let messages = {
	en: {
		language:'தமிழ்',
		select:'Select',
		more:'More',
		helper:'Click on map to find nearest',
		nearest: 'Select Nearest Facility',
		nearest1:' ',
		switch_theme: ' Switch Theme',
		address: 'Address',
		photos: 'Photo',
		timings_service: 'Timing/Services',
		timing: 'Working Hours',
		services: 'Services Offered',
		disclaimer: 'Disclaimer',
		disclaimer1: 'The maps, the boundaries and the contents shown in the app for visual reference only. It can’t be used for any legal purpose.' ,
		disclaimer2: 'The contents shown are already available in the public domain or collated from departments. While efforts are made to ensure the display of most authenticated and updated contents, possibility of errors may be there.', 
		disclaimer3: 'TNeGA or the Government of Tamil Nadu shall not be responsible for any loss / damage due to the utilisation of the information given in this app.',
		disclaimer4: 'The user discretion and verification are expected to be carried out on the information shown before making any decision, forward.', 
		disclaimer5: 'The corrections to the location and contents displayed in the app can submitted to the support email, shared here.',
		disclaimer6: 'The same shall be updated upon verification and approval from the respective agencies which owns/ controls the data.', 
		disclaimer7: 'For feedback / suggestions or complaints on the functionalities of the app, please send email to below address' 
			
	},
	ta: {
		language:'English',
        select:'மேலும்',
        more:'தேர்ந்தெடுக்க',
		helper:'வரைபடத்தின் மேல் கிளிக் செய்யவும்',
		nearest:'அருகிலுள்ள வசதியைத் தேர்ந்தெடுக்கவும்',
		nearest1:'அருகாமையில் உள்ள ',
		switch_theme: ' தீமை மாற்ற',
		address: 'முகவரி',
		photos: 'புகைப்படம்',
		timings_service: 'நேரம்/சேவை',
		timing: 'வேலை நேரம்',
		services: 'வழங்கப்படும் சேவைகள்',
		disclaimer: 'பொறுப்புத்துறப்பு',
		disclaimer1: 'வரைபடங்கள், எல்லைகள் மற்றும் உள்ளடக்கங்கள் ஆகியவை காட்சி குறிப்புக்காக மட்டுமே செயலியில் காட்டப்பட்டுள்ளன.  சட்டப்பூர்வ நோக்கத்திற்காக இதைப் பயன்படுத்த முடியாது',
		disclaimer2: 'மேலும் காண்பிக்கப்பட்டுள்ள விவரங்கள்  ஏற்கனவே பொது தளத்தில்  உள்ளன அல்லது துறைகளிடமிருந்து  தொகுக்கப்பட்டுள்ளன.  அங்கீகரிக்கப்பட்ட மற்றும் புதுப்பிக்கப்பட்ட விவரங்கள்  காண்பிப்பதை உறுதிசெய்ய முயற்சிகள் மேற்கொள்ளப்படும்போது, பிழைகள் ஏற்படுவதற்கான சாத்தியக்கூறுகள் இருக்கலாம்', 
		disclaimer3: 'இந்த செயலியில் கொடுக்கப்பட்டுள்ள தகவல்களைப் பயன்படுத்துவதால் ஏற்படும் இழப்பு/சேதங்களுக்கு TNeGA அல்லது தமிழ்நாடு அரசு பொறுப்பேற்காது.',
		disclaimer4: 'இந்த செயலியை பயன்படுத்தி எந்த ஒரு முடிவு எடுக்கும் முன் கொடுக்கப்பட்டுள்ள விவரங்கள் சரியானவை என்று உறுதிசெய்த பின் முடிவுகளை எடுக்கவும்.', 
		disclaimer5: 'செயலியில்  காண்பிக்கப்படும்  அமைவிடம்  மற்றும் விவரங்களுக்கான  திருத்தங்களை கீழே கொடுக்கப்பட்டுள்ள  மின்னஞ்சலுக்குச் அனுப்பலாம். ',
		disclaimer6: 'அந்த விவரங்கள் சம்மத்தப்பட்ட துறைகளின் மூலம்  சரிபார்த்து ஒப்புதல் அளித்தபின் புதுப்பிக்கப்படும்.',
		disclaimer7: 'செயலியின்  செயல்பாடுகள் குறித்த கருத்து / பரிந்துரைகள் மற்றும் புகார்களுக்கு, கீழே குறிப்பிடப்பட்டுள்ள மின்னஞ்சலுக்கு மின்னஞ்சல் அனுப்பவும்.'   
}
};

// finally, pass them to AlpineI18n:
document.addEventListener('alpine-i18n:ready', function () {	
    window.AlpineI18n.create(locale, messages);
});