import { FaPlus } from "react-icons/fa";
import { FeatureProducts } from "../../data";
import Image from "next/image";

export default function FeaturesProducts() {
  return (
    <section className="py-5 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 h-[6px] bg-gray-300 relative mr-4">
          <div className="absolute top-0 left-0 h-[6px] bg-gray-800 w-1/4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-2xl tracking-wide">
            Features Products
          </span>
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-300 text-lg font-medium text-gray-800 hover:bg-gray-400 transition">
            <FaPlus className="text-2xl" />
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-medium py-8 tracking-wide">
        “Top picks curated for you”
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-4 grid-rows-2 gap-4">
        {FeatureProducts.map((product, index) => {
          // จัด layout ทีละอัน
          let spanClass = "";

          if (index === 0) {
            spanClass = "col-span-2 row-span-1";
          } else if (index === 1) {
            spanClass = "col-span-2 row-start-2 row-span-1";
          } else if (index === 2) {
            spanClass = "col-start-3 row-span-2";
          } else if (index === 3) {
            spanClass = "col-start-4 row-span-2";
          }

          return (
            <div
              key={product.name}
              className={`rounded-xl overflow-hidden bg-white shadow-sm ${spanClass} flex flex-col  transform transition-all hover:scale-105 duration-400`}
            >
              <div className="relative flex-1 cursor-pointer">
                {index === 2 || index === 3 ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={700}
                    height={700}
                    className="w-full h-[700px] object-cover"
                  />
                ) : (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover w-full h-full"
                  />
                )}
                {product.tag && (
                  <span className="absolute top-3 right-3 bg-white text-gray-800 text-lg px-5 py-2 rounded shadow-sm">
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-xl tracking-wider">
                  {product.name}
                </p>
                <p className="text-gray-600 text-xl font-medium">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
