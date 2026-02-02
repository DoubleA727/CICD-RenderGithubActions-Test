module.exports = `
INSERT INTO public."Story" ("storyId", "storyText", "tierId", "merchId") VALUES
  (1, 'This merch design represents a legendary achievement.', 1, 1),
  (2, 'This design comes from one of the toughest years.', 2, 2),
  (3, 'This merch celebrates a great comeback.', 3, 3),
  (4, 'MMA rash guard story.', 1, 4),
  (5, 'MMA training shorts story.', 2, 5),
  (6, 'MMA team shirt story.', 3, 6),
  (7, 'Track Nationals Jersey story — worn during the 2024 National Meet.', 1, 7),
  (8, 'Track Sprint Training Tee story — inspired by intense sprint training.', 2, 8),
  (9, 'Track Team Hoodie story — designed for cold-weather warmups.', 3, 9)
ON CONFLICT ("storyId") DO NOTHING;
`;
