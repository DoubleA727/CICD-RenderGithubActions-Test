module.exports = `
INSERT INTO public."CCA" 
("ccaId", "name", "description", "category", "imageUrl", "clicks", "isActive") 
VALUES
  -- Sports
  (1, 'SP Dragon Boat', 'Singapore Polytechnic Dragon Boat Team', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-spdragonboat-v01.jpg?sfvrsn=81f7cd13_1',10, TRUE),
  (2, 'SP MMA', 'Mixed Martial Arts CCA', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-spmma-v01.jpeg?sfvrsn=21560db9_2',12, TRUE),
  (3, 'SP Track & Field', 'Track, running, throwing, and jumping events', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-tracknfield-v01.jpg?sfvrsn=44eb20b3_1',14, TRUE),
  (11, 'SP Badminton', 'Competitive & recreational badminton training and tournaments', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-badminton-v01.jpg?sfvrsn=9d07c005_1',21, TRUE),
  (12, 'SP Volleyball', 'Indoor volleyball team with competitive and social divisions', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-vollyball-v01.jpg?sfvrsn=9f03b295_1',67, TRUE),
  (13, 'SP Football', 'Soccer team focusing on tactics, conditioning, and matches', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-spsoccer-v01.jpg?sfvrsn=9e937a1c_3',77, TRUE),
  (14, 'SP Swimming', 'Training for speed, endurance, and competitive events', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-spswimming-v01.jpg?sfvrsn=62be8bbb_3',69, TRUE),
  (15, 'SP Basketball', 'Competitive and casual basketball sessions & competitions', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-basketball-v01.jpg?sfvrsn=f48fdd1_1',92, TRUE),
  (16, 'SP Floorball', 'Fast-paced floorball team competing in poly leagues', 'Sports','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/sports---adventure/sd-spfloorball-v01.jpg?sfvrsn=68665fc5_3',40, TRUE),

  -- Performing Arts
  (4, 'SP Dance Ensemble', 'A vibrant contemporary dance group showcasing modern and cultural performances', 'Performing Arts','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/arts---culture/sd-dancesports-v01.jpg?sfvrsn=d6f0d65b_1',53, TRUE),
  (5, 'SP Jam Band', 'A student-run band focusing on live music, gigs, and band arrangements', 'Performing Arts','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/arts---culture/sd-spgb-v01.jpg?sfvrsn=653c3cbd_1',68, TRUE),
  (6, 'SP Chinese Orchestra', 'Traditional Chinese instrumental music ensemble performing classical and modern pieces', 'Performing Arts','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/arts---culture/sd-spco-v01.jpg?sfvrsn=3af275ff_1',87, TRUE),
  (7, 'SP String Ensemble', 'A classical music group performing orchestral and chamber string arrangements', 'Performing Arts','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/arts---culture/sd-spse-v01.jpg?sfvrsn=55bb5eca_1',93, TRUE),
  (8, 'SP Vocal Talents', 'A vocal performance group focusing on pop, acapella, and choral singing', 'Performing Arts','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/arts---culture/sd-spvt-v01.jpg?sfvrsn=90d3cab1_4',83, TRUE),
  (9, 'SP Theatre & Drama Club', 'A performing arts group focusing on stage productions, acting, and scriptwork', 'Performing Arts','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/arts---culture/sd-sptc-v01.jpg?sfvrsn=38b35d9a_1',56, TRUE),
  (10, 'SP K-Pop Dance Crew', 'A high-energy dance group specializing in K-pop choreography and performances', 'Performing Arts','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/arts---culture/sd-sdz-v01.jpg?sfvrsn=46f01cf1_1',13, TRUE),

  -- Clubs & IGs
  (17, 'SP Photography Club', 'Learn photography techniques, photo walks & editing workshops', 'Clubs','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/special-interests/sd-spphotographers-v01.jpg?sfvrsn=467b3d92_1',50, TRUE),
  (18, 'SP Entrepreneurship Club', 'Build business skills, startup challenges & innovation events', 'Clubs','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/special-interests/sd-spec-v01.jpg?sfvrsn=dc1b6f4b_1',63, TRUE),
  (19, 'SP Community Service Club', 'Volunteering activities and outreach programs', 'Clubs','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/service-learning/sd-wsc-v01.jpg?sfvrsn=f2239b52_1',67, TRUE),
  (20, 'SP Chess Club', 'Strategy-based chess sessions and competitive leagues', 'Clubs','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/special-interests/dsc03154_sklokeshkumar05.22-i.jpg?sfvrsn=eab70ced_3',22, TRUE),
  (21, 'SP Debate Club', 'Training in argumentation, public speaking & competitions', 'Clubs','https://t279-p813-blue-admin.prd.cwp2.sg/images/default-source/student-life/student-life-(sd)/ccas/special-interests/sd-spdebates-v01.jpg?sfvrsn=ce3915c1_3',44, TRUE)

ON CONFLICT ("ccaId") DO NOTHING;
`;
