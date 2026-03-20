export const formatINR = (amount) => {
  return "₹" + Number(amount).toLocaleString("en-IN");
};
