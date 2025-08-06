// src/components/AnalysisPage.jsx

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Chart.js bileşenlerini ve eklentileri kaydet
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Grafik verisi oluşturan yardımcı fonksiyon
const createChartData = (puan, label) => ({
  labels: [`${label} Puanı`, "Geriye Kalan"],
  datasets: [
    {
      label: `${label} Puanı`,
      data: [puan, 100 - puan],
      backgroundColor: ["rgba(59, 130, 246, 0.7)", "rgba(229, 231, 235, 0.2)"], // blue-500 ve gray-200
      borderColor: ["rgba(59, 130, 246, 1)", "rgba(229, 231, 235, 0.4)"],
      borderWidth: 1,
    },
  ],
});

// Ortak grafik ayarları
const pieOptions = {
  plugins: {
    datalabels: {
      color: "#fff",
      font: {
        weight: "bold",
        size: 14,
      },
      formatter: (value) => `${value}%`,
    },
    legend: {
      labels: {
        color: "#E5E7EB", // Tailwind gray-200
      },
    },
  },
};

const AnalysisPage = () => {
  const [report, setReport] = useState(null);
  const [urunIsmi, setUrunIsmi] = useState("");

  useEffect(() => {
    const storedReport = localStorage.getItem("analysisReport");
    const storedItem = localStorage.getItem("analysisItem");

    if (storedReport && storedItem) {
      setReport(JSON.parse(storedReport));
      setUrunIsmi(storedItem);
      localStorage.removeItem("analysisReport");
      localStorage.removeItem("analysisItem");
    }
  }, []);

  if (!report) {
    return (
      <div className="w-screen min-h-screen bg-zinc-900 text-white p-4 flex items-center justify-center">
        <p className="text-xl">Analiz raporu bulunamadı veya yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-zinc-900 text-white p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl relative">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-2">
          Ürün Analiz Raporu
        </h2>
        <h3 className="text-xl text-center text-zinc-300 mb-8">{urunIsmi}</h3>

        <div className="space-y-8">
          {/* Genel Pişmanlık Olasılığı */}
          <div className="bg-zinc-700 p-6 rounded-xl flex items-center gap-4">
            <h4 className="text-4xl font-extrabold text-blue-400">
              {report.pismanlikYuzdesi}%
            </h4>
            <p className="text-lg font-semibold">Genel Pişmanlık Olasılığı</p>
          </div>

          {/* Detaylı analizler */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* İhtiyaç Analizi */}
            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">İhtiyaç Analizi</h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(report.ihtiyacAnalizi.puan, "İhtiyaç")}
                  options={pieOptions}
                />
              </div>
              <p className="mt-4 text-zinc-300 text-sm">
                {report.ihtiyacAnalizi.aciklama}
              </p>
            </div>

            {/* Sürdürülebilirlik */}
            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">Sürdürülebilirlik</h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(
                    report.surdurulebilirlikPuani.puan,
                    "Sürdürülebilirlik"
                  )}
                  options={pieOptions}
                />
              </div>
              <p className="mt-4 text-zinc-300 text-sm">
                {report.surdurulebilirlikPuani.aciklama}
              </p>
            </div>

            {/* Kullanım Ömrü */}
            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">Kullanım Ömrü</h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(
                    report.kullanimOmru.puan,
                    "Kullanım Ömrü"
                  )}
                  options={pieOptions}
                />
              </div>
              <p className="mt-4 text-zinc-300 text-sm">
                {report.kullanimOmru.aciklama}
              </p>
            </div>

            {/* Fiyat / Performans */}
            <div className="bg-zinc-700 p-6 rounded-xl flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-4">Fiyat / Performans</h4>
              <div className="w-36 h-36">
                <Pie
                  data={createChartData(
                    report.fiyatPerformansYorumu.puan,
                    "Fiyat / Performans"
                  )}
                  options={pieOptions}
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

export default AnalysisPage;
