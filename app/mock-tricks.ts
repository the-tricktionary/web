import { Trick } from './trick';

export var TRICKS: Trick[] = [
{"id": 1,"level":"1","subs":[

{"id2": 1,
"name":"Double Bounce",
"video":"ybwRcnfQtIM",
"description":"The jumper jumps off of the ground two times for every one turn of the rope.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 2,
"name":"Single Bounce",
"video":"k_lHyi85OkM",
"description":"The jumper jumps off of the ground one time for every one turn of the rope.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 3,
"name":"Side Swing",
"video":"20L8nROw-ds",
"description":"The jumper brings his or her hands together and swings the rope to either the right or the left.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 4,
"name":"Criss Cross",
"video":"KABMzJ-U-U4",
"description":"The jumper crosses his or her arms over each other while jumping the rope.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 5,
"name":"Skier",
"video":"k2m4hOZ4yog",
"description":"The jumper does a single bounce while jumping from side to side.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 6,
"name":"Bell",
"video":"8ioiMPfUSNk",
"description":"The jumper does a single bounce while jumping from front to back.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 7,
"name":"Side Swing Jump",
"video":"mku8GBT6ZeA",
"description":"The jumper does a side swing followed by a single bounce.",
"type":"Basics",
"prerequisites":[
{"name":"Side Swing"},{"name":"Single Bounce"}
]
},

{"id2": 8,
"name":"Jogging Step",
"video":"DhLUZSUs1nw",
"description":"The jumper alternates feet with each jump.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 9,
"name":"Side Swing Cross",
"video":"03D0wOfCVy4",
"description":"The jumper does a side swing followed by a cross.",
"type":"Basics",
"prerequisites":[
{"name":"Side Swing Jump"},{"name":"Criss Cross"}
]
},

{"id2": 10,
"name":"Straddle Jump",
"video":"AkNV6SnNxEw",
"description":"The jumper does a single bounce while putting his or her feet apart, then together.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 11,
"name":"X-Motion",
"video":"7XC7eD4XexA",
"description":"The jumper does a straddle jump but crosses his or her legs instead of bringing them together.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 12,
"name":"Toad",
"video":"If-NmjCDYiQ",
"description":"The jumper does a cross with the bottom arm under the inside of his or her opposite leg.",
"type":"Manipulation",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 13,
"name":"AS",
"video":"otzG5Zq7Ybs",
"description":"The jumper does a cross with both arms behind his or her knees.",
"type":"Manipulation",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 14,
"name":"TS",
"video":"zU2U4NPoXMA",
"description":"The jumper does a cross with both arms behind his or her back.",
"type":"Manipulation",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 15,
"name":"CL",
"video":"pXkhg5GegiQ",
"description":"The jumper does a cross with one arm behind his or her legs and one arm behind his or her back.",
"type":"Manipulation",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 16,
"name":"Awesome Annie",
"video":"PmetnIF4a3s",
"description":"The jumper alternates between a crooger and a toad, similar to a regular open cross.",
"type":"Manipulation",
"prerequisites":[
{"name":"Crooger"},{"name":"Toad"}
]
},

{"id2": 17,
"name":"Double Under",
"video":"AHGuLozb-Cs",
"description":"The rope swings around the jumper two times for every one jump.",
"type":"Multiples",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 18,
"name":"Double Under Open Cross",
"video":"YuhOH6dFoPo",
"description":"The jumper does a double under where the second swing is a cross.",
"type":"Multiples",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 19,
"name":"Double Under Cross Open",
"video":"TBfOw2PySuI",
"description":"The jumper does a double under where the first swing is a cross.",
"type":"Multiples",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 20,
"name":"180 Forward",
"video":"aVw4B14COd0",
"description":"The jumper brings his or her arms to the side, turns halfways around, then jumps backwards.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 21,
"name":"180 Backward",
"video":"dnZ5XSjgbuo",
"description":"The jumper brings his or her arms up, turns halfway around, then brings the rope down to jump forwards.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 22,
"name":"360",
"video":"EbqgKGZK_vE",
"description":"The jumper combines the 180 forward and 180 backward to spin all the way around.",
"type":"Basics",
"prerequisites":[
{"name":"180 Forward"},{"name":"180 Backward"}
]
},

{"id2": 23,
"name":"Full Turn",
"video":"3bOH6E6q0FQ",
"description":"The jumper brings his or her arms to the side, spins all the way around with the rope in front, then jumps forwards.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 24,
"name":"Twister",
"video":"wOYpU-_Hw50",
"description":"The jumper does a single bounce while rotating his or her hips.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 25,
"name":"Heel-to-Heel",
"video":"TeHjRTv10Hg",
"description":"The jumper does a single bounce while putting his or her heel in front of the other foot.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 26,
"name":"Toe-to-Toe",
"video":"FGY084y4z44",
"description":"The jumper does a single bounce while putting his or her toe behind the other foot.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 27,
"name":"Heel-to-Toe",
"video":"Zs4q4-asvDs",
"description":"The jumper does a single bounce while alternating between heel and toe.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 28,
"name":"Knee Crossover",
"video":"hOFyc_qlHOs",
"description":"The jumper brings his or her leg up, crosses it over the other leg, back up, and back down.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 29,
"name":"Crooger",
"video":"YMZ0-tMOZEI",
"description":"The jumper takes a jump with one arm under the inside of his or her leg, then does a cross.",
"type":"Manipulation",
"prerequisites":[
{"name":"None"}]
},

{"id2": 30,
"name":"Backwards Jump",
"video":"1kDglhDiaB8",
"description":"The jumper does a single bounce with the rope swinging backwards.",
"type":"Basics",
"prerequisites":[
{"name":"Single Bounce"}]
},

{"id2": 31,
"name":"Backwards Cross",
"video":"_t0RozsY2aQ",
"description":"The jumper does an open cross with the rope swinging backwards.",
"type":"Manipulation",
"prerequisites":[
{"name":"Backwards Jump"},{"name":"Criss Cross"}
]
},

{"id2": 32,
"name":"Backwards Side Swing Cross",
"video":"fdHNM7hjS6s",
"description":"The jumper does a side swing into a cross with the rope swinging backwards.",
"type":"Manipulation",
"prerequisites":[
{"name":"Backwards Side Swing"},{"name":"Backwards Cross"}
,{"name":"Side Swing Cross"}
]
},

{"id2": 33,
"name":"Backwards Side Swing Open",
"video":"FaBts6r7_rI",
"description":"The jumper does a side swing into a jump with the rope swinging backwards.",
"type":"Basics",
"prerequisites":[
{"name":"Backwards Side Swing"},{"name":"Backwards Jump"}
,{"name":"Side Swing Jump"}
]
},

{"id2": 34,
"name":"Backwards Side Swing",
"video":"dVrCt_n8WSE",
"description":"The jumper swings the rope from side to side with the rope swinging backwards.",
"type":"Basics",
"prerequisites":[
{"name":"Side Swing"}]
},

{"id2": 35,
"name":"Frog Fake",
"video":"HjmCr4dwicA",
"description":"The jumper kicks up into a handstand, snaps down, then jumps the rope.",
"type":"Power",
"prerequisites":[
{"name":"None"}]
},

{"id2": 36,
"name":"One Handle Release",
"video":"rweowUw16DQ",
"description":"The jumper releases one handle behind his or her feet, then swings it back up and catches it.",
"type":"Releases",
"prerequisites":[
{"name":"None"}]
},

{"id2": 37,
"name":"Wounded Duck",
"video":"Z8l8uKJ_CT0",
"description":"The jumper does a single bounce while turning his or her toes to the inside and outside.",
"type":"Basics",
"prerequisites":[
{"name":"None"}]
},

{"id2": 38,
"name":"Double Side Swing",
"video":"_coW8Bk1-_w",
"description":"The jumper alternates between an \"open\" and a \"cross\" side swing.",
"type":"Basics",
"prerequisites":[
{"name":"Side Swing"}]
},

{"id2": 39,
"name":"Switch Cross",
"video":"IYwNGa92kNc",
"description":"The jumper does two criss crosses in a row, switching which arm is on top between jumps.",
"type":"Manipulation",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 40,
"name":"EB",
"video":"eL5eO8SssTE",
"description":"The jumper does a cross with one arm in front of and the other arm behind his or her back.",
"type":"Manipulation",
"prerequisites":[
{"name":"Criss Cross"},{"name":"Side Swing Cross"}
]
},

{"id2": 41,
"name":"Pushup Fake",
"video":"V5L43EmkW1o",
"description":"The jumper jumps out into a push-up position and comes up before jumping the rope.",
"type":"Power",
"prerequisites":[
{"name":"None"}]
}
]
},



{"id": 2,"level":"2","subs":[
{"id2": 1,
"name":"Double Under Cross Cross",
"video":"KDEtGzW81P4",
"description":"The jumper does a double under where both swings are crosses.",
"type":"Multiples",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 2,
"name":"Double Under Switch Cross",
"video":"LGB2S33GmMU",
"description":"The jumper does a double under where both swings are crosses with the opposite arm on top for each.",
"type":"Multiples",
"prerequisites":[
{"name":"Switch Cross"},{"name":"Double Under"}
]
},

{"id2": 3,
"name":"Double Under Side Open",
"video":"zmdcvOabQhQ",
"description":"The jumper does a double under where the first swing is a side swing.",
"type":"Multiples",
"prerequisites":[
{"name":"Side Swing Jump"},{"name":"Double Under"}
]
},

{"id2": 4,
"name":"Double Under Side Cross",
"video":"LPOBDj3fvvo",
"description":"The jumper does a double under where the first swing is a side swing, and the second is a cross.",
"type":"Multiples",
"prerequisites":[
{"name":"Side Swing Cross"},{"name":"Double Under"}
]
},

{"id2": 5,
"name":"Double Under EB",
"video":"FqWwwf_kHA4",
"description":"The jumper does an E.B as a double under in one jump.",
"type":"Multiples",
"prerequisites":[
{"name":"EB"},{"name":"Double Under"}
]
},

{"id2": 6,
"name":"Full Twist",
"video":"alhKF8nkHd8",
"description":"The jumper does a full turn as a double under in one jump.",
"type":"Multiples",
"prerequisites":[
{"name":"Full Turn"}
]
},

{"id2": 7,
"name":"BC Turn",
"video":"FY6PD6zCDks",
"description":"The jumper does a 360 with one arm under the outside of his or her leg.",
"type":"Manipulation",
"prerequisites":[
{"name":"360"}]
},

{"id2": 8,
"name":"Frog/Donkey Kick",
"video":"9JXv35xSmko",
"description":"The jumper kicks into a handstand and jumps the rope as his or her legs snap down.",
"type":"Power",
"prerequisites":[
{"name":"None"}]
},

{"id2": 9,
"name":"Pushup",
"video":"lECGyOMead0",
"description":"The jumper jumps out into a push-up position then jumps the rope while coming up.",
"type":"Power",
"prerequisites":[
{"name":"Pushup Fake"}]
},

{"id2":  11,
"name":"Triple Under",
"video":"NbeTn6WcB1U",
"description":"The rope swings around the jumper three times for every one jump.",
"type":"Multiples",
"prerequisites":[
{"name":"Double Under"}]
},

{"id2": 12,
"name":"Triple Under Side Side Open",
"video":"nbMTOfyYqHk",
"description":"The jumper does a triple under where the first two swings are side swings.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under"},
{"name":"Double Under Side Open"},
{"name":"Double Under Side Cross"}
]
},

{"id2": 13,
"name":"Triple Under Side Open Open",
"video":"uKJkm_Cabds",
"description":"The jumper does a triple under where the first swing is a side swing.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under"},{"name":"Double Under Side Open"}
,{"name":"Double Under Side Cross"}
]
},

{"id2": 14,
"name":"Snake 180",
"video":"a5XDno6OU-I",
"description":"The jumper does a snake release and spins halfway around instead of catching the handle.",
"type":"Releases",
"prerequisites":[
{"name":"Snake"}
]
},

{"id2": 15,
"name":"Backwards Double Under",
"video":"2jfYYCC14cs",
"description":"The jumper swings the rope two times backward in one jump.",
"type":"Multiples",
"prerequisites":[
{"name":"Backwards Jump"},{"name":"Double Under"}
]
},

{"id2": 16,
"name":"Elephant",
"video":"w7UMwAnzQ48",
"description":"The jumper does a cross with both arms crossed under one of his or her legs.",
"type":"Manipulation",
"prerequisites":[
{"name":"Toad"},{"name":"Toad Inverse"}
]
},

{"id2": 17,
"name":"Crooger Inverse",
"video":"WfRp51wK7Vc",
"description":"The jumper does an open jump with one arm over the outside of his or her leg, and crosses out of it.",
"type":"Manipulation",
"prerequisites":[
{"name":"Crooger"}]
},

{"id2": 18,
"name":"Toad Inverse",
"video":"7fWZhrcpaH0",
"description":"The jumper does a cross with one arm under the outside of one of his or her legs.",
"type":"Manipulation",
"prerequisites":[
{"name":"Toad"}]
},

{"id2": 19,
"name":"Backwards EB",
"video":"9h6Z0poPtCY",
"description":"The jumper does a backwards cross with one arm behind his or her back.",
"type":"Manipulation",
"prerequisites":[
{"name":"EB"},{"name":"Backwards Cross"}
]
},

{"id2": 20,
"name":"Snake",
"video":"Lj07wtx4gnA",
"description":"The jumper swings the rope around his or her body, releasing one handle, spinning it on the ground, then catching it.",
"type":"Releases",
"prerequisites":[
{"name":"One Handle Release"}]
},

{"id2":21,
"name":"One Handle Release 180",
"video":"T9BrfGZiJBY",
"description":"The jumper does a one handle release from a forward jump with a half turn.",
"type":"Releases",
"prerequisites":[
{"name":"One Handle Release"}]
},

{"id2": 22,
"name":"Full Twist Cross",
"video":"iS0QsDcFRHI",
"description":"The jumper does a full twist and crosses at the end of the twist.",
"type":"Multiples",
"prerequisites":[
{"name":"Full Twist"}]
},

{"id2": 23,
"name":"AS to CL",
"video":"qL93G-mxgJY",
"description":"A switch cross where the first cross is an AS, and the second a CL.",
"type":"Manipulation",
"prerequisites":[
{"name":"AS"},{"name":"CL"}
]
},

{"id2": 24,
"name":"Marley",
"video":"5H08KxQKv7s",
"description":"The jumper does a full turn under his or her leg into a forward side swing toad.",
"type":"Manipulation",
"prerequisites":[
{"name":"Full Turn"}]
},

{"id2": 25,
"name":"KN",
"video":"BO9wHbwU2ws",
"description":"The jumper does a cross with one arm under the inside of his or her leg, and the other behind his or her head.",
"type":"Manipulation",
"prerequisites":[
{"name":"Toad"}]
},

{"id2": 26,
"name":"Caboose",
"video":"e7zeQb7csAE",
"description":"The jumper does a cross between his or her legs, then brings the rope backward.",
"type":"Manipulation",
"prerequisites":[
{"name":"Criss Cross"}]
},

{"id2": 27,
"name":"Leg Wrap Release",
"video":"2-PgNR-_xsA",
"description":"The jumper wraps the rope around his or her legs, then releases the front handle, swings it around, up, and catches it.",
"type":"Releases",
"prerequisites":[
{"name":"One Handle Release"}]
},

{"id2": 28,
"name":"Double Under AS",
"video":"5oWcJO7uY_s",
"description":"The jumper does an A.S. cross open as a double under.",
"type":"Multiples",
"prerequisites":[
{"name":"AS"},{"name":"Double Under"}
]
},

{"id2": 29,
"name":"Cross to Cross Floater",
"video":"oCN7n-xUUiA",
"description":"The jumper does a cross, releases the bottom handle, then catches it back in a cross.",
"type":"Releases",
"prerequisites":[
{"name":"Criss Cross"},{"name":"One Handle Release"}
]
},

{"id2": 30,
"name":"EB to Cross Floater",
"video":"CV3RyptvPkI",
"description":"The jumper does an EB, releases the back handle, then catches it in a cross.",
"type":"Releases",
"prerequisites":[
{"name":"Cross to Cross Floater"},{"name":"E.B."}
]
},

{"id2": 31,
"name":"T Toad Inverse",
"video":"Yesr_ujlejc",
"description":"The jumper does a cross with the top arm under the outside of his or her leg.",
"type":"Manipulation",
"prerequisites":[
{"name":"T Toad"},{"name":"Toad Inverse"}
]
},

{"id2": 32,
"name":"T Toad",
"video":"sbe33OChR3M",
"description":"The jumper does a cross with the top arm under the inside of his or her leg.",
"type":"Manipulation",
"prerequisites":[
{"name":"Toad"}]
}
]
},



{"id": 3,"level":"3","subs":[
{"id2": 1,
"name":"Triple Under Side Cross Open",
"video":"GMON4IZ10xk",
"description":"The jumper does a triple under where the first swing is a side swing and the second swing is a cross.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under"},{"name":"Double Under Side Open"}
,{"name":"Double Under Side Cross"}
]
},

{"id2": 2,
"name":"Triple Under Side Open Cross",
"video":"QVk_r53VILk",
"description":"The jumper does a triple under where the first swing is a side swing and the third swing is a cross.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under"},{"name":"Double Under Side Open"}
,{"name":"Double Under Side Cross"}
]
},

{"id2": 3,
"name":"Triple Under Side Cross Cross",
"video":"n4m-b6HB2aU",
"description":"The jumper does a triple under where the first swing is a side swing and the second and third swings are crosses.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under"},{"name":"Double Under Side Open"}
,{"name":"Double Under Side Cross"}
]
},

{"id2": 4,
"name":"Snake Above Head",
"video":"JFzQ1g2UlVY",
"description":"The jumper does a snake release and spins the rope twice above his or her head.",
"type":"Releases",
"prerequisites":[
{"name":"Snake 180"}]
},

{"id2": 5,
"name":"Mick 360",
"video":"-9sqvG4osaU",
"description":"The jumper does a mick release while doing a 360.",
"type":"Releases",
"prerequisites":[
{"name":"Mick"},{"name":"Mick Switch Sides"}
]
},

{"id2": 6,
"name":"Mick Switch Sides",
"video":"N8dRngmXJbo",
"description":"The jumper does a mick release and swings the rope to both sides of his or her body before catching the handle.",
"type":"Releases",
"prerequisites":[
{"name":"Mick"}]
},

{"id2": 7,
"name":"Two Handle Release",
"video":"WjPlDVqaWQg",
"description":"The jumper tosses both handles into the air, letting the rope rotate once before catching both handles.",
"type":"Releases",
"prerequisites":[
{"name":"One Handle Release"}]
}

{"id2": 8,
"name":"Mick",
"video":"jim55moLp0E",
"description":"The jumper swings the rope to one side, releases one handle, swings the rope two or three times, then catches the handle.",
"type":"Releases",
"prerequisites":[
{"name":"Snake"}]
},

{"id2": 9,
"name":"Johmmy",
"video":"qp7uVwkcpyM",
"description":"A triple under side swing, crooger, then cross.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under Side Open Cross"},{"name":"Crooger"}
]
},

{"id2": 10,
"name":"Johmmy Inverse",
"video":"5C0sii5Vfnk",
"description":"A triple under side swing, inverse crooger, then cross.",
"type":"Multiples",
"prerequisites":[
{"name":"Johmmy"},{"name":"Crooger Inverse"}
]
},

{"id2": 11,
"name":"EK Fulltwist",
"video":"3B1lOdyW-ng",
"description":"A triple under 360 with a jump in the back, and the front.",
"type":"Multiples",
"prerequisites":[
{"name":"360"},{"name":"Full Twist"}
,{"name":"Triple Under"}
]
},

{"id2": 12,
"name":"EK Backward",
"video":"WUvdFdzdG6M",
"description":"An EK where the first swing is a texas style turn, then a 180, then a jump backwards.",
"type":"Multiples",
"prerequisites":[
{"name":"EK Fulltwist"}]
},

{"id2": 13,
"name":"BC FullTwist",
"video":"Z67-4V9tGjE",
"description":"An EK where the jumper puts one arm under the outside of his or her leg during the backward jump.",
"type":"Multiples",
"prerequisites":[
{"name":"BC Turn"},{"name":"EK FullTwist"}
]
},

{"id2": 14,
"name":"540 (One and a Half)",
"video":"eCertQqG5Ng",
"description":"A fulltwist and a half turn performed all together as a triple under.",
"type":"Multiples",
"prerequisites":[
{"name":"EK Fulltwist"}]
},

{"id2": 15,
"name":"TJ",
"video":"6Jwi4UWuRTU",
"description":"A triple under side swing, then toad, then open.",
"type":"Multiples",
"prerequisites":[
{"name":"Toad"},{"name":"Triple Under Side Cross Open"}
]
},

{"id2": 16,
"name":"EB TJ",
"video":"E7d1vDH-wQc",
"description":"A triple under EB to Toad, then open.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under EB"},{"name":"TJ"}
]
},

{"id2": 17,
"name":"EK Cross",
"video":"JTRkjzFKP_s",
"description":"An EK with a cross either in the back, or on the final jump in the front.",
"type":"Multiples",
"prerequisites":[
{"name":"EK Fulltwist"}]
},

{"id2": 18,
"name":"EK Cross Cross",
"video":"hrh8TQnctdc",
"description":"An EK with crosses in both the back and the final jump in the front.",
"type":"Multiples",
"prerequisites":[
{"name":"EK Cross"}]
},

{"id2": 19,
"name":"Belch",
"video":"vtPLdqkDzAY",
"description":"The jumper does a frog landing in a pushup position.",
"type":"Power",
"prerequisites":[
{"name":"Frog/Donkey Kick"},{"name":"Pushup"}
]
},

{"id2": 20,
"name":"EB TJ Inverse",
"video":"FXqZmxrdFW4",
"description":"The jumper does an EB TJ with the front arm going under the outside of his or her leg.",
"type":"Multiples",
"prerequisites":[
{"name":"EB TJ"},{"name":"TJ Inverse"}
]
},

{"id2": 21,
"name":"Two Footed Frog",
"video":"cioB48iYxQo",
"description":"The jumper rebounds off of both feet into a frog.",
"type":"Power",
"prerequisites":[
{"name":"Frog/Donkey Kick"}]
},

{"id2": 22,
"name":"TJ Inverse",
"video":"ehNh537ZZs4",
"description":"The jumper does a TJ but with an inverse toad.",
"type":"Multiples",
"prerequisites":[
{"name":"TJ"},{"name":"Toad Inverse"}
]
},

{"id2": 23,
"name":"Triple Under AS",
"video":"prZwqUB826k",
"description":"The jumper does a side swing then AS Open as a triple under.",
"type":"Multiples",
"prerequisites":[
{"name":"Double Under AS"},{"name":"Triple Under Side Cross Open"}
]
},

{"id2": 24,
"name":"Triple Under CL",
"video":"qLiWuaC9vZM",
"description":"The jumper does an EB to CL as a triple under.",
"type":"Multiples",
"prerequisites":[
{"name":"CL"},{"name":"Triple Under EB"}
]
},

{"id2": 25,
"name":"TummyTuck",
"video":"_TvmIkzH4i8",
"description":"The jumper does a triple under with one arm behind his or her legs and one arm under that arm.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under Side Cross Open"}]
},

{"id2": 26,
"name":"Marteen Caboose",
"video":"lYyfXZs5Z4w",
"description":"The jumper does a caboose jumping both the cross and the backwards swing in one jump.",
"type":"Manipulation",
"prerequisites":[
{"name":"Caboose"}]
},

{"id2": 27,
"name":"Triple Under Mick",
"video":"ai8mnmuvUNU",
"description":"The jumper does a mick with two spins then jump the rope as a triple under.",
"type":"Multiples",
"prerequisites":[
{"name":"Mick"},{"name":"Triple Under"}
]
},

{"id2": 28,
"name":"Mick Under Leg",
"video":"CpcsYUY2gq4",
"description":"The jumper swings the rope under his or her leg and lets go of one handle into a mick.",
"type":"Releases",
"prerequisites":[
{"name":"Mick"}]
},

{"id2": 29,
"name":"Double Under Pushup",
"video":"E0nDa8GnnWE",
"description":"The jumper does one jump and lands in a push-up position.",
"type":"Power",
"prerequisites":[
{"name":"Pushup"}]
},

{"id2": 30,
"name":"Triple Under EB",
"video":"3-9AhG4Ziho",
"description":"The jumper does an EB then an open jump as a triple under.",
"type":"Multiples",
"prerequisites":[
{"name":"Double Under EB"},{"name":"Triple Under"}
]
},

{"id2": 31,
"name":"Triple Under Fake EB",
"video":"QHLBj4f3gNs",
"description":"The jumper does a fake EB then an open jump as a triple under.",
"type":"Multiples",
"prerequisites":[
{"name":"Double Under EB"},{"name":"Triple Under"}
]
}
]
},



{"id": 4,"level":"4","subs":[
{"id2": 1,
"name":"Double Under Frog",
"video":"xhw-yRK1Pb8",
"description":"The jumper does a two footed frog and swings the rope one time around before landing on his or her hands.",
"type":"Power",
"prerequisites":[
{"name":"Two Footed Frog"}]
},

{"id2": 2,
"name":"Kamikaze",
"video":"rKhzsAj5TYw",
"description":"The jumper does a pushup landing back in a pushup.",
"type":"Power",
"prerequisites":[
{"name":"Pushup"},{"name":"Double Under Pushup"}
]
},

{"id2": 3,
"name":"Quad Side Cross EB",
"video":"pvTO5QLa1io",
"description":"The jumper does a side cross and an EB on opposite sides as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"Quadruple Under"}]
},

{"id2": 4,
"name":"Quad Side Cross Side Cross",
"video":"qvfD-72S_QI",
"description":"The jumper does two side crosses on opposite sides as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"Quadruple Under"}]
},

{"id2": 5,
"name":"Quad Side Open Side Open",
"video":"Wk8OjOYLewg",
"description":"The jumper does two side opens on opposite sides as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"Quadruple Under"}]
},

{"id2": 6,
"name":"Quad Side Side Open Cross",
"video":"mZ8FU4BhWRY",
"description":"The jumper does two side swings then open cross as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"Quadruple Under"}]
},

{"id2": 7,
"name":"Quad Side Side Open Open",
"video":"oJTVClWyzOc",
"description":"The jumper does two side swings then two opens as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"Quadruple Under"}]
},

{"id2": 8,
"name":"Quadruple Under",
"video":"h-VFiCfFnSo",
"description":"The jumper swings the rope around 4 times in one jump.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under"}]
},

{"id2": 9,
"name":"Sunny-D",
"video":"FON7KEeUsJU",
"description":"The jumper does a frog but swings the rope down backwards.",
"type":"Power",
"prerequisites":[
{"name":"Frog/Donkey Kick"}]
},

{"id2": 10,
"name":"TJ Quad",
"video":"WQY6dYB6fzs",
"description":"The jumper does a TJ with one extra open swing at the end.",
"type":"Multiples",
"prerequisites":[
{"name":"TJ"},{"name":"Quadruple Under"}
]
},

{"id2": 11,
"name":"Crooger Wrap",
"video":"jj4yOpmR-6c",
"description":"The jumper jumps a crooger twice, wrapping the rope on his or her ankle and swinging into a toad on the other leg.",
"type":"Manipulation",
"prerequisites":[
{"name":"Crooger"},{"name":"Toad"}
]
},

{"id2": 12,
"name":"Crooger Wrap Inverse",
"video":"RQEA1HYAcAc",
"description":"The jumper does a crooger wrap with an inverse crooger, and swings into a t-toad.",
"type":"Manipulation",
"prerequisites":[
{"name":"Crooger Wrap"},{"name":"Crooger Inverse"}
,{"name":"T-Toad"}
]
},

{"id2": 13,
"name":"Hummingbird",
"video":"1uJjSZbJIvk",
"description":"The jumper does an EB wrap with a half turn as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"Quad Wrap Cross"}]
},

{"id2": 14,
"name":"Quad Mick",
"video":"-iHsqSStuKY",
"description":"The jumper does a mick with three spins then jumps the rope as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"Triple Under Mick"}]
},

{"id2": 15,
"name":"TJ EB",
"video":"-swBl5_N18c",
"description":"The jumper does a side swing toad and an EB together as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"TJ"},{"name":"Quad Side Cross EB"}
]
},

{"id2": 16,
"name":"Toad Wrap",
"video":"N2qHIoxzmKQ",
"description":"The jumper jumps a toad twice, wrapping the rope on his or her ankle and swinging into a crooger on the other leg.",
"type":"Manipulation",
"prerequisites":[
{"name":"Crooger Wrap"},{"name":"Toad"}
]
},

{"id2": 17,
"name":"Frog Double Under",
"video":"r_nlicVxhfI",
"description":"The jumper does a frog and swings the rope two times around on the way down.",
"type":"Power",
"prerequisites":[
{"name":"Frog"}]
},

{"id2": 18,
"name":"Mick Catch on Leg",
"video":"Y6JK44BLXLI",
"description":"The jumper does a mick, catches it on his or her leg, and swings it off into another mick.",
"type":"Releases",
"prerequisites":[
{"name":"Mick"}]
},

{"id2": 19,
"name":"Pushup Double Under",
"video":"1epKBV__Spo",
"description":"The jumper does a pushup and swings the rope two times around on the way up.",
"type":"Power",
"prerequisites":[
{"name":"Pushup"}]
},

{"id2": 21,
"name":"Round Off Backtuck",
"video":"jLk11mxUzOw",
"description":"The jumper does a round-off backtuck and swings the rope around more than once.",
"type":"Power",
"prerequisites":[
{"name":"None"}]
},

{"id2": 22,
"name":"Standing Backtuck",
"video":"gYtxFsWyUng",
"description":"The jumper does a standing backtuck and swings the rope around more than once.",
"type":"Power",
"prerequisites":[
{"name":"Round Off Backtuck"}]
},

{"id2": 23,
"name":"TJ AS",
"video":"kPJf7lBzdkc",
"description":"A side swing toad into an AS cross as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"TJ Quad"},{"name":"AS Quad"}
]
},

{"id2": 24,
"name":"Standing Backtuck",
"video":"gYtxFsWyUng",
"description":"The jumper does a standing backtuck and swings the rope around more than once.",
"type":"Power",
"prerequisites":[
{"name":"Round Off Backtuck"}]
},

{"id2": 25,
"name":"TJ AS",
"video":"kPJf7lBzdkc",
"description":"A side swing toad into an AS cross as a quad.",
"type":"Multiples",
"prerequisites":[
{"name":"TJ Quad"},{"name":"AS Quad"}
]
}
]
}

];
