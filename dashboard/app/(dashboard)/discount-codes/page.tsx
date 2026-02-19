import DiscountCodesClient from "./DiscountCodesClient";
import { getDummyDiscountCodes } from "../../../lib/dummy/data";

export default async function DiscountCodesPage() {
  const codes = getDummyDiscountCodes();

  return (
    <DiscountCodesClient
      initialCodes={codes as import("../../../lib/api/discountCodes.api").DiscountCode[]}
    />
  );
}
