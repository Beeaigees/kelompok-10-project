import Cashier from "./_components/Cashier";

async function getItems() {
  const res = await fetch("http://127.0.0.1:8000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data item dari backend");
  }

  const data = await res.json();
  return data;
}

export default async function CashierPage() {
  const itemMinuman = await getItems();

  return (
    <>
      <Cashier itemMinuman={itemMinuman} />
    </>
  );
}