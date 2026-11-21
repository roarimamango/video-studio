# Shot list for "The Man Who Invented Stress" — sketch style. (id, act, prompt-body, seed, action?)
STYLE = "sketch, ink (medium), watercolor (medium), traditional media, rough lines, white background, minimalist, muted colors, masterpiece, "
NEG = ("cel shading, anime coloring, 3d, realistic, shiny, digital painting, dark background, heavy ink splatter, cluttered, "
       "text, letters, watermark, signature, lowres, bad anatomy, bad hands, extra fingers, worst quality, low quality")
# locked character descriptions
YOU = "1girl, young woman, short messy dark hair, oversized cream sweater, baggy pants"
SELYE = "1boy, young man, slicked-back dark hair, round glasses, white lab coat, necktie, 1930s"
OLDSELYE = "1man, older man, white hair, round glasses, suit and tie, 1950s"
UPH = "1man, middle-aged man, flat cap, mustache, rolled-up sleeves, work apron"
FRIED = "1man, middle-aged doctor, receding dark hair, white coat over suit, 1950s"
SHOTS = [
 # COLD OPEN
 ("01_you_bed", "open", YOU+", lying on her back in bed, eyes wide open, awake, staring up, holding glowing smartphone, night", 201, 0),
 ("02_you_chest", "open", YOU+", close-up, hand pressed to her chest, anxious, breathing hard, night", 102, 0),
 ("03_you_knees", "open", YOU+", sitting on edge of bed hugging knees, papers and phone scattered on floor, night, worried", 103, 0),
 ("04_you_window", "open", YOU+", from behind, standing at dark window, city lights far away, night, alone", 104, 0),
 ("05_bridge", "open", "no humans, old steel suspension bridge, cables, engineering sketch, fog, wide shot", 105, 0),
 ("06_truss", "open", "no humans, close-up of steel beams and rivets of a bridge, structure under load, engineering sketch", 106, 0),
 ("07_selye_door", "open", SELYE+", standing in doorway of old laboratory, holding a broom, backlit, mysterious", 107, 0),
 # ACT 1
 ("08_mcgill", "act1", "no humans, old stone university building, 1930s, winter, snow, bare trees, Montreal", 108, 0),
 ("09_selye_desk", "act1", SELYE+", sitting at desk writing notes, glass flasks, eager smile, lamp light", 109, 0),
 ("10_selye_inject", "act1", SELYE+", carefully holding a small white rat and a syringe, nervous concentration, sweat drop", 110, 0),
 ("11_rat_run", "act1", "no humans, small white rat running fast across wooden floor, motion lines, cute", 111, 0),
 ("12_selye_chase", "act1", SELYE+", running, swinging a broom, chasing a small white rat, panicked, motion lines, full body", 112, 1),
 ("13_selye_floor", "act1", SELYE+", sitting on the floor, glasses crooked, exhausted, small white rat sitting on his head, comedic", 113, 0),
 ("14_selye_asleep", "act1", SELYE+", sleeping, head resting on folded arms on desk, eyes closed, papers, desk lamp, night", 214, 0),
 ("15_selye_micro", "act1", SELYE+", looking into a microscope, focused, laboratory", 115, 0),
 ("16_selye_thrilled", "act1", SELYE+", close-up, excited triumphant smile, eyes shining", 116, 0),
 ("17_cages", "act1", "no humans, close-up of wire cage with several white rats inside, rats visible through bars, laboratory", 317, 0),
 ("18_selye_shock", "act1", SELYE+", close-up, shocked, holding his glasses in his hand, wide eyes", 118, 0),
 ("19_selye_cradle", "act1", SELYE+", close-up, cupped hands holding a white rat, rat in focus, looking down at rat, gentle", 219, 0),
 ("20_rat_snow", "act1", "no humans, small white rat shivering in falling snow, alone, cold", 120, 0),
 ("21_rat_wheel", "act1", "no humans, white rat inside a small metal hamster wheel, running, side view, close-up", 421, 0),
 ("22_selye_typewriter", "act1", SELYE+", typing on an old typewriter at night, lamp light, determined", 122, 0),
 ("23_oldselye_lecture", "act1", OLDSELYE+", lecturing to an audience, gesturing, lecture hall, spotlight", 123, 0),
 # ACT 2
 ("24_newspapers", "act2", "1950s street, men and women in coats reading newspapers, crowd, city", 124, 0),
 ("25_kitchen", "act2", "1950s couple sitting at kitchen table, bills and papers, worried, evening light", 125, 0),
 ("26_you_dry", "act2", YOU+", sitting cross-legged, looking at viewer with a skeptical half smile, cup of tea", 126, 0),
 ("27_heart_anatomy", "act2", "no humans, anatomical drawing of a human heart, vintage medical sketch, red watercolor", 127, 0),
 # ACT 3
 ("28_sf_street", "act3", "1950s san francisco street, cable car, steep hill, cars, sunny", 128, 0),
 ("29_waiting_room", "act3", "1950s waiting room, three men in suits sitting on the front edge of their chairs, leaning forward, tense, checking watches, side view", 229, 0),
 ("30_doctors", "act3", "2men, two doctors in white coats talking in a hospital hallway, 1950s, clipboards", 130, 0),
 ("31_uph_arrive", "act3", UPH+", carrying a toolbox, walking into a waiting room, friendly", 131, 0),
 ("32_uph_kneel", "act3", UPH+", kneeling, inspecting an upholstered chair, puzzled, scratching his head", 132, 0),
 ("33_worn_edge", "act3", "no humans, close-up of an armchair seat, fabric worn and frayed only at the front edge", 133, 0),
 ("34_friedman_watch", "act3", FRIED+", checking his wristwatch, impatient, frowning", 134, 0),
 ("35_perched", "act3", "1man, 1950s businessman in suit, sitting on the edge of a chair, tapping his foot, checking his watch, tense", 135, 1),
 ("36_friedman_think", "act3", FRIED+", hand on chin, thinking, sudden realization, light", 136, 0),
 ("37_rush", "act3", "1950s businessmen with briefcases rushing down a city street, hats, motion lines, crowd", 137, 1),
 ("38_friedman_point", "act3", FRIED+", pointing forward confidently, crisp, half smile", 138, 0),
 # ACT 4
 ("39_smoke", "act4", "no humans, cigarette smoke curling in the air, ink wash, dark mood", 139, 0),
 ("40_ad_man", "act4", "1man, 1950s man in suit relaxing in armchair, smoking a cigarette, contented smile, vintage advertisement style", 140, 0),
 ("41_archive", "act4", "1person, small figure reading in a huge archive, towering stacks of documents and boxes", 141, 0),
 ("42_oldselye_letter", "act4", OLDSELYE+", writing a letter at his desk, envelope, 1958, lamp", 142, 0),
 ("43_envelope", "act4", "close-up, hand passing a thick envelope of money across a desk to another hand, banknotes visible, 1950s", 243, 0),
 ("44_courtroom", "act4", "1960s courtroom, lawyer in suit gesturing to the jury, wooden benches", 144, 0),
 ("45_you_stunned", "act4", YOU+", stunned, hand over her mouth, wide eyes", 145, 0),
 ("46_cig_hand", "act4", "close-up, hand holding a cigarette, smoke rising, ink wash", 146, 0),
 # ACT 5
 ("47_survey", "act5", "1woman, adult woman sitting at kitchen table filling in a paper questionnaire with a pen, close-up, 1990s", 247, 0),
 ("48_crowd", "act5", "many tiny people standing scattered across an empty white field, minimalist, wide shot", 148, 0),
 ("49_bench", "act5", "no humans, empty park bench, autumn, falling leaves, passing of time", 149, 0),
 ("50_you_whisper", "act5", YOU+", close-up, worried, eyes glistening, whispering", 150, 0),
 ("51_two_people", "act5", "2people, two adults on a park bench, side by side, one hunched with head in hands, one sitting upright and calm, full body", 251, 0),
 ("52_you_think", "act5", YOU+", sitting on the floor, looking up, thinking, soft light", 152, 0),
 # ENDING
 ("53_heart_glow", "end", YOU+", adult, upper body, eyes closed, hand on chest, calm, soft red glow on chest, lots of empty space", 253, 0),
 ("54_you_breathe", "end", YOU+", eyes closed, breathing deeply, hair moving in the wind, peaceful", 154, 1),
 ("55_runner", "end", "1person, runner crouched at starting line, ready, focused, morning light", 155, 1),
 ("56_you_dawn", "end", YOU+", sitting by a window at dawn, warm morning light, small tired smile", 156, 0),
 ("57_you_stand", "end", YOU+", adult, tall, standing up from bed, determined expression, morning light, window, full body", 257, 1),
]
