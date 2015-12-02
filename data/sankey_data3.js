var sankey_data3 = {
	
	"nodes": [
		// level 1
		[
			{"id": 0, "name": "Välilliset verot\n", "color": "#0778B8", "startnode": true, "editable": true},
			{"id": 1, "name": "Työnanatjan\nsosiaaliturvamaksut\n", "color": "#0778B8", "startnode": true, "editable": true},
			{"id": 2, "name": "Muut tulot\n", "color": "#0778B8", "startnode": true},

			{"id": 3, "name": "Saadut tulonsiirrot\n", "color": "#FF8B1A", "startnode": true},
			{"id": 4, "name": "Palkka- ja omaisuustulot\n", "color": "#FF8B1A", "startnode": true},
			{"id": 5, "name": "Omaisuustulot\n", "color": "#FF8B1A", "startnode": true},
		],
		// level 2
		[	{"id": 6, "name": "KOTITALOUDET\nMenot yhteensä\n", "color": "#FF8B1A", "olink": 7},
			{"id": 7, "name": "Kotitaulouksien\nvarallisuus\n", "color": "#AA5F2B", "onode": true, "editable": true}
		],
		// level 3
		[
			{"id": 8, "name": "JULKISYHTEISÖT\nMenot yhteensä\n", "color": "#0778B8", "olink": 9},
			{"id": 9, "name": "Julkisyhteisöjen netto-\nrahoitusvarallisuus\n", "color": "#3B5772", "onode": true}
		],
		// level 4
		[
			{"id": 10, "name": "Yleinen julkishallinto"},
			{"id": 11, "name": "Elinkeinoelämän edistäminen"},
			{"id": 12, "name": "Maanpuolustus"},
			{"id": 13, "name": "Muut julkiset menot"},
			{"id": 14, "name": "TYÖTTÖMYYS", "editable": true, "required": 8351},
			{"id": 15, "name": "ELÄKKEET", "editable": true, "required": 32451},
			{"id": 16, "name": "PERHE JA LAPSET", "editable": true, "required": 12123},
			{"id": 17, "name": "SAIRAUS JA TOIMINTA-\nRAJOITTEISUUS", "editable": true, "required": 26324},
			{"id": 18, "name": "KOULUTUS", "editable": true},
			{"id": 19, "name": "Asuminen"},
			{"id": 20, "name": "Liikenne"},
			{"id": 21, "name": "Elintarvikkeet"},
			{"id": 22, "name": "Muut tavarat ja palvelut"},
			{"id": 23, "name": "= Vähennykset palveluihin", "color": "#E21D19", "inode": true}
		]
	],
	 "links": [

	 	// First level PUBLIC income
	 	{"source": 0, "target": 8, "value": 17563},
	 	{"source": 1, "target": 8, "value": 17563},
	 	{"source": 2, "target": 8, "value": 17563},

	 	// First level PROCATE income
	 	{"source": 3, "target": 6, "value": 38400},
	 	{"source": 4, "target": 6, "value": 85900},
	 	{"source": 5, "target": 6, "value": 9900},

	 	{"source": 6, "target": 8, "value": 28000, "name": "MAKSETUT\nTULONSIIRROT\n", "editable": true},
	 	
	 	{"source": 8, "target": 10, "value": 14280},
	 	{"source": 8, "target": 11, "value": 9389},
	 	{"source": 8, "target": 12, "value": 3280},
	 	{"source": 8, "target": 13, "value": 5719},
	 	{"source": 8, "target": 14, "value": 4057},
	 	
	 	{"source": 6, "target": 15, "value": 2055},
	 	{"source": 6, "target": 16, "value": 1020},
	 	{"source": 6, "target": 17, "value": 5512},
	 	{"source": 6, "target": 18, "value": 2003},
	 	
	 	{"source": 8, "target": 15, "value": 20000},
	 	{"source": 8, "target": 16, "value": 7111},
	 	{"source": 8, "target": 17, "value": 16085},
	 	{"source": 8, "target": 18, "value": 10210},
	 	
	 	{"source": 6, "target": 19, "value": 25118},
	 	{"source": 6, "target": 20, "value": 15277},
	 	{"source": 6, "target": 21, "value": 13556},
	 	{"source": 6, "target": 22, "value": 35560}
	 	
	], 
	"inputs": [
		// Private income
		//{"target": 6, "value": 38400, "name": "Saadut tulonsiirrot\n", "color": "#0778B8"},
		//{"target": 6, "value": 85900, "name": "Palkka- ja omaisuustulot\n", "color": "#747473"},
		//{"target": 6, "value": 9900, "name": "Omaisuustulot\n", "color": "#747473"},
		// Public income
		//{"target": 8, "value": 52689, "name": "JULKISYHTEISÖJEN\nMUUT TULOT\n", "editable": true, "color": "#747473"},
		// Overflow nodes
		{"target": 7, "value": 392000, "nopath": true},
		{"target": 9, "value": 120000, "nopath": true}
	]
};
