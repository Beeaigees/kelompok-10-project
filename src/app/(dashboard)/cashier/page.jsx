import Cashier from "./_components/Cashier";

async function getItems() {
  const res = await fetch("http://127.0.0.1:8000/item/", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data item dari backend");
  }

  const data = await res.json();
  return data.items;
}

export default async function CashierPage() {
  const itemMinuman = await getItems();
  console.log(itemMinuman);

  return (
    <>
      <Cashier itemMinuman={itemMinuman} />
    </>
  );
}
