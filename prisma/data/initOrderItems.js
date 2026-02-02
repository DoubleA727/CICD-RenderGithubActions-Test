module.exports = `
INSERT INTO public."OrderItem" (
  "id",
  "orderId",
  "merchId",
  "quantity",
  "subtotal"
) VALUES
  (1, 3, 7, 1, 24.9),
  (2, 3, 8, 2, 44);
`