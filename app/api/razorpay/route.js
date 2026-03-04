import Razorpay from "razorpay";

export async function POST(req) {

  const { amount } = await req.json();

  const instance = new Razorpay({
    key_id: "rzp_test_SN8KH9tvKTS5Gt",
    key_secret: "iY1NF03NYSbtQCmqUqgIUlVh",
  });

  const order = await instance.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: "order_receipt",
  });

  return Response.json(order);

}