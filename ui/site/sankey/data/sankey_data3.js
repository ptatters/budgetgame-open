var sankey_data3 = {
	
	"nodes": [
		// level 1
		[	{"id": 0, "name": "Yksityis-\nhenkilöiden\ntulot yhteensä\n", "color": "#FF8B1A", "olink": 1, "arrowed": "mid",},
			{"id": 1, "name": "Kotitaulouksien\nvarallisuus\n", "color": "#C15096", "onode": true, "editable": true}
		],
		// level 2
		[
			{"id": 2, "name": "Julkisyhteisöjen\nmenot yhteensä\n", "color": "#0778B8", "arrowed": "top", "olink": 4},
			{"id": 3, "name": "Yksityis-\nhenkilöiden\nkulutusmenot\n", "color": "#FF8B1A", "arrowed": "bot",},
			{"id": 4, "name": "Julkisyhteisöjen netto-\nrahoitusvarallisuus\n", "color": "#C15096", "onode": true}
		],
		// level 3
		[
			{"id": 5, "name": "Yleinen julkishallinto"},
			{"id": 6, "name": "Elinkeinoelämän edistäminen"},
			{"id": 7, "name": "Maanpuolustus"},
			{"id": 8, "name": "Muut julkiset menot"},
			{"id": 9, "name": "TYÖTTÖMYYS", "editable": true, "required": 8351},
			{"id": 10, "name": "ELÄKKEET", "editable": true, "required": 32451},
			{"id": 11, "name": "PERHE JA LAPSET", "editable": true, "required": 12123},
			{"id": 12, "name": "SAIRAUS JA TOIMINTA-\nRAJOITTEISUUS", "editable": true, "required": 26324},
			{"id": 13, "name": "KOULUTUS", "editable": true},
			{"id": 14, "name": "Asuminen"},
			{"id": 15, "name": "Liikenne"},
			{"id": 16, "name": "Elintarvikkeet"},
			{"id": 17, "name": "Muut tavarat ja palvelut"}
		]
	],
	 "links": [
	 	{"source": 0, "target": 3, "value": 100101, "straight": true},
	 	{"source": 0, "target": 2, "value": 28000, "name": "VEROT JA SOSIAALI-\nTURVAMAKSUT\n", "editable": true},
	 	
	 	{"source": 2, "target": 5, "value": 14280},
	 	{"source": 2, "target": 6, "value": 9389},
	 	{"source": 2, "target": 7, "value": 3280},
	 	{"source": 2, "target": 8, "value": 5719},
	 	{"source": 2, "target": 9, "value": 4057},
	 	
	 	{"source": 3, "target": 10, "value": 2055},
	 	{"source": 3, "target": 11, "value": 1020},
	 	{"source": 3, "target": 12, "value": 5512},
	 	{"source": 3, "target": 13, "value": 2003},
	 	
	 	{"source": 2, "target": 10, "value": 20000},
	 	{"source": 2, "target": 11, "value": 7111},
	 	{"source": 2, "target": 12, "value": 16085},
	 	{"source": 2, "target": 13, "value": 10210},
	 	
	 	{"source": 3, "target": 14, "value": 25118},
	 	{"source": 3, "target": 15, "value": 15277},
	 	{"source": 3, "target": 16, "value": 13556},
	 	{"source": 3, "target": 17, "value": 35560}
	 	
	], 
	"inputs": [
		{"target": 2, "value": 52689, "name": "JULKISYHTEISÖJEN\nMUUT TULOT\n", "editable": true},
		{"target": 0, "value": 132141, "nopath": true},
		{"target": 1, "value": 35000, "nopath": true},
		{"target": 4, "value": 67000, "nopath": true}
	]
};
