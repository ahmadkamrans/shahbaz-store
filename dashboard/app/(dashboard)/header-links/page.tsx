import HeaderLinksClient from "./HeaderLinksClient";
import { getDummyHeaderLinks } from "../../../lib/dummy/data";

export default async function HeaderLinksPage() {
  const links = getDummyHeaderLinks();

  return (
    <HeaderLinksClient
      initialLinks={links as import("../../../lib/api/headerLinks.api").HeaderLink[]}
    />
  );
}
