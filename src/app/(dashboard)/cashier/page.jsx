import Cashier from "./_components/Cashier";

async function getItems() {
  const res = await fetch("http://127.0.0.1:8000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data item dari backend");
  }

  return res.json();
}

async function getModifierGroups() {
  const res = await fetch("http://127.0.0.1:8000/api/modifier-groups", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data modifier dari backend");
  }

  return res.json();
}

export default async function CashierPage() {
  const [itemMinuman, modifierGroups] = await Promise.all([
    getItems(),
    getModifierGroups(),
  ]);

  return <Cashier itemMinuman={itemMinuman} modifierGroups={modifierGroups} />;
}