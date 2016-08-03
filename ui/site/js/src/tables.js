//============================================================================
//  Tables of data used in the model calculations.
//============================================================================
var table_data = {

    //------------------------------------------------------------------------
    // gdb options for the GDB pulldown menu
    //------------------------------------------------------------------------
    gdb_options : [
        { value : "-1.0", label : '-1,0'  },
        { value : "0",    label : '+/- 0' },
        { value : "+1.5", label : '+1,5'  },
        { value : "+2.5", label : '+2,5'  }
    ],

    volume_growth : {
        '-1.0'  : 0.8036,
        '0'     : 0.8808,
        '+1.5'  : 1.0090,
        '+2.5'  : 1.1035
    },

    //------------------------------------------------------------------------
    // The age groups enumerated.
    //------------------------------------------------------------------------
    age_groups : [
        '0-4',
        '5-9',
        '10-14',
        '15-19',
        '20-24',
        '25-29',
        '30-34',
        '35-39',
        '40-44',
        '45-49',
        '50-54',
        '55-59',
        '60-64',
        '65-69',
        '70-74',
        '75-79',
        '80-84',
        '85-89',
        '90+'
    ],

    //------------------------------------------------------------------------
    //  Some base numbers
    //------------------------------------------------------------------------
    base_numbers : {
        "2013" : {
            base_income : {
                'valilliset_verot' : 28202,
                'sotumaksut'       : 19034.6995937781,
                'muut_tulot'       : 28156,
                'tuloverot'        : 31568.1704835798
            }
        },

        "2016" : {
            // Palkka- ja yrittäjätulot
            //salaries : 85824.4097630501,

            // Omaisuustulot
            property_income :  9424.4253513619,

            // BKT
            gdb : 208115.80351003,

            // Velka
            debt : 125394,

            // Kotitalouksien varallisuus
            private_net_wealth : 512258.17,

            // Julkisyhteisöjen nettorahoitusvarallisuus
            public_net_wealth : 124529

        },

        "2025" : {
            // Kotitalouksien varallisuus
            private_net_wealth : 90000

        }
    },


    //------------------------------------------------------------------------
    //  Default distribution of the total expense by expense group.
    //  The order of shares is:
    //      0: public expenses ("Julkisyhteisöt")
    //      1: service fees ("Palvelumaksut")
    //      2: voluntary comsumption ("Vapaaehtoinen kulutus")
    //------------------------------------------------------------------------
    expenses_default_shares : {
        'muu_julkinen'     : [100, 0,  0],
        'elinkeinoelama'   : [100, 0,  0],
        'julkishallinto'   : [100, 0,  0],
        'maanpuolustus'    : [100, 0,  0],
        'terveys'          : [ 80, 7, 13],
        'perhepolitiikka'  : [ 90, 0, 10],
        'koulutus'         : [ 95, 0,  5],
        'elakkeet'         : [100, 0,  0],
        'tyottomyys'       : [100, 0,  0]
    },

    //------------------------------------------------------------------------
    //  Public income tables.
    //
    //  The columns for tables with 9 columns are:
    //      2013 2016/-1 2016/0 2016/+1 2016/+2 2025/-1 2025/0 2025/+1 2025/+2
    //  3-column table columns are:
    //      2013 2016 2025
    //------------------------------------------------------------------------
    "income" : {
        // Työntekijän verot
        "tuloverot" : [
            [    0,    0,    0,    0,    0,    0,    0,    0,    0],
            [    1,    2,    2,    2,    2,    2,    2,    2,    2],
            [    3,    3,    3,    3,    3,    3,    3,    3,    3],
            [  109,   98,   98,   98,   98,  105,  105,  105,  105],
            [  836,  846,  846,  846,  846,  774,  774,  774,  774],
            [ 1960, 1976, 1976, 1976, 1976, 1855, 1855, 1855, 1855],
            [ 2774, 2904, 2904, 2904, 2904, 2990, 2990, 2990, 2990],
            [ 3273, 3535, 3535, 3535, 3535, 3676, 3676, 3676, 3676],
            [ 3652, 3499, 3499, 3499, 3499, 3945, 3945, 3945, 3945],
            [ 4194, 3801, 3801, 3801, 3801, 3920, 3920, 3920, 3920],
            [ 3990, 4003, 4003, 4003, 4003, 3428, 3428, 3428, 3428],
            [ 3622, 3331, 3443, 3443, 3443, 3123, 3246, 3246, 3246],
            [ 3059, 2727, 2878, 2878, 2888, 2641, 2776, 2783, 2790],
            [ 1772, 2120, 2249, 2376, 2480, 1923, 2057, 2185, 2327],
            [  984, 1139, 1139, 1291, 1485, 1388, 1388, 1523, 1653],
            [  633,  749,  749,  749,  749, 1151, 1151, 1151, 1151],
            [  464,  471,  471,  471,  471,  645,  645,  645,  645],
            [  243,  283,  283,  283,  283,  342,  342,  342,  342],
            [  114,  150,  150,  150,  150,  205,  205,  205,  205]
        ],
        // TYÖNANTAJAN SOSIAALITURVAMAKSUT
        "sotumaksut" : [
            [    0,    0,    0,    0,    0,    0,    0,    0,    0],
            [    0,    0,    0,    0,    0,    0,    0,    1,    0],
            [    1,    1,    1,    1,    1,    1,    1,    1,    1],
            [  106,   97,   97,   97,   97,  103,  103,  103,  103],
            [  840,  794,  794,  794,  794,  726,  726,  726,  726],
            [ 1645, 1617, 1617, 1617, 1617, 1518, 1518, 1518, 1518],
            [ 2199, 2143, 2143, 2143, 2143, 2206, 2206, 2206, 2206],
            [ 2405, 2351, 2351, 2351, 2351, 2445, 2445, 2445, 2445],
            [ 2338, 2307, 2307, 2307, 2307, 2601, 2601, 2601, 2601],
            [ 2763, 2449, 2449, 2449, 2449, 2525, 2525, 2525, 2525],
            [ 2659, 2536, 2536, 2536, 2536, 2172, 2172, 2172, 2172],
            [ 2263, 2116, 2116, 2116, 2116, 1995, 1995, 1995, 1995],
            [ 1342, 1065, 1255, 1255, 1259, 1032, 1211, 1213, 1217],
            [  331,  338,  335,  521,  698,  306,  306,  482,  662],
            [   58,   66,   66,  116,  169,   80,   80,  126,  171],
            [   41,   43,   43,   43,   43,   66,   66,   66,   66],
            [   26,   25,   25,   25,   25,   35,   35,   35,   35],
            [   13,   14,   14,   14,   14,   16,   16,   16,   16],
            [    5,    6,    6,    6,    6,    8,    8,    8,    8]
        ],
        // VÄLILLISET VEROT + YHTEISÖJEN PÄÄOMAVEROT
        "valilliset_verot" : [
            [  423,  424,  424,  424,  424,  427,  427,  427,  427],
            [  529,  544,  544,  544,  544,  556,  556,  556,  556],
            [  661,  676,  676,  676,  676,  716,  716,  716,  716],
            [  894,  848,  848,  848,  848,  901,  901,  901,  901],
            [ 1391, 1371, 1371, 1371, 1371, 1254, 1254, 1254, 1254],
            [ 1967, 2017, 2017, 2017, 2017, 1894, 1894, 1894, 1894],
            [ 2382, 2423, 2423, 2423, 2423, 2494, 2494, 2494, 2494],
            [ 2413, 2462, 2462, 2462, 2462, 2560, 2560, 2560, 2560],
            [ 2292, 2360, 2360, 2360, 2360, 2661, 2661, 2661, 2661],
            [ 2865, 2649, 2649, 2649, 2649, 2732, 2732, 2732, 2732],
            [ 2891, 2877, 2877, 2877, 2877, 2464, 2464, 2464, 2464],
            [ 2932, 2760, 2860, 2860, 2860, 2587, 2696, 2696, 2696],
            [ 2414, 2221, 2356, 2356, 2364, 2150, 2273, 2278, 2284],
            [ 1687, 1799, 1781, 1897, 1994, 1629, 1628, 1745, 1872],
            [  989, 1160, 1160, 1211, 1304, 1412, 1412, 1455, 1495],
            [  690,  767,  767,  767,  767, 1179, 1179, 1179, 1179],
            [  454,  461,  461,  461,  461,  632,  632,  632,  632],
            [  239,  261,  261,  261,  261,  315,  315,  315,  315],
            [   88,  103,  103,  103,  103,  140,  140,  140,  140]
        ],
    },

    fixed_income : {
        // Palkka- ja yrittäjätulot
        "salaries" : [
            [     0,     0,     0,     0,     0,     0,     0,     0,     0],
            [     0,     4,     4,     4,     4,     4,     4,     4,     4],
            [     0,     7,     7,     7,     7,     8,     8,     8,     8],
            [     0,   221,   221,   221,   221,   235,   235,   235,   235],
            [     0,  2008,  2008,  2008,  2008,  1836,  1836,  1836,  1836],
            [     0,  5000,  5000,  5000,  5000,  4694,  4694,  4694,  4694],
            [     0,  7510,  7510,  7510,  7510,  7733,  7733,  7733,  7733],
            [     0,  9156,  9156,  9156,  9156,  9522,  9522,  9522,  9522],
            [     0,  9175,  9175,  9175,  9175, 10344, 10344, 10344, 10344],
            [     0,  9903,  9903,  9903,  9903, 10211, 10211, 10211, 10211],
            [     0, 10336, 10336, 10336, 10336,  8851,  8851,  8851,  8851],
            [     0,  9011,  9011,  9011,  9011,  8496,  8496,  8496,  8496],
            [     0,  7690,  7990,  7990,  8019,  7446,  7709,  7727,  7748],
            [     0,  6927,  6857,  7086,  7247,  6274,  6271,  6512,  6794],
            [     0,  3589,  3589,  4022,  4585,  4371,  4371,  4755,  5123],
            [     0,  2344,  2344,  2344,  2344,  3601,  3601,  3601,  3601],
            [     0,  1427,  1427,  1427,  1427,  1954,  1954,  1954,  1954],
            [     0,  853,    853,   853,   853,  1030,  1030,  1030,  1030],
            [     0,  435,    435,   435,   435,   594,  594,    594,   594]
        ]
    },

    //------------------------------------------------------------------------
    //  Expenses tables
    //------------------------------------------------------------------------
    expenses : {
        // ELÄKKEET
        "elakkeet" : [
            [    1,    1,    1,    1,    1,    1,    1,    1,    1],
            [    4,    4,    4,    4,    4,    4,    4,    4,    4],
            [    9,   10,   10,   10,   10,   10,   10,   10,   10],
            [   24,   23,   23,   23,   23,   24,   24,   24,   24],
            [   39,   38,   38,   38,   38,   35,   35,   35,   35],
            [   51,   53,   53,   53,   53,   49,   49,   49,   49],
            [   76,   78,   78,   78,   78,   80,   80,   80,   80],
            [  109,  112,  112,  112,  112,  116,  116,  116,  116],
            [  162,  167,  167,  167,  167,  188,  188,  188,  188],
            [  300,  277,  277,  277,  277,  286,  286,  286,  286],
            [  566,  563,  563,  563,  563,  482,  482,  482,  482],
            [ 1131, 1103, 1103, 1103, 1103, 1040, 1040, 1040, 1040],
            [ 4087, 4634, 3987, 3987, 4002, 4485, 3847, 3856, 3866],
            [ 7172, 7647, 7570, 6845, 6075, 6926, 6922, 6271, 5654],
            [ 4564, 5350, 5350, 5459, 5755, 6516, 6516, 6594, 6658],
            [ 3435, 3819, 3819, 3819, 3819, 5866, 5866, 5866, 5866],
            [ 2304, 2343, 2343, 2343, 2343, 3208, 3208, 3208, 3208],
            [ 1327, 1450, 1450, 1450, 1450, 1752, 1752, 1752, 1752],
            [  587,  686,  686,  686,  686,  938,  938,  938,  938]
        ],
        "tyottomyys" : [
            [   0,   0,   0,   0,   0,   0,   0,   0,   0],
            [   0,   0,   0,   0,   0,   0,   0,   0,   0],
            [   0,   0,   0,   0,   0,   0,   0,   0,   0],
            [  47,  44,  44,  44,  44,  47,  47,  47,  47],
            [ 226, 223, 223, 223, 223, 204, 204, 204, 204],
            [ 299, 306, 306, 306, 306, 287, 287, 287, 287],
            [ 344, 350, 350, 350, 350, 360, 360, 360, 360],
            [ 387, 394, 394, 394, 394, 410, 410, 410, 410],
            [ 357, 368, 368, 368, 368, 415, 415, 415, 415],
            [ 404, 374, 374, 374, 374, 385, 385, 385, 385],
            [ 392, 390, 390, 390, 390, 334, 334, 334, 334],
            [ 416, 406, 406, 406, 406, 382, 382, 382, 382],
            [ 281, 221, 274, 274, 275, 214, 264, 265, 266],
            [  14,  15,  15,  67, 118,  13,  13,  63, 113],
            [   0,   0,   0,   3,   6,   0,   0,   3,   5],
            [   0,   0,   0,   0,   0,   0,   0,   0,   0],
            [   0,   0,   0,   0,   0,   0,   0,   0,   0],
            [   0,   0,   0,   0,   0,   0,   0,   0,   0],
            [   0,   0,   0,   0,   0,   0,   0,   0,   0]
        ],
        "terveys" : [
            [ 1603, 1610, 1621],
            [ 1491, 1531, 1566],
            [  579,  592,  628],
            [  827,  785,  834],
            [ 1482, 1461, 1336],
            [ 1152, 1181, 1109],
            [  962,  979, 1008],
            [  989, 1008, 1049],
            [  904,  931, 1049],
            [ 1193, 1104, 1138],
            [ 1326, 1320, 1130],
            [ 1340, 1307, 1232],
            [ 1335, 1303, 1257],
            [ 1317, 1390, 1271],
            [ 1208, 1416, 1724],
            [ 1498, 1666, 2559],
            [ 1824, 1854, 2538],
            [ 1784, 1950, 2356],
            [ 1272, 1486, 2031]
        ],
        "perhepolitiikka" : [
            [ 1908, 1916, 1929],
            [  530,  545,  557],
            [  500,  512,  542],
            [  284,  270,  287],
            [    4,    4,    4],
            [    3,    3,    3],
            [    4,    4,    4],
            [    2,    2,    2],
            [    1,    1,    1],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0]
        ],
        "koulutus" : [
            [    0,    0,    0],
            [ 1200, 1232, 1260],
            [ 2036, 2083, 2207],
            [ 2257, 2141, 2275],
            [ 1851, 1825, 1669],
            [  939,  963,  904],
            [  364,  370,  381],
            [  223,  228,  237],
            [   50,   51,   57],
            [   40,   37,   38],
            [   35,   35,   30],
            [   32,   31,   29],
            [   31,   30,   29],
            [   36,   38,   35],
            [   18,   21,   25],
            [    4,    5,    8],
            [    0,    0,    0],
            [    0,    0,    0],
            [    0,    0,    0]
        ]

    },

    // Fixed expeses, by year
    fixed_public_expenses : {
        // Yleinen julkishallinto
        "julkishallinto" : {
            "2013" : 16812,
            "2016" : 17050.0170192304,
            "2025" : 17723.9340379656
        },

        // Elinkeinoelämän edistäminen
        "elinkeinoelama" : {
            "2013" : 9530,
            "2016" : 9664.92161511217,
            "2025" : 10046.9361992513
        },

        "maanpuolustus" : {
            "2013" : 2984,
            "2016" : 3026.24618042966,
            "2025" : 3145.86124014332
        },

        // Muut julkiset menot
        "muu_julkinen" : {
            "2013" : 22100,
            "2016" : 22417,
            "2025" : 23303
        }
    },

    fixed_private_expenses : {
        // Elintarvikkeet
        "elintarvikkeet" : {
            "2013" : 18530,
            "2016" : 18792.3397196252,
            "2025" : 19535.1235857425
        },
        // Asuminen
        "asuminen" : {
            "2013" : 28580,
            "2016" : 28984.6232696648,
            "2025" : 30130.2661673244
        },
        // Kuljetus ja tietoliikenne
        "liikenne" : {
            "2013" : 15507,
            "2016" : 15726.541394076,
            "2025" : 16348.1468669244
        },
        // Muut tavarat ja palvelut
        "muu_yksityinen" : {
            "2013" : 36502,
            "2016" : 34012,
            "2025" : 35356
        }
    },

    growth_factors: {
        "2025": {
            // Income Public    / Blue Roots
            'valilliset_verot'  : {'-1.0': 0.9321, '0': 0.9599, '+1.5': 1.0083, '+2.5': 1.0942},
            'sotumaksut'        : {'-1.0': 0.9321, '0': 0.9599, '+1.5': 1.0083, '+2.5': 1.0942},
            'muut_tulot'        : {'-1.0': 0.9321, '0': 0.9599, '+1.5': 1.0083, '+2.5': 1.0942},
            // Income Private   / Orange Roots
            'salaries'          : {'-1.0': 0.6659, '0': 0.7906, '+1.5': 1.0075, '+2.5': 1.0854},
            'property_income'   : {'-1.0': 0.6659, '0': 0.7906, '+1.5': 1.0075, '+2.5': 1.0854},
            // Expenses Public  / Blue Branches
            'julkishallinto'    : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            'maanpuolustus'     : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            'elinkeinoelama'    : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            'muu_julkinen'      : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            // Expense dynamic  / Blue Branches
            'elakkeet'          : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            'tyottomyys'        : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            'terveys'           : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            'perhepolitiikka'   : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            'koulutus'          : {'-1.0': 1.4089, '0': 1.2233, '+1.5': 1.0030, '+2.5': 1.0330},
            // Expenses Private / Orange Branches
            'elintarvikkeet'    : {'-1.0': 0.8036, '0': 0.8808, '+1.5': 1.0093, '+2.5': 1.1066},
            'asuminen'          : {'-1.0': 0.8036, '0': 0.8808, '+1.5': 1.0093, '+2.5': 1.1066},
            'liikenne'          : {'-1.0': 0.8036, '0': 0.8808, '+1.5': 1.0093, '+2.5': 1.1066},
            'muu_yksityinen'    : {'-1.0': 0.8036, '0': 0.8808, '+1.5': 1.0093, '+2.5': 1.1066},
            // NASNB
            'NASNB'             : {'-1.0': 0.9089, '0': 0.9089, '+1.5': 1.0068, '+2.5': 1.0330}
        }
    },

    //------------------------------------------------------------------------
    //  NASBD and subsidies table. This represents the share of an age group
    //  of the generic public expenses.
    //------------------------------------------------------------------------
    NASNB : [
        [ 1451, 1457, 1457, 1457, 1457, 1467, 1467, 1467, 1467],
        [ 1434, 1472, 1472, 1472, 1472, 1506, 1506, 1506, 1506],
        [ 1388, 1419, 1419, 1419, 1419, 1504, 1504, 1504, 1504],
        [ 1498, 1421, 1421, 1421, 1421, 1510, 1510, 1510, 1510],
        [ 1624, 1602, 1602, 1602, 1602, 1465, 1465, 1465, 1465],
        [ 1592, 1632, 1632, 1632, 1632, 1533, 1533, 1533, 1533],
        [ 1604, 1631, 1631, 1631, 1631, 1679, 1679, 1679, 1679],
        [ 1248, 1309, 1309, 1309, 1309, 1362, 1362, 1362, 1362],
        [ 1264, 1302, 1302, 1302, 1302, 1468, 1468, 1468, 1468],
        [ 1365, 1262, 1262, 1262, 1262, 1302, 1302, 1302, 1302],
        [ 1329, 1322, 1322, 1322, 1322, 1132, 1132, 1132, 1132],
        [ 1510, 1457, 1473, 1473, 1473, 1388, 1388, 1388, 1388],
        [ 1462, 1364, 1391, 1391, 1396, 1321, 1342, 1345, 1349],
        [ 1255, 1371, 1325, 1338, 1340, 1247, 1212, 1229, 1255],
        [  964, 1130, 1130, 1133, 1194, 1377, 1377, 1344, 1314],
        [  798,  888,  888,  888,  888, 1364, 1364, 1364, 1364],
        [  562,  571,  571,  571,  571,  782,  782,  782,  782],
        [  340,  372,  372,  372,  372,  449,  449,  449,  449],
        [  135,  158,  158,  158,  158,  216,  216,  216,  216]
    ],

    //------------------------------------------------------------------------
    //  Service deficit for past years.
    //------------------------------------------------------------------------
    service_deficit : {
        "2013" : [
            -4541,
            -4129,
            -3849,
            -3831,
            -2137,
             1522,
             4124,
             5355,
             5358,
             6519,
             6005,
             4376,
             -350,
            -5525,
            -4671,
            -4291,
            -3718,
            -2616,
            -1765
        ]
    },

    //------------------------------------------------------------------------
    //  Yearly population, by year and by age group.
    //
    //  population["2016"][3] is the number of people in the age group with
    //  index 3 (15-19 olds) in year 2016.
    //
    //  These are used in the computation of "personal balance": the average
    //  expenses and contributions to public income of an age group member.
    //------------------------------------------------------------------------
    population : {
        "2013" : [
            305298,
            300487,
            290793,
            313425,
            341405,
            339640,
            350327,
            339763,
            315662,
            368139,
            374607,
            374051,
            381117,
            356723,
            236287,
            192035,
            143785,
            88170,
            41059
        ],
        "2016" : [
            306566,
            308579,
            297382,
            297401,
            336590,
            348294,
            356230,
            346549,
            324980,
            340427,
            372831,
            364837,
            371831,
            376481,
            277023,
            213469,
            146159,
            96366,
            47976
        ],
        "2025" : [
            308600,
            315546,
            315188,
            316037,
            307877,
            326978,
            366773,
            360433,
            366399,
            351016,
            319273,
            343963,
            358750,
            344289,
            337371,
            327951,
            200127,
            116424,
            65553
        ]
    }
}


