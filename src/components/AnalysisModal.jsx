import { X } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const AnalysisModal = ({ report, urunIsmi, onClose }) => {
  if (!report) return null;

  const createChartData = (puan, label) => ({
    labels: [`${label} Puanı`, "Geriye Kalan"],
    datasets: [
      {
        label: `${label} Puanı`,
        data: [puan, 100 - puan],
        backgroundColor: [
          "rgba(255, 159, 64, 0.7)",
          "rgba(100, 100, 100, 0.2)",
        ],
        borderColor: ["rgba(255, 159, 64, 1)", "rgba(100, 100, 100, 0.4)"],
        borderWidth: 1,
      },
    ],
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-center text-orange-400 mb-2">
          Pişmanlık Analiz Raporu
        </h2>
        <h3 className="text-xl text-center text-zinc-300 mb-8">{urunIsmi}</h3>

        <div className="space-y-8">
          <div className="bg-zinc-700 p-6 rounded-xl flex items-center gap-4">
            <h4 className="text-4xl font-extrabold text-orange-400">
              {report.pismanlikYuzdesi}%
            </h4>
            <p className="text-lg font-semibold">Genel Pişmanlık Olasılığı</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">İhtiyaç Analizi</h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(
                    report.ihtiyacAnalizi.puan,
                    "İhtiyaç Analizi"
                  )}
                />
              </div>
              <p className="mt-4 text-zinc-300 text-sm">
                {report.ihtiyacAnalizi.aciklama}
              </p>
            </div>

            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">
                Sürdürülebilirlik Puanı
              </h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(
                    report.surdurulebilirlikPuani.puan,
                    "Sürdürülebilirlik Puanı"
                  )}
                />
              </div>
              <p className="mt-4 text-zinc-300 text-sm">
                {report.surdurulebilirlikPuani.aciklama}
              </p>
            </div>

            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">Kullanım Ömrü</h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(
                    report.kullanimOmru.puan,
                    "Kullanım Ömrü"
                  )}
                />
              </div>
              <p className="mt-4 text-zinc-300 text-sm">
                {report.kullanimOmru.aciklama}
              </p>
            </div>

            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">
                Fiyat/Performans Yorumu
              </h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(
                    report.fiyatPerformansYorumu.puan,
                    "Fiyat/Performans Yorumu"
                  )}
                />
              </div>
              <p className="mt-4 text-zinc-300 text-sm">
                {report.fiyatPerformansYorumu.aciklama}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
