module.exports = `
INSERT INTO public."Tier" ("tierId", "tierLevel", "name", "description") VALUES
  (1, 1, 'Tier 1', 'Basic tier merch'),
  (2, 2, 'Tier 2', 'Mid-level tier merch'),
  (3, 3, 'Tier 3', 'Premium tier merch')
ON CONFLICT ("tierId") DO NOTHING;
`