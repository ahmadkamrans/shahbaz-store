import CategoriesClient from "./CategoriesClient";
import { getDummyCategories } from "../../../lib/dummy/data";

export default async function CategoriesPage() {
  const categories = getDummyCategories();

  return (
    <CategoriesClient
      initialCategories={categories as import('../../../lib/api/categories.api').Category[]}
    />
  );
}
