module.exports = `
INSERT INTO public."Order" (
  "id",
  "userId",
  "shippingPrice",
  "totalPrice",
  "status",
  "usersUserId"
) VALUES
  (1, 1, 100.0, 200, 'pending', 1),
  (2, 2, 5.0, 48.75, 'completed', 2),
  (3, 1, 3.8, 18.49, 'cancelled', 1),
  (4, 3, 6.0, 76.3, 'processing', 3),
  (5, 2, 4.5, 32.1, 'completed', 2);
`