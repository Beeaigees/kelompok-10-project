import Image from "next/image";
import Link from "next/link";

export default function Utama() {
  return (
    <>
      <h1>Welcome to cofee web aplication</h1>
      <div className="">
        <button className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          <Link href="/home">Start</Link>
        </button>
      </div>
    </>
  );
}
