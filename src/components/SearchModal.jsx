import { X } from "lucide-react";

import trendyolLogo from "../assets/trendyo.png";
import hepsiburadaLogo from "../assets/hepsiburada.png";
import amazonLogo from "../assets/amazon.png";
import googleLogo from "../assets/googlee.png";

const siteBilgileri = {
  trendyol: { ad: "Trendyol", renk: "#bf4d10ff", logo: trendyolLogo },
  hepsiburada: { ad: "Hepsiburada", renk: "#931811ff", logo: hepsiburadaLogo },
  amazon: { ad: "Amazon", renk: "#b3771eff", logo: amazonLogo },
  google: { ad: "Google", renk: "#2957a0ff", logo: googleLogo },
};

const SearchModal = ({ urunIsmi, links, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold text-sky-400 mb-4 text-center">
          "{urunIsmi}" için Ara
        </h2>
        <p className="text-zinc-300 mb-6 text-center">
          Aşağıdaki sitelerde ürünü kolayca bulabilirsiniz.
        </p>
        <div className="flex flex-col gap-4">
          {Object.entries(links).map(([site, link]) => {
            const siteDetaylari = siteBilgileri[site] || {
              ad: site.toUpperCase(),
              renk: "#6b7280",
              logo: null,
            };

            return (
              <a
                key={site}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 font-semibold py-3 rounded-lg hover:shadow-lg transition-shadow text-white"
                style={{ backgroundColor: siteDetaylari.renk }}
              >
                {siteDetaylari.logo && (
                  <img
                    src={siteDetaylari.logo}
                    alt={`${siteDetaylari.ad} Logo`}
                    className="h-6 w-auto" //
                  />
                )}
                <span>{`${siteDetaylari.ad}'da Ara`}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
