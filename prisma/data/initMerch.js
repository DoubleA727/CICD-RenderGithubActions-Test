module.exports = `
INSERT INTO public."Merch" 
("merchId", "tierId", "storyId", "ccaId", "name", "description", "price", "imageUrl", "isActive") 
VALUES
  (7, 1, 1, 1, 'DB Festival 2021 Shirt', 'The shirt worn during our legendary 2021 win.', 24.9, 'Lucas.jpeg', TRUE),
  (8, 1, 2, 1, 'DB Festival 2022 Shirt', 'A memorable shirt symbolising the toughest year.', 22, 'Lucas.jpeg', TRUE),
  (9, 2, 3, 1, 'DB Training Shirt 2024', 'Used during the intensive 2024 training regimen.', 18.5, 'Lucas.jpeg', TRUE),

  (11, 1, 4, 2, 'MMA Competition Rash Guard', 'Premium rash guard used in the 2023 Interpoly tournament.', 34.9, 'Yuyang.jpeg', TRUE),
  (12, 2, 5, 2, 'MMA Training Shorts', 'Lightweight shorts designed for sparring and grappling.', 26, 'Yuyang.jpeg', TRUE),
  (13, 3, 6, 2, 'MMA Team Shirt', 'Official team tee used during club events and warm-ups.', 15.9, 'Yuyang.jpeg', TRUE),

  (14, 1, 7, 3, 'Track Nationals Jersey', 'The jersey worn during the 2024 National Track Meet.', 29.9, 'Matthew.jpeg', TRUE),
  (15, 2, 8, 3, 'Sprint Training Tee', 'Breathable training tee ideal for sprint practice.', 19.5, 'Matthew.jpeg', TRUE),
  (16, 3, 9, 3, 'Track Team Hoodie', 'Warm hoodie worn during morning warm-ups.', 32, 'Matthew.jpeg', TRUE)
ON CONFLICT ("merchId") DO NOTHING;
`
